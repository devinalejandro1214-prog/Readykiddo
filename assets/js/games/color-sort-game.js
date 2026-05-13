/* ─────────────────────────────────────────────────────────
   ReadyKiddo — Color Sort Game
   Sort world-specific items by color with adaptive difficulty
   ───────────────────────────────────────────────────────── */

// World-aware PNG mappings for color learning targets.
const COLOR_PNG_MAP = {
  studio: {
    red:    { item: 'paintblob', path: 'assets/images/games/color-sort/items/studio-red-paintblob.png' },
    blue:   { item: 'brush', path: 'assets/images/games/color-sort/items/studio-blue-brush.png' },
    yellow: { item: 'note', path: 'assets/images/games/color-sort/items/studio-yellow-note.png' },
    orange: { item: 'paintblob', path: 'assets/images/games/color-sort/items/studio-orange-paintblob.png' },
    green:  { item: 'brush', path: 'assets/images/games/color-sort/items/studio-green-brush.png' },
    purple: { item: 'note', path: 'assets/images/games/color-sort/items/studio-purple-note.png' },
  },
  jungle: {
    red:    { item: 'fruit', path: 'assets/images/games/color-sort/items/jungle-red-fruit.png' },
    blue:   { item: 'fruit', path: 'assets/images/games/color-sort/items/jungle-blue-fruit.png' },
    yellow: { item: 'flower', path: 'assets/images/games/color-sort/items/jungle-yellow-flower.png' },
    orange: { item: 'leaf', path: 'assets/images/games/color-sort/items/jungle-orange-leaf.png' },
    green:  { item: 'leaf', path: 'assets/images/games/color-sort/items/jungle-green-leaf.png' },
    purple: { item: 'flower', path: 'assets/images/games/color-sort/items/jungle-purple-flower.png' },
  },
  'candy-land': {
    red:    { item: 'cupcake', path: 'assets/images/games/color-sort/items/candy-land-red-cupcake.png' },
    blue:   { item: 'lollipop', path: 'assets/images/games/color-sort/items/candy-land-blue-lollipop.png' },
    yellow: { item: 'gummy', path: 'assets/images/games/color-sort/items/candy-land-yellow-gummy.png' },
    orange: { item: 'lollipop', path: 'assets/images/games/color-sort/items/candy-land-orange-lollipop.png' },
    green:  { item: 'gummy', path: 'assets/images/games/color-sort/items/candy-land-green-gummy.png' },
    purple: { item: 'cupcake', path: 'assets/images/games/color-sort/items/candy-land-purple-cupcake.png' },
  },
  castle: {
    red:    { item: 'crown', path: 'assets/images/games/color-sort/items/castle-red-crown.png' },
    blue:   { item: 'gem', path: 'assets/images/games/color-sort/items/castle-blue-gem.png' },
    yellow: { item: 'gem', path: 'assets/images/games/color-sort/items/castle-yellow-gem.png' },
    orange: { item: 'shield', path: 'assets/images/games/color-sort/items/castle-orange-shield.png' },
    green:  { item: 'shield', path: 'assets/images/games/color-sort/items/castle-green-shield.png' },
    purple: { item: 'crown', path: 'assets/images/games/color-sort/items/castle-purple-crown.png' },
  },
  space: {
    blue:   { item: 'planet', path: 'assets/images/games/color-sort/items/space-blue-planet.png' },
    orange: { item: 'star', path: 'assets/images/games/color-sort/items/space-orange-star.png' },
    green:  { item: 'rocket', path: 'assets/images/games/color-sort/items/space-green-rocket.png' },
    purple: { item: 'planet', path: 'assets/images/games/color-sort/items/space-purple-planet.png' },
  },
  beach: {
    orange: { item: 'beachball', path: 'assets/images/games/color-sort/items/beach-orange-beachball.png' },
    green:  { item: 'starfish', path: 'assets/images/games/color-sort/items/beach-green-starfish.png' },
    purple: { item: 'shell', path: 'assets/images/games/color-sort/items/beach-purple-shell.png' },
  }
};

