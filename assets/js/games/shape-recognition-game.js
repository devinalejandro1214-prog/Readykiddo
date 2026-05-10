/* ─────────────────────────────────────────────────────────
   ReadyKiddo — Shape Recognition Game
   Match items to shape outlines with adaptive difficulty
   ───────────────────────────────────────────────────────── */

/* ── All items organized by the shape they look like ─────
   Used to select a correct item that matches the shown shape,
   and to exclude matching items from wrong-answer pool.
   ───────────────────────────────────────────────────────── */
const SHAPE_ITEMS_MAP = {
  circle:    ['planet', 'lollipop', 'beachball', 'gummy', 'fruit', 'cupcake'],
  triangle:  ['rocket', 'leaf', 'crown', 'shell'],
  star:      ['star', 'starfish', 'flower'],
  square:    ['squareTile'],
  rectangle: ['shield', 'brush', 'note']
};

// Every item across all worlds (used to build wrong-answer pool)
const ALL_ITEMS = [
  'star', 'planet', 'rocket',
  'lollipop', 'gummy', 'cupcake',
  'fruit', 'leaf', 'flower',
  'starfish', 'shell', 'beachball',
  'gem', 'shield', 'crown',
  'paintblob', 'brush', 'note',
  'squareTile'
];

// Branch order — used consistently everywhere
const BRANCH_ORDER = ['neutral', 'easy-medium', 'medium', 'medium-hard', 'hard'];

class ShapeRecognitionGame {
  constructor(context) {
    this.context = context;
    this.worldSlug = context.worldSlug;
    this.totalItems = 10;
    this.itemsShown = 0;
    this.correctCount = 0;
    this.incorrectStreak = 0;
    this.currentBranch = 'neutral';
    this.branchHistory = [this.currentBranch];
    this.performance = {
      correctItems: 0,
      totalItems: 0,
      responseTimes: [],
      shapesAttempted: {},
      shapesCorrect: {},
      strengthAreas: [],
      opportunityAreas: []
    };
    this.currentItem = null;   // The correct answer item name
    this.currentShape = null;  // The shape being asked about
    this.currentAnswers = [];  // All 4 answer choices
    this.busy = false;
    this.ended = false;
    this.itemStartTime = 0;
    this.answerHistory = [];
  }

  /* ── Lifecycle ──────────────────────────────────────────── */

  async startGame() {
    this.render();

    // Background & character are already loaded by game-shell, but refresh here in case
    const bgEl = document.getElementById('gameBackground');
    if (bgEl && this.context.backgroundPath) bgEl.src = this.context.backgroundPath;

    const charImg = document.getElementById('gameCharacterImg');
    if (charImg && this.context.characterPath) charImg.src = this.context.characterPath;

    await this.context.speak(`Hi ${this.context.childName}! Let's find some shapes!`);
    this.renderProgress();
    setTimeout(() => this.presentNextItem(), 800);
  }

  /* ── DOM Setup ──────────────────────────────────────────── */

