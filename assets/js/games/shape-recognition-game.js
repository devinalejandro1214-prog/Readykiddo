/* ─────────────────────────────────────────────────────────
   ReadyKiddo — Shape Recognition Game
   Match shapes to shape outlines with adaptive difficulty
   ───────────────────────────────────────────────────────── */

// Shape keys defining the 6 shapes for learning target
const SHAPE_KEYS = ['circle', 'square', 'triangle', 'star', 'rectangle', 'diamond'];

// PNG mapping for shapes: {color}-{shape}.png
// Use a neutral color (e.g., 'blue') for all answer choices to focus learning on shape
const SHAPE_PNG_COLOR = 'blue';

function getShapePNG(shape) {
  return `assets/images/games/shapes/${SHAPE_PNG_COLOR}-${shape}.png`;
}

const SHAPE_IMAGE_PRELOAD_CACHE = new Map();

function preloadShapeImages() {
  SHAPE_KEYS.map(getShapePNG).forEach(path => {
    if (SHAPE_IMAGE_PRELOAD_CACHE.has(path)) return;
    const img = new Image();
    img.decoding = 'async';
    img.loading = 'eager';
    img.src = path;
    const ready = img.decode ? img.decode().catch(() => {}) : Promise.resolve();
    SHAPE_IMAGE_PRELOAD_CACHE.set(path, { img, ready });
  });
}

// Branch order — used consistently everywhere
const BRANCH_ORDER = ['neutral', 'easy-medium', 'medium', 'medium-hard', 'hard'];

class ShapeRecognitionGame {
  constructor(context) {
    this.context = context;
    this.worldSlug = context.worldSlug;
    this.totalItems = 12;
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
    this.currentBatchShapes = [];
    this.matchedShapes = new Set();
    this.busy = false;
    this.ended = false;
    this.itemStartTime = 0;
    this.answerHistory = [];
    this.lastCorrectPhrase = null;
    this.lastWrongPhrase = null;
    this.shapeSeen = {};
  }

  /* ── Lifecycle ──────────────────────────────────────────── */

  async startGame() {
    this.render();
    preloadShapeImages();

    // Background & character are already loaded by game-shell, but refresh here in case
    const bgEl = document.getElementById('gameBackground');
    if (bgEl && this.context.backgroundPath) bgEl.src = this.context.backgroundPath;

    const charImg = document.getElementById('gameCharacterImg');
    if (charImg && this.context.characterPath) charImg.src = this.context.characterPath;

    const saved = this.loadProgress();
    if (saved) {
      const resumeRequested = new URLSearchParams(window.location.search).get('resume') === 'true';
      const shouldResume = resumeRequested || await this.showResumePrompt(saved);
      if (shouldResume) {
        this.restoreProgress(saved);
      } else {
        this.clearProgress();
      }
    }

    this.context.speak('match the shapes');
    this.renderProgress();
    setTimeout(() => this.presentNextItem(), 800);
  }

  saveProgress() {
    const state = {
      itemsShown: this.itemsShown,
      correctCount: this.correctCount,
      incorrectStreak: this.incorrectStreak,
      currentBranch: this.currentBranch,
      branchHistory: this.branchHistory,
      performance: this.performance,
      answerHistory: this.answerHistory,
      shapeSeen: this.shapeSeen,
      savedAt: Date.now()
    };
    localStorage.setItem(this.getProgressKey(), JSON.stringify(state));
  }

  loadProgress() {
    const raw = localStorage.getItem(this.getProgressKey());
    if (!raw) return null;
    try {
      const saved = JSON.parse(raw);
      if (!saved || typeof saved.itemsShown !== 'number') return null;
      return saved;
    } catch (e) {
      return null;
    }
  }

  clearProgress() {
    localStorage.removeItem(this.getProgressKey());
  }

  getProgressKey() {
    return `shapeRecognitionProgress_${this.context.childId}`;
  }

  restoreProgress(state) {
    this.itemsShown = Math.min(state.itemsShown || 0, this.totalItems);
    this.correctCount = state.correctCount || 0;
    this.incorrectStreak = state.incorrectStreak || 0;
    this.currentBranch = state.currentBranch || 'neutral';
    this.branchHistory = Array.isArray(state.branchHistory) ? state.branchHistory : [this.currentBranch];
    this.performance = state.performance || this.performance;
    this.answerHistory = Array.isArray(state.answerHistory) ? state.answerHistory : [];
    this.shapeSeen = state.shapeSeen || {};
  }