const IMAGE_PRELOAD_CACHE = new Map();

function preloadImages(paths) {
  paths
    .filter(Boolean)
    .forEach(path => {
      if (IMAGE_PRELOAD_CACHE.has(path)) return;
      const img = new Image();
      img.decoding = 'async';
      img.loading = 'eager';
      img.src = path;
      const ready = img.decode ? img.decode().catch(() => {}) : Promise.resolve();
      IMAGE_PRELOAD_CACHE.set(path, { img, ready });
    });
}

function getColorPNGTarget(worldSlug, color) {
  const worldMap = COLOR_PNG_MAP[worldSlug] || {};
  return worldMap[color] || null;
}

function getColorPNGPaths(worldSlug) {
  const worldPaths = Object.values(COLOR_PNG_MAP[worldSlug] || {}).map(target => target.path);
  return [...new Set(worldPaths)];
}

class ColorSortGame {
  constructor(context) {
    this.context = context;
    this.worldSlug = context.worldSlug;
    this.totalItems = 12;
    this.itemsShown = 0;
    this.correctCount = 0;
    this.correctStreak = 0;
    this.incorrectStreak = 0;
    this.currentBranch = 'neutral';
    this.branchHistory = [this.currentBranch];
    this.performance = {
      correctItems: 0,
      totalItems: 0,
      avgResponseTime: 0,
      responseTimes: [],
      colorsAttempted: {},
      colorsCorrect: {},
      strengthAreas: [],
      opportunityAreas: []
    };
    this.currentItem = null;
    this.currentColor = null;
    this.currentBatchColors = [];
    this.matchedColors = new Set();
    this.busy = false;
    this.ended = false;
    this.itemStartTime = 0;
    this.lastCorrectPhrase = null;
    this.lastWrongPhrase = null;
    this.colorSeen = {};
    this.preloadedPNGPaths = getColorPNGPaths(this.worldSlug);
  }

  async startGame() {
    // Initialize game UI
    this.render();
    this.preloadPNGTiles();

    // Set background and character from context
    const bgEl = document.getElementById('gameBackground');
    if (bgEl && this.context.backgroundPath) {
      bgEl.src = this.context.backgroundPath;
    }

    const charImg = document.getElementById('gameCharacterImg');
    if (charImg && this.context.characterPath) {
      charImg.src = this.context.characterPath;
    }

    // Check for saved progress
    const saved = this.loadProgress();
    if (saved) {
      const resumeRequested = new URLSearchParams(window.location.search).get('resume') === 'true';
      const shouldResume = resumeRequested || await this.showResumePrompt(saved);
      if (shouldResume) {
        this.restoreProgress(saved);
      } else {
        this.clearProgress();
      }
      this.renderZones();
      this.renderProgress();
      this.renderScore();
      setTimeout(() => this.presentNextItem(), 600);
      return;
    }

    this.context.speak('match the colors');

    // Render zones and progress
    this.renderZones();
    this.renderProgress();
    this.renderScore();

    // Start first item
    setTimeout(() => this.presentNextItem(), 800);
  }

