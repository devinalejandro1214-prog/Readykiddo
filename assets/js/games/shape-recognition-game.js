/* ─────────────────────────────────────────────────────────
   ReadyKiddo — Shape Recognition Game
   12 rounds total: Round 1 (1-6) free match, Round 2 (7-12) callout match
   All 6 shapes + all 6 outline targets shown at once both rounds
   ───────────────────────────────────────────────────────── */

const SHAPE_KEYS = ['circle', 'square', 'triangle', 'star', 'rectangle', 'diamond'];

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
    SHAPE_IMAGE_PRELOAD_CACHE.set(path, img);
  });
}

class ShapeRecognitionGame {
  constructor(context) {
    this.context   = context;
    this.worldSlug = context.worldSlug;

    // Game state
    this.totalItems   = 12;   // 6 Round-1 + 6 Round-2
    this.itemsShown   = 0;    // increments per correct match
    this.correctCount = 0;
    this.busy  = false;
    this.ended = false;

    // Current round state
    this.matchedShapes = new Set(); // shapes matched in current round
    this.targetShape   = null;      // Round 2: specific shape called out

    // Progress tracking
    this.answerHistory = [];
    this.itemStartTime = 0;
    this.performance = {
      correctItems: 0,
      totalItems:   0,
      responseTimes: [],
      shapesAttempted: {},
      shapesCorrect:   {},
      strengthAreas:    [],
      opportunityAreas: []
    };
    SHAPE_KEYS.forEach(s => {
      this.performance.shapesAttempted[s] = 0;
      this.performance.shapesCorrect[s]   = 0;
    });
  }

  /* ── Lifecycle ──────────────────────────────────────────── */

  async startGame() {
    this.render();
    preloadShapeImages();

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

    this.renderProgress();
    setTimeout(() => this.beginRound(), 600);
  }

  /* ── Round Management ───────────────────────────────────── */

  beginRound() {
    if (this.ended) return;
    if (this.itemsShown >= this.totalItems) return this.end();

    const isRound2 = this.itemsShown >= 6;

    // Reset per-round state
    this.matchedShapes = new Set();
    this.targetShape   = null;
    this.itemStartTime = Date.now();
    this.busy = false;

    // Render all 6 shape outlines (targets) and all 6 shape tiles (draggables)
    this.renderTargets();
    const stageEl = document.getElementById('shapeStage');
    if (stageEl) stageEl.style.display = isRound2 ? 'none' : '';
    this.renderChoices();
    this.renderProgress();
    this.updateInstruction(isRound2 ? 'Listen for the shape to match!' : 'Drag each shape to its matching outline!');

    if (isRound2) {
      this.context.speak('match the shapes');
      setTimeout(() => this.callOutNextShape(), 1200);
    } else {
      this.context.speak('match the shapes');
    }
  }

  callOutNextShape() {
    const unmatched = SHAPE_KEYS.filter(s => !this.matchedShapes.has(s));
    if (!unmatched.length) return;
    this.targetShape = unmatched[Math.floor(Math.random() * unmatched.length)];

    // Highlight the called-out choice tile
    document.querySelectorAll('.shape-choice').forEach(el => {
      el.classList.toggle('called-out', el.dataset.item === this.targetShape);
    });

    this.updateInstruction(`Find the ${this.targetShape}!`);
    this.context.speak(`find ${this.targetShape}`);
  }

