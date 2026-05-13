/* ─────────────────────────────────────────────────────────
   ReadyKiddo — Color Sort Game
   12 rounds total: Round 1 (1-6) free match, Round 2 (7-12) callout match
   All 6 colors + all 6 containers shown at once both rounds
   ───────────────────────────────────────────────────────── */

// World-aware PNG mappings for color learning targets.
const COLOR_PNG_MAP = {
  studio: {
    red:    { item: 'paintblob', path: 'assets/images/games/color-sort/items/studio-red-paintblob.png' },
    blue:   { item: 'brush',    path: 'assets/images/games/color-sort/items/studio-blue-brush.png' },
    yellow: { item: 'note',     path: 'assets/images/games/color-sort/items/studio-yellow-note.png' },
    orange: { item: 'paintblob',path: 'assets/images/games/color-sort/items/studio-orange-paintblob.png' },
    green:  { item: 'brush',    path: 'assets/images/games/color-sort/items/studio-green-brush.png' },
    purple: { item: 'note',     path: 'assets/images/games/color-sort/items/studio-purple-note.png' },
  },
  jungle: {
    red:    { item: 'fruit',  path: 'assets/images/games/color-sort/items/jungle-red-fruit.png' },
    blue:   { item: 'fruit',  path: 'assets/images/games/color-sort/items/jungle-blue-fruit.png' },
    yellow: { item: 'flower', path: 'assets/images/games/color-sort/items/jungle-yellow-flower.png' },
    orange: { item: 'leaf',   path: 'assets/images/games/color-sort/items/jungle-orange-leaf.png' },
    green:  { item: 'leaf',   path: 'assets/images/games/color-sort/items/jungle-green-leaf.png' },
    purple: { item: 'flower', path: 'assets/images/games/color-sort/items/jungle-purple-flower.png' },
  },
  'candy-land': {
    red:    { item: 'cupcake',  path: 'assets/images/games/color-sort/items/candy-land-red-cupcake.png' },
    blue:   { item: 'lollipop', path: 'assets/images/games/color-sort/items/candy-land-blue-lollipop.png' },
    yellow: { item: 'gummy',    path: 'assets/images/games/color-sort/items/candy-land-yellow-gummy.png' },
    orange: { item: 'lollipop', path: 'assets/images/games/color-sort/items/candy-land-orange-lollipop.png' },
    green:  { item: 'gummy',    path: 'assets/images/games/color-sort/items/candy-land-green-gummy.png' },
    purple: { item: 'cupcake',  path: 'assets/images/games/color-sort/items/candy-land-purple-cupcake.png' },
  },
  castle: {
    red:    { item: 'crown',  path: 'assets/images/games/color-sort/items/castle-red-crown.png' },
    blue:   { item: 'gem',    path: 'assets/images/games/color-sort/items/castle-blue-gem.png' },
    yellow: { item: 'gem',    path: 'assets/images/games/color-sort/items/castle-yellow-gem.png' },
    orange: { item: 'shield', path: 'assets/images/games/color-sort/items/castle-orange-shield.png' },
    green:  { item: 'shield', path: 'assets/images/games/color-sort/items/castle-green-shield.png' },
    purple: { item: 'crown',  path: 'assets/images/games/color-sort/items/castle-purple-crown.png' },
  },
  space: {
    red:    { item: 'star',   path: 'assets/images/games/color-sort/items/space-blue-star.png' },
    blue:   { item: 'planet', path: 'assets/images/games/color-sort/items/space-blue-planet.png' },
    yellow: { item: 'star',   path: 'assets/images/games/color-sort/items/space-yellow-star.png' },
    orange: { item: 'star',   path: 'assets/images/games/color-sort/items/space-orange-star.png' },
    green:  { item: 'rocket', path: 'assets/images/games/color-sort/items/space-green-rocket.png' },
    purple: { item: 'planet', path: 'assets/images/games/color-sort/items/space-purple-planet.png' },
  },
  beach: {
    red:    { item: 'starfish',  path: 'assets/images/games/color-sort/items/beach-green-starfish.png' },
    blue:   { item: 'shell',     path: 'assets/images/games/color-sort/items/beach-purple-shell.png' },
    yellow: { item: 'beachball', path: 'assets/images/games/color-sort/items/beach-orange-beachball.png' },
    orange: { item: 'beachball', path: 'assets/images/games/color-sort/items/beach-orange-beachball.png' },
    green:  { item: 'starfish',  path: 'assets/images/games/color-sort/items/beach-green-starfish.png' },
    purple: { item: 'shell',     path: 'assets/images/games/color-sort/items/beach-purple-shell.png' },
  }
};