  render() {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
      <div class="shape-game">
        <div class="shape-hud">
          <button class="hud-btn" id="shapePauseBtn" aria-label="Pause">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1.5"/>
              <rect x="14" y="5" width="4" height="14" rx="1.5"/>
            </svg>
          </button>
          <div class="shape-progress" id="shapeProgress"></div>
        </div>

        <div class="shape-stage" id="shapeStage"></div>

        <div class="shape-instruction" id="shapeInstruction">
          Find the matching shape!
        </div>

        <div class="shape-choices" id="shapeChoices"></div>
        <div class="shape-feedback" id="shapeFeedback" style="display:none;"></div>
      </div>
    `;

    document.getElementById('shapePauseBtn').addEventListener('click', () => this.togglePause());
  }

  renderProgress() {
    const progressEl = document.getElementById('shapeProgress');
    if (!progressEl) return;
    progressEl.innerHTML = '';
    for (let i = 0; i < this.totalItems; i++) {
      const pip = document.createElement('div');
      pip.className = 'shape-pip';
      if (i < this.itemsShown) pip.classList.add(this.answerHistory[i] ? 'correct' : 'incorrect');
      else if (i === this.itemsShown) pip.classList.add('current');
      progressEl.appendChild(pip);
    }
  }

  /* ── Shape Selection ────────────────────────────────────── */

  /**
   * Returns a shape name based on current difficulty branch.
   * Neutral  → circle | square  (2 simplest shapes)
   * Easy-Med → + triangle       (3 shapes)
   * Medium   → + star           (4 shapes)
   * Hard+    → all 5 shapes
   */
  selectShape() {
    const all = ['circle', 'square', 'triangle', 'star', 'rectangle'];
    if (this.currentBranch === 'neutral')       return all[Math.floor(Math.random() * 2)];
    if (this.currentBranch === 'easy-medium')   return all[Math.floor(Math.random() * 3)];
    if (this.currentBranch === 'medium')        return all[Math.floor(Math.random() * 4)];
    return all[Math.floor(Math.random() * 5)];
  }

  /* ── Core Round Logic ───────────────────────────────────── */

  presentNextItem() {
    if (this.ended) return;
    if (this.itemsShown >= this.totalItems) return this.end();

    // Evaluate difficulty every 3 items (not on first item)
    if (this.itemsShown > 0 && this.itemsShown % 3 === 0) {
      this.evaluateBranch();
    }

    const shape = this.selectShape();
    const worldItems = getWorldItems(this.worldSlug);

    /* ── Pick CORRECT answer ──────────────────────────────
       The correct item must LOOK LIKE the current shape.
       Prefer an item from the child's selected world.
       Fall back to any global item that matches the shape.
       ───────────────────────────────────────────────────── */
    const matchingItems = SHAPE_ITEMS_MAP[shape] || [];
    const worldMatches = worldItems.filter(item => matchingItems.includes(item));

    let correctItem;
    if (worldMatches.length > 0) {
      correctItem = worldMatches[Math.floor(Math.random() * worldMatches.length)];
    } else {
      // No world item matches this shape — use any global item that does
      correctItem = matchingItems[Math.floor(Math.random() * matchingItems.length)];
    }

    /* ── Pick WRONG answers ───────────────────────────────
       Wrong items must NOT look like the current shape.
       Prefer world items first, then fill from the global pool.
       ───────────────────────────────────────────────────── */
    const nonMatchingAll = ALL_ITEMS.filter(
      item => item !== correctItem && !matchingItems.includes(item)
    );

    // Shuffle the wrong-answer pool
    nonMatchingAll.sort(() => Math.random() - 0.5);
    const wrongAnswers = nonMatchingAll.slice(0, 3);

    // Safety: if somehow we don't have 3 wrongs, skip round
    if (wrongAnswers.length < 3) {
      console.warn('[ShapeGame] Not enough wrong answers, regenerating...');
      return this.presentNextItem();
    }

    // Shuffle all 4 choices so correct item isn't always first
    this.currentAnswers = [correctItem, ...wrongAnswers].sort(() => Math.random() - 0.5);
    this.currentShape = shape;
    this.currentItem = correctItem;
    this.itemStartTime = Date.now();
    this.busy = false;

    // Track per-shape performance
    if (!this.performance.shapesAttempted[shape]) {
      this.performance.shapesAttempted[shape] = 0;
      this.performance.shapesCorrect[shape] = 0;
    }
    this.performance.shapesAttempted[shape]++;

    this.renderShape();
    this.renderChoices();
    this.renderProgress();
    this.updateInstruction(shape);
  }

  /* ── Rendering ──────────────────────────────────────────── */

  renderShape() {
    const shapeStage = document.getElementById('shapeStage');
    if (!shapeStage) return;
    const shapeSvg = getShapeSVG(this.currentShape, 'large');
    shapeStage.innerHTML = `<div class="shape-outline">${shapeSvg}</div>`;
  }

  renderChoices() {
    const choicesEl = document.getElementById('shapeChoices');
    if (!choicesEl) return;
    choicesEl.innerHTML = '';

    this.currentAnswers.forEach((itemName, index) => {
      const choice = document.createElement('button');
      choice.className = 'shape-choice';
      choice.dataset.index = String(index);
      choice.dataset.item = itemName;

      // Render all choices in a neutral blue so children judge by SHAPE, not color
      const itemSvg = getItemSVG(itemName, 'blue');
      choice.innerHTML = itemSvg || `<span>${itemName}</span>`;

      choice.addEventListener('click', () => this.handleAnswer(itemName, index));
      choicesEl.appendChild(choice);
    });
  }

  updateInstruction(shape) {
    const labels = {
      circle:    'Which one is round like a circle? 🔵',
      square:    'Which one is square? 🟦',
      triangle:  'Which one is shaped like a triangle? 🔺',
      star:      'Which one looks like a star? ⭐',
      rectangle: 'Which one is a rectangle? 📋'
    };
    const el = document.getElementById('shapeInstruction');
    if (el) el.textContent = labels[shape] || 'Find the matching shape!';
  }

  /* ── Answer Handling ────────────────────────────────────── */

  handleAnswer(itemName, index) {
    if (this.busy) return;

    this.busy = true;
    const responseTime = Date.now() - this.itemStartTime;
    this.performance.responseTimes.push(responseTime);

    const isCorrect = itemName === this.currentItem;
    const choiceBtn = document.querySelector(`.shape-choice[data-index="${index}"]`);

    if (isCorrect) {
      this.correctCount++;
      this.incorrectStreak = 0;
      this.performance.correctItems++;
      this.performance.shapesCorrect[this.currentShape]++;

      if (choiceBtn) choiceBtn.classList.add('correct');

      // Don't await — speech plays while visual feedback shows
      this.context.speak(`That's right! ${this.currentShape}!`);
      this.context.characterAnimation('cheer');

    } else {
      this.incorrectStreak++;

      if (choiceBtn) choiceBtn.classList.add('wrong');

      // Highlight the correct answer so the child can see it
      const correctBtn = document.querySelector(
        `.shape-choice[data-item="${this.currentItem}"]`
      );
      if (correctBtn) correctBtn.classList.add('correct');

      // Don't await — speech plays while showing the correct answer
      this.context.speak(`Look at the shape more carefully!`);
      this.context.characterAnimation('nod');
    }