  /* ── Rendering ──────────────────────────────────────────── */

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
        <div class="shape-instruction" id="shapeInstruction">Drag each shape to its matching outline!</div>
        <div class="shape-choices" id="shapeChoices"></div>
        <div class="shape-feedback" id="shapeFeedback" style="display:none;"></div>
      </div>
    `;
    document.getElementById('shapePauseBtn').addEventListener('click', () => this.togglePause());
  }

  renderTargets() {
    const stage = document.getElementById('shapeStage');
    if (!stage) return;
    stage.innerHTML = '';

    SHAPE_KEYS.forEach(shapeName => {
      const target = document.createElement('div');
      target.className = 'shape-target-zone';
      target.dataset.shape = shapeName;

      if (this.matchedShapes.has(shapeName)) {
        target.classList.add('matched');
      }

      target.innerHTML = `<div class="shape-outline">${getShapeSVG(shapeName, 'medium')}</div>`;
      stage.appendChild(target);
    });
  }

  renderChoices() {
    const choicesEl = document.getElementById('shapeChoices');
    if (!choicesEl) return;
    choicesEl.innerHTML = '';

    // Shuffle tiles so they never start aligned with the outline targets
    const shuffled = [...SHAPE_KEYS].filter(s => !this.matchedShapes.has(s))
      .sort(() => Math.random() - 0.5);

    shuffled.forEach((shapeName, index) => {
      const choice = document.createElement('div');
      choice.className = 'shape-choice';
      choice.dataset.index = String(index);
      choice.dataset.item  = shapeName;

      const img = document.createElement('img');
      img.src = getShapePNG(shapeName);
      img.alt = shapeName;
      img.decoding = 'async';
      img.loading = 'eager';
      img.fetchPriority = 'high';
      img.style.cssText = 'width:100%;height:100%;object-fit:contain;';
      img.onerror = () => {
        img.remove();
        choice.innerHTML = getShapeSVG(shapeName, 'medium') || `<span>${shapeName}</span>`;
      };
      choice.appendChild(img);
      const isRound2 = this.itemsShown >= 6;
      if (!isRound2) {
        choice.addEventListener('pointerdown', e => this.startPointerDrag(e, choice));
      } else {
        choice.addEventListener('pointerdown', e => this.handleTapSelect(e, choice));
      }
      choicesEl.appendChild(choice);
    });

    // Re-apply callout highlight after re-render
    if (this.targetShape) {
      document.querySelectorAll('.shape-choice').forEach(el => {
        el.classList.toggle('called-out', el.dataset.item === this.targetShape);
      });
    }
  }

  renderProgress() {
    const el = document.getElementById('shapeProgress');
    if (!el) return;
    el.innerHTML = '';
    for (let i = 0; i < this.totalItems; i++) {
      const pip = document.createElement('div');
      pip.className = 'shape-pip';
      if (i < this.answerHistory.length) {
        pip.classList.add(this.answerHistory[i] ? 'correct' : 'incorrect');
      } else if (i === this.itemsShown) {
        pip.classList.add('current');
      }
      el.appendChild(pip);
    }
  }

  updateInstruction(text) {
    const el = document.getElementById('shapeInstruction');
    if (el) el.textContent = text;
  }

  /* ── Drag & Drop ────────────────────────────────────────── */

  startPointerDrag(event, choice) {
    if (this.busy || event.button > 0) return;
    event.preventDefault();

    const rect = choice.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    let activeTarget = null;

    const moveChoice = e => {
      choice.style.left = `${e.clientX - offsetX}px`;
      choice.style.top  = `${e.clientY - offsetY}px`;
      choice.style.pointerEvents = 'none';
      const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('.shape-target-zone');
      choice.style.pointerEvents = '';
      if (target !== activeTarget) {
        document.querySelectorAll('.shape-target-zone.over').forEach(z => z.classList.remove('over'));
        activeTarget = target;
        if (activeTarget) activeTarget.classList.add('over');
      }
    };

    const resetChoice = () => {
      choice.classList.remove('dragging');
      choice.style.position = choice.style.left = choice.style.top =
        choice.style.width = choice.style.height = choice.style.zIndex =
        choice.style.pointerEvents = '';
      document.querySelectorAll('.shape-target-zone.over').forEach(z => z.classList.remove('over'));
    };

    const endDrag = e => {
      document.removeEventListener('pointermove', moveChoice);
      document.removeEventListener('pointerup', endDrag);
      document.removeEventListener('pointercancel', cancelDrag);
      choice.style.pointerEvents = 'none';
      const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('.shape-target-zone');
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
    choice.style.top  = `${rect.top}px`;
    choice.style.width  = `${rect.width}px`;
    choice.style.height = `${rect.height}px`;
    choice.style.zIndex = '1000';

    document.addEventListener('pointermove', moveChoice);
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', cancelDrag);
  }

  handleTapSelect(event, choice) {
    if (this.busy) return;
    this.handleShapeDrop(choice.dataset.item, choice.dataset.item, null, choice);
  }

  /* ── Answer Handling ────────────────────────────────────── */

  handleShapeDrop(itemShape, targetShape, targetEl, choiceEl) {
    if (this.busy) return;

    const isRound2      = this.itemsShown >= 6;
    const isShapeMatch  = itemShape === targetShape;
    const isCallout     = !isRound2 || itemShape === this.targetShape;
    const isCorrect     = isShapeMatch && isCallout;

    this.performance.totalItems++;
    this.performance.shapesAttempted[itemShape]++;

    if (isCorrect) {
      this.busy = true;

      const correctPhrases = ['you got it', 'you found it', 'great job', 'yay'];
      const pick = correctPhrases[Math.floor(Math.random() * correctPhrases.length)];
      this.context.speak(pick);
      this.context.characterAnimation('cheer');

      this.correctCount++;
      this.performance.correctItems++;
      this.performance.shapesCorrect[itemShape]++;
      this.answerHistory.push(true);
      this.itemsShown++;
      this.matchedShapes.add(itemShape);

      if (choiceEl) choiceEl.classList.add('correct');
      if (targetEl) targetEl.classList.add('matched');
      this.renderProgress();

      setTimeout(() => {
        this.busy = false;

        if (this.itemsShown >= this.totalItems) {
          return this.end();
        }

        // If all 6 shapes in this round matched, begin next round
        if (this.matchedShapes.size >= 6) {
          return this.beginRound();
        }

        // Still shapes left in this round — re-render choices, call out next
        this.renderChoices();
        this.renderProgress();
        if (isRound2) this.callOutNextShape();
      }, 500);

    } else {
      if (choiceEl) {
        choiceEl.classList.add('wrong');
        setTimeout(() => choiceEl.classList.remove('wrong'), 450);
      }
      const wrongPhrases = ['try again', 'aww man'];
      this.context.speak(wrongPhrases[Math.floor(Math.random() * wrongPhrases.length)]);
      // Remind them of the target in Round 2
      if (isRound2 && !isCallout) {
        this.updateInstruction(`Find the ${this.targetShape}!`);
      }
    }
  }

  /* ── End ────────────────────────────────────────────────── */

  async end() {
    this.ended = true;
    this.clearProgress();

    const accuracy = this.performance.totalItems > 0
      ? this.performance.correctItems / this.performance.totalItems : 0;

    const sorted = Object.entries(this.performance.shapesAttempted)
      .map(([s, att]) => [s, att > 0 ? this.performance.shapesCorrect[s]/att : 0])
      .sort((a,b) => b[1]-a[1]);
    this.performance.strengthAreas    = sorted.slice(0,2).map(([s])=>s);
    this.performance.opportunityAreas = sorted.slice(-2).map(([s])=>s);

    this.context.saveSession({
      gameType: 'shape-recognition',
      accuracy: parseFloat(accuracy.toFixed(2)),
      correctItems: this.performance.correctItems,
      totalItems:   this.performance.totalItems,
      shapesAttempted: this.performance.shapesAttempted,
      shapesCorrect:   this.performance.shapesCorrect,
      strengthAreas:    this.performance.strengthAreas,
      opportunityAreas: this.performance.opportunityAreas,
      nextGameRecommendation: 'color-sort'
    });

    await this.showEndScreen(accuracy);
  }

  async showEndScreen(accuracy) {
    const gameArea = document.getElementById('gameArea');
    const stars = Math.min(3, Math.round(accuracy * 3));

    // Celebration audio
    const celebClips = ['yay', 'impressive', 'great job'];
    this.context.speak(celebClips[Math.min(stars, celebClips.length) - 1] || 'yay');
    this.context.characterAnimation('celebrate');

    gameArea.innerHTML = `
      <div class="shape-end-card">
        <div class="shape-end-panel">
          <h1>🎉 Amazing!</h1>
          <p>You matched all the shapes!</p>
          <div class="shape-stars">
            ${[0,1,2].map(i=>`<svg class="shape-star${i<stars?' lit':''}" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>`).join('')}
          </div>
          <p class="shape-accuracy">${Math.round(accuracy*100)}% Correct</p>
          <button class="shape-next-btn" id="nextGameBtn">Next Game ▶</button>
        </div>
      </div>
    `;
    document.getElementById('nextGameBtn').addEventListener('click', () => {
      this.context.goToNextGame('space-defender');
    });
  }

  /* ── Save / Load ────────────────────────────────────────── */

  saveProgress() {
    const state = {
      itemsShown: this.itemsShown,
      correctCount: this.correctCount,
      performance:  this.performance,
      answerHistory: this.answerHistory,
      savedAt: Date.now()
    };
    localStorage.setItem(this.getProgressKey(), JSON.stringify(state));
  }

  loadProgress() {
    const raw = localStorage.getItem(this.getProgressKey());
    if (!raw) return null;
    try {
      const s = JSON.parse(raw);
      if (!s || typeof s.itemsShown !== 'number') return null;
      return s;
    } catch(e) { return null; }
  }

  restoreProgress(state) {
    this.itemsShown   = Math.min(state.itemsShown  || 0, this.totalItems);
    this.correctCount = state.correctCount || 0;
    this.performance  = state.performance  || this.performance;
    this.answerHistory = Array.isArray(state.answerHistory) ? state.answerHistory : [];
  }

  clearProgress() { localStorage.removeItem(this.getProgressKey()); }
  getProgressKey() { return `shapeRecognitionProgress_${this.context.childId}`; }

  showResumePrompt(saved) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'pause-overlay';
      overlay.innerHTML = `
        <div class="pause-panel">
          <h2>Welcome back!</h2>
          <p>You matched ${saved.itemsShown} of ${this.totalItems} shapes. Continue?</p>
          <button class="pause-btn pause-btn-primary" id="resumeSavedShapeBtn">Continue</button>
          <button class="pause-btn pause-btn-secondary" id="startFreshShapeBtn">Start Fresh</button>
        </div>
      `;
      document.body.appendChild(overlay);
      document.getElementById('resumeSavedShapeBtn').addEventListener('click', () => { overlay.remove(); resolve(true); });
      document.getElementById('startFreshShapeBtn').addEventListener('click',  () => { overlay.remove(); resolve(false); });
    });
  }

  /* ── Pause ──────────────────────────────────────────────── */

  togglePause() {
    if (this.ended) return;
    const existing = document.getElementById('pauseOverlay');
    if (existing) { existing.remove(); this.busy = false; return; }

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
    document.getElementById('pauseResumeBtn').addEventListener('click', () => { overlay.remove(); this.busy = false; });
    document.getElementById('pauseSaveExitBtn').addEventListener('click', () => {
      this.saveProgress();
      window.location.href = 'world-reveal.html';
    });
  }
}

window.ShapeRecognitionGame = ShapeRecognitionGame;