const ALL_COLORS = ['red', 'blue', 'yellow', 'orange', 'green', 'purple'];

const IMAGE_PRELOAD_CACHE = new Map();

function preloadImages(paths) {
  paths.filter(Boolean).forEach(path => {
    if (IMAGE_PRELOAD_CACHE.has(path)) return;
    const img = new Image();
    img.decoding = 'async';
    img.loading = 'eager';
    img.src = path;
    IMAGE_PRELOAD_CACHE.set(path, img);
  });
}

function getColorPNGTarget(worldSlug, color) {
  return (COLOR_PNG_MAP[worldSlug] || {})[color] || null;
}

function getColorHex(color) {
  return { red:'#e23b3b', blue:'#2a7fd9', yellow:'#f4c83b', green:'#4aaf5a', purple:'#9558c4', orange:'#ff9d2f' }[color] || '#999';
}

class ColorSortGame {
  constructor(context) {
    this.context = context;
    this.worldSlug = context.worldSlug;

    // Game state
    this.totalItems  = 12;   // 6 Round-1 matches + 6 Round-2 matches
    this.itemsShown  = 0;    // increments by 1 for every correct match
    this.correctCount = 0;
    this.busy  = false;
    this.ended = false;

    // Current round state
    this.matchedColors = new Set(); // colors matched in the current round
    this.targetColor   = null;      // Round 2: the specific color called out

    // Progress tracking
    this.answerHistory = [];
    this.itemStartTime = 0;
    this.performance = {
      correctItems: 0,
      totalItems:   0,
      responseTimes: [],
      colorsAttempted: {},
      colorsCorrect:   {},
      strengthAreas:    [],
      opportunityAreas: []
    };
    ALL_COLORS.forEach(c => {
      this.performance.colorsAttempted[c] = 0;
      this.performance.colorsCorrect[c]   = 0;
    });
  }

  /* ── Lifecycle ──────────────────────────────────────────── */

  async startGame() {
    this.render();
    preloadImages(ALL_COLORS.map(c => getColorPNGTarget(this.worldSlug, c)?.path).filter(Boolean));

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

    this.renderZones();
    this.renderProgress();
    this.renderScore();
    setTimeout(() => this.beginRound(), 600);
  }

  /* ── Round Management ───────────────────────────────────── */

  beginRound() {
    if (this.ended) return;
    if (this.itemsShown >= this.totalItems) return this.end();

    const isRound2 = this.itemsShown >= 6;

    // Reset per-round state
    this.matchedColors = new Set();
    this.targetColor   = null;
    this.itemStartTime = Date.now();
    this.busy = false;

    // Render all 6 tiles and all 6 zones
    this.renderZones();
    this.renderItems();
    this.renderProgress();

    const instruction = document.getElementById('colorInstruction');
    if (instruction) {
      instruction.textContent = isRound2
        ? 'Listen for the color to match!'
        : 'Drag each color to its matching bucket!';
    }

    if (isRound2) {
      this.callOutNextColor();
    }
  }

  callOutNextColor() {
    const unmatched = ALL_COLORS.filter(c => !this.matchedColors.has(c));
    if (!unmatched.length) return;
    this.targetColor = unmatched[Math.floor(Math.random() * unmatched.length)];

    // Highlight the called-out tile
    document.querySelectorAll('.color-item').forEach(el => {
      el.classList.toggle('called-out', el.dataset.color === this.targetColor);
    });

    const instruction = document.getElementById('colorInstruction');
    if (instruction) instruction.textContent = `Find ${this.targetColor}!`;
  }

  /* ── Rendering ──────────────────────────────────────────── */