  saveProgress() {
    const state = {
      itemsShown: this.itemsShown,
      correctCount: this.correctCount,
      correctStreak: this.correctStreak,
      incorrectStreak: this.incorrectStreak,
      currentBranch: this.currentBranch,
      branchHistory: this.branchHistory,
      performance: this.performance,
      colorSeen: this.colorSeen,
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
    return `colorSortProgress_${this.context.childId}`;
  }

  restoreProgress(state) {
    this.itemsShown = Math.min(state.itemsShown || 0, this.totalItems);
    this.correctCount = state.correctCount || 0;
    this.correctStreak = state.correctStreak || 0;
    this.incorrectStreak = state.incorrectStreak || 0;
    this.currentBranch = state.currentBranch || 'neutral';
    this.branchHistory = Array.isArray(state.branchHistory) ? state.branchHistory : [this.currentBranch];
    this.performance = state.performance || this.performance;
    this.colorSeen = state.colorSeen || {};
  }

  showResumePrompt(saved) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'pause-overlay';
      overlay.innerHTML = `
        <div class="pause-panel">
          <h2>Welcome back!</h2>
          <p>You sorted ${saved.itemsShown} of ${this.totalItems} items. Continue where you left off?</p>
          <button class="pause-btn pause-btn-primary" id="resumeSavedBtn">Continue</button>
          <button class="pause-btn pause-btn-secondary" id="startFreshBtn">Start Fresh</button>
        </div>
      `;
      document.body.appendChild(overlay);

      document.getElementById('resumeSavedBtn').addEventListener('click', () => {
        overlay.remove();
        resolve(true);
      });
      document.getElementById('startFreshBtn').addEventListener('click', () => {
        overlay.remove();
        resolve(false);
      });
    });
  }

  render() {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
      <div class="color-game">
        <!-- Top HUD -->
        <div class="color-hud">
          <button class="hud-btn" id="colorPauseBtn" aria-label="Pause">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1.5"/>
              <rect x="14" y="5" width="4" height="14" rx="1.5"/>
            </svg>
          </button>
          <div class="color-progress" id="colorProgress"></div>
          <div class="color-score" id="colorScore" aria-live="polite" aria-label="Score">0 / ${this.totalItems}</div>
        </div>

        <!-- Item to sort -->
        <div class="color-item-stage" id="colorItemStage"></div>

        <!-- Instructions -->
        <div class="color-instruction" id="colorInstruction">
          Drag to the matching color
        </div>

        <!-- Drop zones -->
        <div class="color-zones" id="colorZones"></div>
      </div>
    `;

    // Bind pause button
    document.getElementById('colorPauseBtn').addEventListener('click', () => {
      this.togglePause();
    });
  }

  renderProgress() {
    const progressEl = document.getElementById('colorProgress');
    if (!progressEl) return;

    progressEl.innerHTML = '';
    for (let i = 0; i < this.totalItems; i++) {
      const pip = document.createElement('div');
      pip.className = 'color-pip';
      if (i < this.itemsShown) {
        pip.classList.add('done');
      } else if (i === this.itemsShown) {
        pip.classList.add('current');
      }
      progressEl.appendChild(pip);
    }
  }

  renderScore() {
    const scoreEl = document.getElementById('colorScore');
    if (!scoreEl) return;
    scoreEl.textContent = `${this.correctCount} / ${this.totalItems}`;
  }

  renderZones() {
    const zonesEl = document.getElementById('colorZones');
    if (!zonesEl) return;

    const colors = this.getBranchColors();
    zonesEl.innerHTML = '';

    colors.forEach(color => {
      const zone = document.createElement('div');
      zone.className = 'color-zone';
      zone.dataset.color = color;
      zone.style.setProperty('--zone-color', this.getColorHex(color));

      zone.innerHTML = `<div class="zone-target"></div>`;

      zone.addEventListener('dragover', e => {
        e.preventDefault();
        zone.classList.add('over');
      });

      zone.addEventListener('dragleave', () => {
        zone.classList.remove('over');
      });

      zone.addEventListener('drop', e => {
        e.preventDefault();
        zone.classList.remove('over');
      });

      zonesEl.appendChild(zone);
    });
  }

  getBranchColors() {
    return ['red', 'blue', 'yellow', 'orange', 'green', 'purple'];
  }

  getColorHex(color) {
    const colorMap = {
      red: '#e23b3b',
      blue: '#2a7fd9',
      yellow: '#f4c83b',
      green: '#4aaf5a',
      purple: '#9558c4',
      orange: '#ff9d2f'
    };
    return colorMap[color] || '#999';
  }

  presentNextItem() {
    if (this.ended) return;
    if (this.itemsShown >= this.totalItems) return this.end();

    const colors = this.getBranchColors();
    const isRound2 = this.itemsShown >= 6;

    if (!isRound2) {
      if (!this.colorSeen) this.colorSeen = {};
      const unseen = colors.filter(color => !this.colorSeen[color]);
      const colorPool = unseen.length > 0 ? unseen : colors;
      this.currentColor = colorPool[Math.floor(Math.random() * colorPool.length)];
      this.colorSeen[this.currentColor] = true;
      this.currentBatchColors = [this.currentColor];
    } else {
      this.currentBatchColors = [...colors].sort(() => Math.random() - 0.5);
      this.matchedColors = new Set();
      this.currentColor = null;
    }

    this.itemStartTime = Date.now();
    this.busy = false;

    colors.forEach(color => {
      if (!this.performance.colorsAttempted[color]) {
        this.performance.colorsAttempted[color] = 0;
        this.performance.colorsCorrect[color] = 0;
      }
    });

    this.renderZones();
    this.renderItem();
    this.renderProgress();

    const instructionEl = document.getElementById('colorInstruction');
    if (instructionEl) {
      instructionEl.textContent = isRound2
        ? 'Find all the colors!'
        : `Find the ${this.currentColor}!`;
    }
    this.context.speak(isRound2 ? 'find all the colors' : this.currentColor);
  }

  renderItem() {
    const itemStage = document.getElementById('colorItemStage');
    if (!itemStage) return;

    const isRound2 = this.itemsShown >= 6;
    const colorsToShow = isRound2
      ? this.currentBatchColors.filter(color => !this.matchedColors.has(color))
      : [this.currentColor].filter(Boolean);

    itemStage.innerHTML = '';
    colorsToShow
      .forEach(color => {
        const item = document.createElement('div');
        item.className = 'color-item';
        item.draggable = false;
        item.dataset.color = color;

        const pngTarget = getColorPNGTarget(this.worldSlug, color);
        const itemKey = pngTarget?.item || getWorldItems(this.worldSlug)[0] || 'star';
        if (pngTarget?.path) {
          const img = document.createElement('img');
          img.src = pngTarget.path;
          img.alt = `${color} ${pngTarget.item}`;
          img.decoding = 'async';
          img.loading = 'eager';
          img.fetchPriority = 'high';
          img.style.width = '100%';
          img.style.height = '100%';
          img.style.objectFit = 'contain';
          img.onerror = () => {
            img.style.display = 'none';
            item.innerHTML = getItemSVG(itemKey, color);
          };
          item.appendChild(img);
        } else {
          item.innerHTML = getItemSVG(itemKey, color);
        }

        item.addEventListener('pointerdown', e => {
          this.startPointerDrag(e, item);
        });

        itemStage.appendChild(item);
      });
  }

  preloadPNGTiles() {
    preloadImages(this.preloadedPNGPaths);
  }

  startPointerDrag(event, item) {
    if (this.busy || event.button > 0) return;

    event.preventDefault();
    const rect = item.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    let activeZone = null;

    const moveItem = pointerEvent => {
      item.style.left = `${pointerEvent.clientX - offsetX}px`;
      item.style.top = `${pointerEvent.clientY - offsetY}px`;

      item.style.pointerEvents = 'none';
      const zone = document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY)?.closest('.color-zone');
      item.style.pointerEvents = '';

      if (zone !== activeZone) {
        document.querySelectorAll('.color-zone.over').forEach(z => z.classList.remove('over'));
        activeZone = zone;
        if (activeZone) activeZone.classList.add('over');
      }
    };

    const resetItem = () => {
      item.classList.remove('dragging');
      item.style.position = '';
      item.style.left = '';
      item.style.top = '';
      item.style.width = '';
      item.style.height = '';
      item.style.zIndex = '';
      item.style.pointerEvents = '';
      document.querySelectorAll('.color-zone.over').forEach(z => z.classList.remove('over'));
    };

    const endDrag = pointerEvent => {
      document.removeEventListener('pointermove', moveItem);
      document.removeEventListener('pointerup', endDrag);
      document.removeEventListener('pointercancel', cancelDrag);

      item.style.pointerEvents = 'none';
      const zone = document.elementFromPoint(pointerEvent.clientX, pointerEvent.clientY)?.closest('.color-zone');
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
    item.style.top = `${rect.top}px`;
    item.style.width = `${rect.width}px`;
    item.style.height = `${rect.height}px`;
    item.style.zIndex = '1000';

    document.addEventListener('pointermove', moveItem);
    document.addEventListener('pointerup', endDrag);
    document.addEventListener('pointercancel', cancelDrag);
  }

  handleDrop(itemColor, droppedColor, zoneEl, itemEl) {
    if (this.busy) return;

    const responseTime = Date.now() - this.itemStartTime;
    this.performance.responseTimes.push(responseTime);

    this.performance.totalItems++;
    this.performance.colorsAttempted[itemColor]++;

    const isCorrect = droppedColor === itemColor;

    if (isCorrect) {
      this.busy = true;
      this.correctCount++;
      this.correctStreak++;
      this.incorrectStreak = 0;
      this.performance.correctItems++;
      this.performance.colorsCorrect[itemColor]++;
      this.itemsShown++;
      this.matchedColors.add(itemColor);

      zoneEl.classList.add('pulse');
      zoneEl.classList.add('matched');
      setTimeout(() => zoneEl.classList.remove('pulse'), 500);

      if (itemEl) itemEl.classList.add('correct');

      this.renderScore();
      this.renderProgress();
      const correctPhrases = ['you got it', 'you found it', 'great job', 'yay'];
      const pick = this.randomPickAvoidRepeat(correctPhrases, this.lastCorrectPhrase);
      this.lastCorrectPhrase = pick;
      this.context.speak(pick);
      this.context.characterAnimation('cheer');

      setTimeout(() => {
        this.busy = false;
        if (this.itemsShown >= this.totalItems) {
          this.end();
        } else if (this.matchedColors.size >= this.currentBatchColors.length) {
          this.presentNextItem();
        } else {
          this.renderItem();
        }
      }, 550);

    } else {
      this.incorrectStreak++;
      this.correctStreak = 0;

      if (itemEl) {
        itemEl.classList.add('wrong');
        setTimeout(() => itemEl.classList.remove('wrong'), 450);
      }

      const wrongPhrases = ['try again', 'aww man'];
      const wrongPick = this.randomPickAvoidRepeat(wrongPhrases, this.lastWrongPhrase);
      this.lastWrongPhrase = wrongPick;
      this.context.speak(wrongPick);
      this.context.characterAnimation('nod');
    }
  }

  randomPickAvoidRepeat(options, lastPick) {
    if (options.length === 1) return options[0];
    const filtered = options.filter(option => option !== lastPick);
    const pool = filtered.length > 0 ? filtered : options;
    return pool[Math.floor(Math.random() * pool.length)];
  }

  advanceBranchByProgress() {
    const branchOrder = ['neutral', 'easy-medium', 'medium', 'medium-hard', 'hard'];
    const targetIndex = Math.min(branchOrder.length - 1, Math.floor(this.itemsShown / 2));
    const targetBranch = branchOrder[targetIndex];

    if (targetBranch !== this.currentBranch) {
      this.currentBranch = targetBranch;
      this.branchHistory.push(this.currentBranch);
      this.context.speak('keep it up');
      this.context.characterAnimation('celebrate');
      this.renderZones();
    }
  }

  evaluateBranch() {
    const accuracy = this.correctCount / this.itemsShown;

    if (accuracy >= 0.8) {
      // Move up difficulty
      const branchOrder = ['neutral', 'easy-medium', 'medium', 'medium-hard', 'hard'];
      const currentIndex = branchOrder.indexOf(this.currentBranch);
      if (currentIndex < branchOrder.length - 1) {
        this.currentBranch = branchOrder[currentIndex + 1];
        this.branchHistory.push(this.currentBranch);
        this.context.speak(`You're getting really good! Level up!`);
        this.context.characterAnimation('celebrate');
        this.renderZones(); // Update zones for new branch
      }
    } else if (accuracy < 0.5) {
      // Move down difficulty
      const branchOrder = ['neutral', 'easy-medium', 'medium', 'medium-hard', 'hard'];
      const currentIndex = branchOrder.indexOf(this.currentBranch);
      if (currentIndex > 0) {
        this.currentBranch = branchOrder[currentIndex - 1];
        this.branchHistory.push(this.currentBranch);
        this.context.speak(`Let's try some easier colors.`);
        this.context.characterAnimation('sway');
        this.renderZones(); // Update zones for new branch
      }
    }
  }

  async end() {
    this.ended = true;
    this.clearProgress();

    // Calculate metrics
    const accuracy =
      this.performance.totalItems > 0
        ? this.performance.correctItems / this.performance.totalItems
        : 0;

    const avgResponseTime =
      this.performance.responseTimes.length > 0
        ? Math.round(
            this.performance.responseTimes.reduce((a, b) => a + b, 0) /
              this.performance.responseTimes.length
          )
        : 0;

    // Determine strengths and opportunities
    const colorAccuracy = {};
    for (const color in this.performance.colorsCorrect) {
      colorAccuracy[color] =
        this.performance.colorsAttempted[color] > 0
          ? this.performance.colorsCorrect[color] /
            this.performance.colorsAttempted[color]
          : 0;
    }

    const sorted = Object.entries(colorAccuracy).sort((a, b) => b[1] - a[1]);
    this.performance.strengthAreas = sorted.slice(0, 2).map(([color]) => color);
    this.performance.opportunityAreas = sorted
      .slice(-2)
      .map(([color]) => color);

    // Celebrate
    await this.context.speak(`Amazing! You sorted all the colors perfectly!`);
    this.context.characterAnimation('dance');

    // Save session
    const finalBranch = this.currentBranch;
    const sessionData = {
      gameType: 'color-sort',
      accuracy: parseFloat(accuracy.toFixed(2)),
      finalBranch: finalBranch,
      correctItems: this.performance.correctItems,
      totalItems: this.performance.totalItems,
      avgResponseTime: avgResponseTime,
      branchPath: this.branchHistory.join(' → '),
      colorsAttempted: this.performance.colorsAttempted,
      colorsCorrect: this.performance.colorsCorrect,
      strengthAreas: this.performance.strengthAreas,
      opportunityAreas: this.performance.opportunityAreas,
      nextGameRecommendation: 'shape-recognition'
    };

    this.context.saveSession(sessionData);

    // Show end screen
    await this.showEndScreen(accuracy);
  }

  async showEndScreen(accuracy) {
    const gameArea = document.getElementById('gameArea');
    const stars = Math.round(accuracy * 3);

    gameArea.innerHTML = `
      <div class="color-end-card">
        <div class="color-end-panel">
          <h1>🎉 Excellent!</h1>
          <p>You sorted all the colors!</p>
          <div class="color-stars">
            ${Array(3)
              .fill(0)
              .map(
                (_, i) =>
                  `<svg class="color-star ${i < stars ? 'lit' : ''}" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>`
              )
              .join('')}
          </div>
          <p class="color-accuracy">${Math.round(accuracy * 100)}% Correct</p>
          <button class="color-next-btn" id="nextGameBtn">Next Game</button>
        </div>
      </div>
    `;

    document.getElementById('nextGameBtn').addEventListener('click', () => {
      window.location.href = 'game-loader.html?game=shape-recognition';
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

window.ColorSortGame = ColorSortGame;