    this.answerHistory.push(isCorrect);
    this.itemsShown++;
    this.performance.totalItems++;

    // Show feedback for 1.4s so child can see correct answer highlighted
    setTimeout(() => {
      document.querySelectorAll('.shape-choice').forEach(btn => {
        btn.classList.remove('correct', 'wrong');
      });
      this.presentNextItem();
    }, 1400);
  }

  /* ── Branch / Difficulty ────────────────────────────────── */

  evaluateBranch() {
    if (this.itemsShown === 0) return;
    const accuracy = this.correctCount / this.itemsShown;

    // Always look up position in the canonical branch order, not in history
    const currentIndex = BRANCH_ORDER.indexOf(this.currentBranch);

    if (accuracy >= 0.8 && currentIndex < BRANCH_ORDER.length - 1) {
      this.currentBranch = BRANCH_ORDER[currentIndex + 1];
      this.branchHistory.push(this.currentBranch);
      this.context.speak(`Great job! Let's try harder shapes!`);
      this.context.characterAnimation('celebrate');

    } else if (accuracy < 0.5 && currentIndex > 0) {
      this.currentBranch = BRANCH_ORDER[currentIndex - 1];
      this.branchHistory.push(this.currentBranch);
      this.context.speak(`Let's practice easier shapes first!`);
      this.context.characterAnimation('sway');
    }
  }

  /* ── End Game ───────────────────────────────────────────── */

  async end() {
    this.ended = true;

    const accuracy = this.performance.totalItems > 0
      ? this.performance.correctItems / this.performance.totalItems
      : 0;

    const avgResponseTime = this.performance.responseTimes.length > 0
      ? Math.round(
          this.performance.responseTimes.reduce((a, b) => a + b, 0) /
          this.performance.responseTimes.length
        )
      : 0;

    // Rank shapes by accuracy
    const shapeAccuracy = {};
    for (const shape in this.performance.shapesAttempted) {
      const attempted = this.performance.shapesAttempted[shape];
      const correct = this.performance.shapesCorrect[shape] || 0;
      shapeAccuracy[shape] = attempted > 0 ? correct / attempted : 0;
    }

    const sorted = Object.entries(shapeAccuracy).sort((a, b) => b[1] - a[1]);
    this.performance.strengthAreas = sorted.slice(0, 2).map(([s]) => s);
    this.performance.opportunityAreas = sorted.slice(-2).map(([s]) => s);

    await this.context.speak(`Amazing work, ${this.context.childName}! You're a shape expert!`);
    this.context.characterAnimation('dance');

    this.context.saveSession({
      gameType: 'shape-recognition',
      accuracy: parseFloat(accuracy.toFixed(2)),
      finalBranch: this.currentBranch,
      correctItems: this.performance.correctItems,
      totalItems: this.performance.totalItems,
      avgResponseTime: avgResponseTime,
      branchPath: this.branchHistory.join(' → '),
      shapesAttempted: this.performance.shapesAttempted,
      shapesCorrect: this.performance.shapesCorrect,
      strengthAreas: this.performance.strengthAreas,
      opportunityAreas: this.performance.opportunityAreas,
      nextGameRecommendation: 'color-sort'
    });

    await this.showEndScreen(accuracy);
  }

  async showEndScreen(accuracy) {
    const gameArea = document.getElementById('gameArea');
    const stars = Math.min(3, Math.ceil(accuracy * 3));

    gameArea.innerHTML = `
      <div class="shape-end-card">
        <div class="shape-end-panel">
          <h1>🎉 Amazing!</h1>
          <p>You learned about shapes, ${this.context.childName}!</p>
          <div class="shape-stars">
            ${[0, 1, 2].map(i => `
              <svg class="shape-star${i < stars ? ' lit' : ''}" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            `).join('')}
          </div>
          <p class="shape-accuracy">${Math.round(accuracy * 100)}% Correct</p>
          <button class="shape-next-btn" id="nextGameBtn">Play Again</button>
        </div>
      </div>
    `;

    document.getElementById('nextGameBtn').addEventListener('click', () => {
      window.location.href = 'game-loader.html?game=color-sort';
    });
  }

  togglePause() {
    alert('Game paused!');
  }
}

window.ShapeRecognitionGame = ShapeRecognitionGame;