  showResumePrompt(saved) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'pause-overlay';
      overlay.innerHTML = `
        <div class="pause-panel">
          <h2>Welcome back!</h2>
          <p>You found ${saved.itemsShown} of ${this.totalItems} shapes. Continue where you left off?</p>
          <button class="pause-btn pause-btn-primary" id="resumeSavedShapeBtn">Continue</button>
          <button class="pause-btn pause-btn-secondary" id="startFreshShapeBtn">Start Fresh</button>
        </div>
      `;
      document.body.appendChild(overlay);

      document.getElementById('resumeSavedShapeBtn').addEventListener('click', () => {
        overlay.remove();
        resolve(true);
      });
      document.getElementById('startFreshShapeBtn').addEventListener('click', () => {
        overlay.remove();
        resolve(false);
      });
    });
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

  saveProgress() {
    const state = {
      itemsShown: this.itemsShown,
      correctCount: this.correctCount,
      incorrectStreak: this.incorrectStreak,
      currentBranch: this.currentBranch,
      branchHistory: this.branchHistory,
      performance: this.performance,
      answerHistory: this.answerHistory,
      shapeSeen: this.shapeSeen,
      savedAt: Date.now()
    };
    localStorage.setItem(this.getProgressKey(), JSON.stringify(state));
  }

  loadProgress() {
    const raw = localStorage.getItem(this.getProgressKey());
    if (!raw) return null;
    try {
      const saved = JSON.parse(raw);
      if (!saved || typeof saved.itemsShown !== 'number') return null;
      return saved;
    } catch (e) {
      return null;
    }
  }

  clearProgress() {
    localStorage.removeItem(this.getProgressKey());
  }

  getProgressKey() {
    return `shapeRecognitionProgress_${this.context.childId}`;
  }

  restoreProgress(state) {
    this.itemsShown = Math.min(state.itemsShown || 0, this.totalItems);
    this.correctCount = state.correctCount || 0;
    this.incorrectStreak = state.incorrectStreak || 0;
    this.currentBranch = state.currentBranch || 'neutral';
    this.branchHistory = Array.isArray(state.branchHistory) ? state.branchHistory : [this.currentBranch];
    this.performance = state.performance || this.performance;
    this.answerHistory = Array.isArray(state.answerHistory) ? state.answerHistory : [];
    this.shapeSeen = state.shapeSeen || {};
  }

  showResumePrompt(saved) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'pause-overlay';
      overlay.innerHTML = `
        <div class="pause-panel">
          <h2>Welcome back!</h2>
          <p>You found ${saved.itemsShown} of ${this.totalItems} shapes. Continue where you left off?</p>
          <button class="pause-btn pause-btn-primary" id="resumeSavedShapeBtn">Continue</button>
          <button class="pause-btn pause-btn-secondary" id="startFreshShapeBtn">Start Fresh</button>
        </div>
      `;
      document.body.appendChild(overlay);

      document.getElementById('resumeSavedShapeBtn').addEventListener('click', () => {
        overlay.remove();
        resolve(true);
      });
      document.getElementById('startFreshShapeBtn').addEventListener('click', () => {
        overlay.remove();
        resolve(false);
      });
    });
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

  getAvailableShapes() {
    let available = SHAPE_KEYS;
    if (this.currentBranch === 'neutral') available = SHAPE_KEYS.slice(0, 2);
    else if (this.currentBranch === 'easy-medium') available = SHAPE_KEYS.slice(0, 3);
    else if (this.currentBranch === 'medium') available = SHAPE_KEYS.slice(0, 4);
    else if (this.currentBranch === 'medium-hard') available = SHAPE_KEYS.slice(0, 5);
    return available;
  }

  /* ── Core Round Logic ───────────────────────────────────── */

  presentNextItem() {
    if (this.ended) return;
    if (this.itemsShown >= this.totalItems) return this.end();

    const isRound2 = this.itemsShown >= 6;
    const available = this.getAvailableShapes();
    this.currentBatchShapes = [...available].sort(() => Math.random() - 0.5);
    this.currentAnswers = this.currentBatchShapes;
    this.matchedShapes = new Set();
    this.currentItem = null;
    this.itemStartTime = Date.now();
    this.busy = false;

    // Track per-shape performance
    available.forEach(shape => {
      if (!this.performance.shapesAttempted[shape]) {
        this.performance.shapesAttempted[shape] = 0;
        this.performance.shapesCorrect[shape] = 0;
      }
    });

    this.renderShape();
    this.renderChoices();
    this.renderProgress();
    this.updateInstruction();
    
    if (isRound2) {
      this.context.speak('find all the shapes');
      this.callOutNextShape();
    } else {
      this.context.speak('match the shapes');
    }
  }

  /* ── Rendering ──────────────────────────────────────────── */

  renderShape() {
    const shapeStage = document.getElementById('shapeStage');
    if (!shapeStage) return;
    shapeStage.innerHTML = '';
    this.currentBatchShapes.forEach(shapeName => {
      const target = document.createElement('div');
      target.className = 'shape-target-zone';
      target.dataset.shape = shapeName;
      target.innerHTML = `<div class="shape-outline">${getShapeSVG(shapeName, 'medium')}</div>`;
      shapeStage.appendChild(target);
    });
  }

  renderChoices() {
    const choicesEl = document.getElementById('shapeChoices');
    if (!choicesEl) return;
    choicesEl.innerHTML = '';

    const shapesToShow = this.currentAnswers.filter(shapeName => !this.matchedShapes.has(shapeName));

    shapesToShow
      .forEach((shapeName, index) => {
      const choice = document.createElement('div');
      choice.dataset.index = String(index);
      choice.dataset.item = shapeName;

      const pngPath = getShapePNG(shapeName);
      const img = document.createElement('img');
      img.src = pngPath;
      img.alt = shapeName;
      img.decoding = 'async';
      img.loading = 'eager';
      img.fetchPriority = 'high';
      img.style.width = '100%';
      img.style.height = '100%';
      img.style.objectFit = 'contain';

      img.onerror = () => {
        img.style.display = 'none';
        const shapeSvg = getShapeSVG(shapeName, 'medium');
        choice.innerHTML = shapeSvg || `<span>${shapeName}</span>`;
      };

      choice.appendChild(img);
      choice.addEventListener('pointerdown', e => this.startPointerDrag(e, choice));
      choicesEl.appendChild(choice);
    });
  }

  updateInstruction() {
    const labels = {
      circle:    'Which one is round like a circle? 🔵',
      square:    'Which one is square? 🟦',
      triangle:  'Which one is shaped like a triangle? 🔺',
      star:      'Which one looks like a star? ⭐',
      rectangle: 'Which one is a rectangle? 📋'
    };
    labels.diamond = 'Which one looks like a diamond?';
    const el = document.getElementById('shapeInstruction');
    if (el) el.textContent = 'Drag each shape to its matching outline';
  }

  callOutNextShape() {
    const unmatched = this.currentBatchShapes.filter(shape => !this.matchedShapes.has(shape));
    if (!unmatched.length) return;

    this.targetShape = unmatched[Math.floor(Math.random() * unmatched.length)];

    setTimeout(() => this.context.speak(`find ${this.targetShape}`), 500);
  }

  /* ── Answer Handling ────────────────────────────────────── */

  startPointerDrag(event, choice) {
    if (this.busy || event.button > 0) return;
    event.preventDefault();
    const rect = choice.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    let activeTarget = null;

    const moveChoice = pointerEvent => {
      choice.style.left = `${pointerEvent.clientX - offsetX}px`;
      choice.style.top = `${pointerEvent.clientY - offsetY}px`;
      choice.style.pointerEvents = 'none';
      const target = document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY)?.closest('.shape-target-zone');
      choice.style.pointerEvents = '';
      if (target !== activeTarget) {
        document.querySelectorAll('.shape-target-zone.over').forEach(zone => zone.classList.remove('over'));
        activeTarget = target;
        if (activeTarget) activeTarget.classList.add('over');
      }
    };

    const resetChoice = () => {
      choice.classList.remove('dragging');
      choice.style.position = '';
      choice.style.left = '';
      choice.style.top = '';
      choice.style.width = '';
      choice.style.height = '';
      choice.style.zIndex = '';
      choice.style.pointerEvents = '';
      document.querySelectorAll('.shape-target-zone.over').forEach(zone => zone.classList.remove('over'));
    };

    const endDrag = pointerEvent => {
      document.removeEventListener('pointermove', moveChoice);
      document.removeEventListener('pointerup', endDrag);
      document.removeEventListener('pointercancel', cancelDrag);
      choice.style.pointerEvents = 'none';
      const target = document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY)?.closest('.shape-target-zone');
      choice.style.pointerEvents = '';
      resetChoice();
      if (target?.dataset?.shape) {
        this.handleShapeDrop(choice.dataset.item, target.dataset.shape, target, choice);
      }
    };

    const cancelDrag = () => {
      document.removeEventListener('pointermove', moveChoice);
      document.removeEventListener('pointerup', endDrag);
      document.removeEventListener('pointercancel', cancelDrag);
      resetChoice();
    };

    choice.classList.add('dragging');
    choice.style.position = 'fixed';
    choice.style.left = `${rect.left}px`;
    choice.style.top = `${rect.top}px`;
    choice.style.width = `${rect.width}px`;
    choice.style.height = `${rect.height}px`;
    choice.style.zIndex = '1000';

    document.addEventListener('pointermove', moveChoice);
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', cancelDrag);
  }

  handleShapeDrop(itemShape, targetShape, targetEl, choiceEl) {
    if (this.busy) return;
    const responseTime = Date.now() - this.itemStartTime;
    this.performance.responseTimes.push(responseTime);
    this.performance.totalItems++;
    this.performance.shapesAttempted[itemShape]++;

    const isRound2 = this.itemsShown >= 6;
    const isTargetMatch = itemShape === targetShape;
    const isRound2Correct = !isRound2 || itemShape === this.targetShape;
    const isCorrect = isTargetMatch && isRound2Correct;

    if (isCorrect) {
      this.busy = true;
      this.correctCount++;
      this.incorrectStreak = 0;
      this.performance.correctItems++;
      this.performance.shapesCorrect[itemShape]++;
      this.itemsShown++;
      this.answerHistory.push(true);
      this.matchedShapes.add(itemShape);
      if (choiceEl) choiceEl.classList.add('correct');
      targetEl.classList.add('matched');

      const correctPhrases = ['you got it', 'you found it', 'great job', 'yay'];
      const pick = this.randomPickAvoidRepeat(correctPhrases, this.lastCorrectPhrase);
      this.lastCorrectPhrase = pick;
      this.context.speak(pick);
      this.context.characterAnimation('cheer');

      setTimeout(() => {
        this.busy = false;
        if (this.itemsShown >= this.totalItems) {
          this.end();
        } else if (this.matchedShapes.size >= this.currentBatchShapes.length) {
          this.presentNextItem();
        } else {
          this.renderChoices();
          this.renderProgress();
          if (isRound2) {
            this.callOutNextShape();
          }
        }
      }, 550);
    } else {
      this.incorrectStreak++;
      if (choiceEl) {
        choiceEl.classList.add('wrong');
        setTimeout(() => choiceEl.classList.remove('wrong'), 450);
      }
      
      if (isRound2 && !isRound2Correct) {
        this.context.speak(`find ${this.targetShape}`);
      } else {
        const wrongPhrases = ['try again', 'aww man'];
        const wrongPick = this.randomPickAvoidRepeat(wrongPhrases, this.lastWrongPhrase);
        this.lastWrongPhrase = wrongPick;
        this.context.speak(wrongPick);
      }
      this.context.characterAnimation('nod');
    }
  }

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
      const correctPhrases = ['you got it', 'you found it', 'great job', 'yay'];
      const pick = this.randomPickAvoidRepeat(correctPhrases, this.lastCorrectPhrase);
      this.lastCorrectPhrase = pick;
      this.context.speak(pick);
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
      const wrongPhrases = ['try again', 'aww man'];
      const wrongPick = this.randomPickAvoidRepeat(wrongPhrases, this.lastWrongPhrase);
      this.lastWrongPhrase = wrongPick;
      this.context.speak(wrongPick);
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

  randomPickAvoidRepeat(options, lastPick) {
    if (options.length === 1) return options[0];
    const filtered = options.filter(option => option !== lastPick);
    const pool = filtered.length > 0 ? filtered : options;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  advanceBranchByProgress() {
    const targetIndex = Math.min(BRANCH_ORDER.length - 1, Math.floor(this.itemsShown / 2));
    const targetBranch = BRANCH_ORDER[targetIndex];

    if (targetBranch !== this.currentBranch) {
      this.currentBranch = targetBranch;
      this.branchHistory.push(this.currentBranch);
      this.context.speak('keep it up');
      this.context.characterAnimation('celebrate');
    }
  }

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
    this.clearProgress();

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
    if (this.ended) return;

    const existing = document.getElementById('pauseOverlay');
    if (existing) {
      existing.remove();
      this.busy = false;
      return;
    }

    this.busy = true;

    const overlay = document.createElement('div');
    overlay.className = 'pause-overlay';
    overlay.id = 'pauseOverlay';
    overlay.innerHTML = `
      <div class="pause-panel">
        <h2>Paused</h2>
        <button class="pause-btn pause-btn-primary" id="pauseResumeBtn">Resume</button>
        <button class="pause-btn pause-btn-secondary" id="pauseSaveExitBtn">Save &amp; Exit</button>
      </div>
    `;
    document.body.appendChild(overlay);

    document.getElementById('pauseResumeBtn').addEventListener('click', () => {
      overlay.remove();
      this.busy = false;
    });

    document.getElementById('pauseSaveExitBtn').addEventListener('click', () => {
      this.saveProgress();
      window.location.href = 'world-reveal.html';
    });
  }
}

window.ShapeRecognitionGame = ShapeRecognitionGame;