  render() {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
      <div class="color-game">
        <div class="color-hud">
          <button class="hud-btn" id="colorPauseBtn" aria-label="Pause">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1.5"/>
              <rect x="14" y="5" width="4" height="14" rx="1.5"/>
            </svg>
          </button>
          <div class="color-progress" id="colorProgress"></div>
          <div class="color-score" id="colorScore" aria-live="polite">0 / ${this.totalItems}</div>
        </div>

        <div class="color-item-stage" id="colorItemStage"></div>
        <div class="color-instruction" id="colorInstruction">Drag each color to its matching bucket!</div>
        <div class="color-zones" id="colorZones"></div>
      </div>
    `;
    document.getElementById('colorPauseBtn').addEventListener('click', () => this.togglePause());
  }

  renderZones() {
    const zonesEl = document.getElementById('colorZones');
    if (!zonesEl) return;
    zonesEl.innerHTML = '';

    ALL_COLORS.forEach(color => {
      const zone = document.createElement('div');
      zone.className = 'color-zone';
      zone.dataset.color = color;
      zone.style.setProperty('--zone-color', getColorHex(color));
      zone.innerHTML = `<div class="zone-label">${color}</div>`;
      zonesEl.appendChild(zone);
    });
  }

  renderItems() {
    const stage = document.getElementById('colorItemStage');
    if (!stage) return;
    stage.innerHTML = '';

    ALL_COLORS.filter(c => !this.matchedColors.has(c)).forEach(color => {
      const item = document.createElement('div');
      item.className = 'color-item';
      item.dataset.color = color;
      item.style.setProperty('--item-color', getColorHex(color));

      const pngTarget = getColorPNGTarget(this.worldSlug, color);
      if (pngTarget?.path) {
        const img = document.createElement('img');
        img.src = pngTarget.path;
        img.alt = `${color} item`;
        img.decoding = 'async';
        img.loading = 'eager';
        img.fetchPriority = 'high';
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        img.onerror = () => {
          img.remove();
          item.style.background = getColorHex(color);
        };
        item.appendChild(img);
      } else {
        item.style.background = getColorHex(color);
      }

      item.addEventListener('pointerdown', e => this.startPointerDrag(e, item));
      stage.appendChild(item);
    });
  }

  renderProgress() {
    const el = document.getElementById('colorProgress');
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

  renderScore() {
    const el = document.getElementById('colorScore');
    if (el) el.textContent = `${this.correctCount} / ${this.totalItems}`;
  }

  /* ── Drag & Drop ────────────────────────────────────────── */

  startPointerDrag(event, item) {
    if (this.busy || event.button > 0) return;
    event.preventDefault();

    const rect = item.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    let activeZone = null;

    const moveItem = e => {
      item.style.left = `${e.clientX - offsetX}px`;
      item.style.top  = `${e.clientY - offsetY}px`;
      item.style.pointerEvents = 'none';
      const zone = document.elementFromPoint(e.clientX, e.clientY)?.closest('.color-zone');
      item.style.pointerEvents = '';
      if (zone !== activeZone) {
        document.querySelectorAll('.color-zone.over').forEach(z => z.classList.remove('over'));
        activeZone = zone;
        if (activeZone) activeZone.classList.add('over');
      }
    };

    const resetItem = () => {
      item.classList.remove('dragging');
      item.style.position = item.style.left = item.style.top =
        item.style.width = item.style.height = item.style.zIndex =
        item.style.pointerEvents = '';
      document.querySelectorAll('.color-zone.over').forEach(z => z.classList.remove('over'));
    };

    const endDrag = e => {
      document.removeEventListener('pointermove', moveItem);
      document.removeEventListener('pointerup', endDrag);
      document.removeEventListener('pointercancel', cancelDrag);
      item.style.pointerEvents = 'none';
      const zone = document.elementFromPoint(e.clientX, e.clientY)?.closest('.color-zone');
      item.style.pointerEvents = '';
      resetItem();
      if (zone?.dataset?.color) {
        this.handleDrop(item.dataset.color, zone.dataset.color, zone, item);
      }
    };

    const cancelDrag = () => {
      document.removeEventListener('pointermove', moveItem);
      document.removeEventListener('pointerup', endDrag);
      document.removeEventListener('pointercancel', cancelDrag);
      resetItem();
    };

    item.classList.add('dragging');
    item.style.position = 'fixed';
    item.style.left = `${rect.left}px`;
    item.style.top  = `${rect.top}px`;
    item.style.width  = `${rect.width}px`;
    item.style.height = `${rect.height}px`;
    item.style.zIndex = '1000';

    document.addEventListener('pointermove', moveItem);
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', cancelDrag);
  }

  /* ── Answer Handling ────────────────────────────────────── */

  handleDrop(itemColor, zoneColor, zoneEl, itemEl) {
    if (this.busy) return;

    const isRound2     = this.itemsShown >= 6;
    const isColorMatch = itemColor === zoneColor;
    const isCallout    = !isRound2 || itemColor === this.targetColor;
    const isCorrect    = isColorMatch && isCallout;

    this.performance.totalItems++;
    this.performance.colorsAttempted[itemColor]++;

    if (isCorrect) {
      this.busy = true;

      this.correctCount++;
      this.performance.correctItems++;
      this.performance.colorsCorrect[itemColor]++;
      this.answerHistory.push(true);
      this.itemsShown++;
      this.matchedColors.add(itemColor);

      zoneEl.classList.add('matched');
      if (itemEl) itemEl.classList.add('correct');
      this.renderScore();
      this.renderProgress();

      setTimeout(() => {
        this.busy = false;

        if (this.itemsShown >= this.totalItems) {
          return this.end();
        }

        // If all 6 colors in this round are matched, begin next round
        if (this.matchedColors.size >= 6) {
          return this.beginRound();
        }

        // Still colors remaining in this round — re-render tiles, call out next
        this.renderItems();
        if (isRound2) this.callOutNextColor();
      }, 500);

    } else {
      // Wrong — flash red on the item
      if (itemEl) {
        itemEl.classList.add('wrong');
        setTimeout(() => itemEl.classList.remove('wrong'), 450);
      }
      // If in Round 2 and they dragged the right tile to the wrong zone, remind them
      if (isRound2 && isColorMatch && !isCallout) {
        const instruction = document.getElementById('colorInstruction');
        if (instruction) instruction.textContent = `Find ${this.targetColor}!`;
      }
    }
  }

  /* ── End ────────────────────────────────────────────────── */

  async end() {
    this.ended = true;
    this.clearProgress();

    const accuracy = this.performance.totalItems > 0
      ? this.performance.correctItems / this.performance.totalItems : 0;
    const avgResponseTime = this.performance.responseTimes.length > 0
      ? Math.round(this.performance.responseTimes.reduce((a,b)=>a+b,0)/this.performance.responseTimes.length) : 0;

    const sorted = Object.entries(this.performance.colorsAttempted)
      .map(([c, att]) => [c, att > 0 ? this.performance.colorsCorrect[c]/att : 0])
      .sort((a,b)=>b[1]-a[1]);
    this.performance.strengthAreas    = sorted.slice(0,2).map(([c])=>c);
    this.performance.opportunityAreas = sorted.slice(-2).map(([c])=>c);

    this.context.saveSession({
      gameType: 'color-sort',
      accuracy: parseFloat(accuracy.toFixed(2)),
      correctItems: this.performance.correctItems,
      totalItems: this.performance.totalItems,
      avgResponseTime,
      colorsAttempted: this.performance.colorsAttempted,
      colorsCorrect:   this.performance.colorsCorrect,
      strengthAreas:    this.performance.strengthAreas,
      opportunityAreas: this.performance.opportunityAreas,
      nextGameRecommendation: 'shape-recognition'
    });

    await this.showEndScreen(accuracy);
  }

  async showEndScreen(accuracy) {
    const gameArea = document.getElementById('gameArea');
    const stars = Math.min(3, Math.round(accuracy * 3));
    gameArea.innerHTML = `
      <div class="color-end-card">
        <div class="color-end-panel">
          <h1>🎉 Excellent!</h1>
          <p>You sorted all the colors!</p>
          <div class="color-stars">
            ${[0,1,2].map(i=>`<svg class="color-star${i<stars?' lit':''}" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>`).join('')}
          </div>
          <p class="color-accuracy">${Math.round(accuracy*100)}% Correct</p>
          <button class="color-next-btn" id="nextGameBtn">Next Game</button>
        </div>
      </div>
    `;
    document.getElementById('nextGameBtn').addEventListener('click', () => {
      window.location.href = 'game-loader.html?game=shape-recognition';
    });
  }

  /* ── Save / Load ────────────────────────────────────────── */

  saveProgress() {
    const state = {
      itemsShown: this.itemsShown,
      correctCount: this.correctCount,
      performance: this.performance,
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
    this.itemsShown   = Math.min(state.itemsShown || 0, this.totalItems);
    this.correctCount = state.correctCount || 0;
    this.performance  = state.performance  || this.performance;
    this.answerHistory = Array.isArray(state.answerHistory) ? state.answerHistory : [];
  }

  clearProgress() { localStorage.removeItem(this.getProgressKey()); }
  getProgressKey() { return `colorSortProgress_${this.context.childId}`; }

  showResumePrompt(saved) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'pause-overlay';
      overlay.innerHTML = `
        <div class="pause-panel">
          <h2>Welcome back!</h2>
          <p>You matched ${saved.itemsShown} of ${this.totalItems} colors. Continue?</p>
          <button class="pause-btn pause-btn-primary" id="resumeSavedBtn">Continue</button>
          <button class="pause-btn pause-btn-secondary" id="startFreshBtn">Start Fresh</button>
        </div>
      `;
      document.body.appendChild(overlay);
      document.getElementById('resumeSavedBtn').addEventListener('click', () => { overlay.remove(); resolve(true); });
      document.getElementById('startFreshBtn').addEventListener('click',  () => { overlay.remove(); resolve(false); });
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

window.ColorSortGame = ColorSortGame;
