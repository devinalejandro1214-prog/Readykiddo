/* ─────────────────────────────────────────────────────────
   ReadyKiddo — Color Sort Game
   12 rounds total: Round 1 (1-6) free match, Round 2 (7-12) callout match
   All 6 colors + all 6 containers shown at once both rounds
   ───────────────────────────────────────────────────────── */

/* ── World-item mapping ─────────────────────────────────────
   Each world maps each of the 6 colors to the item key that
   should be shown in that color.  ITEM_GENERATORS[key](color)
   from item-data.js produces the inline SVG on the fly —
   no PNG files required.
   ─────────────────────────────────────────────────────────── */
const WORLD_COLOR_ITEMS = {
  space:        { red:'star',      blue:'planet',   yellow:'star',      orange:'star',      green:'rocket',   purple:'planet'    },
  'candy-land': { red:'cupcake',   blue:'lollipop', yellow:'gummy',     orange:'lollipop',  green:'gummy',    purple:'cupcake'   },
  jungle:       { red:'fruit',     blue:'fruit',    yellow:'flower',    orange:'leaf',      green:'leaf',     purple:'flower'    },
  beach:        { red:'starfish',  blue:'shell',    yellow:'beachball', orange:'beachball', green:'starfish', purple:'shell'     },
  castle:       { red:'crown',     blue:'gem',      yellow:'gem',       orange:'shield',    green:'shield',   purple:'crown'     },
  studio:       { red:'paintblob', blue:'brush',    yellow:'note',      orange:'paintblob', green:'brush',    purple:'note'      },
};

const ALL_COLORS = ['red', 'blue', 'yellow', 'orange', 'green', 'purple'];

function getWorldColorItem(worldSlug, color) {
  return (WORLD_COLOR_ITEMS[worldSlug] || WORLD_COLOR_ITEMS.space)[color] || 'star';
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

    // Round 1 two-tap state
    this.selectedItem = null;

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
        // Advance badge silently to match saved position (no stale overlays)
        this.context.syncPhase(this.itemsShown);
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
    this.selectedItem  = null;
    document.querySelectorAll('.color-item.cs-selected')
      .forEach(el => el.classList.remove('cs-selected'));

    // Render all 6 tiles and all 6 zones
    this.renderZones();
    const zonesEl = document.getElementById('colorZones');
    if (zonesEl) zonesEl.style.display = isRound2 ? 'none' : '';
    
    this.renderItems();
    this.renderProgress();

    if (instruction) {
      instruction.textContent = isRound2
        ? 'Listen for the color to match!'
        : (this.context.ageGroup === '3-4' ? 'Tap a color!' : 'Drag each color to its matching bucket!');
    }

    if (isRound2) {
      // Block taps until the target color is called out — if the child taps during
      // the intro clip, targetColor is still null and handleDrop shows "Find null!".
      // speakAndWait resolves on clip-end so the callout never overlaps or drops.
      //
      // Safety timer: if speakAndWait never resolves (audio interrupted by mute toggle,
      // tab backgrounding, or any other external event), unblock the game after 3 s so
      // the child is never permanently stuck.
      this.busy = true;
      const _safetyUnlock = setTimeout(() => {
        if (this.busy && !this.ended && !this.targetColor) {
          this.callOutNextColor();
          this.busy = false;
        }
      }, 3000);

      this.context.speakAndWait('match the colors').then(() => {
        clearTimeout(_safetyUnlock);
        if (!this.ended) {
          this.callOutNextColor();
          this.busy = false;
        }
      });
    } else {
      this.context.speak('match the colors');
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
    this.context.speak(`find ${this.targetColor}`);
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
        <div class="color-instruction" id="colorInstruction">Get ready!</div>
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
      zone.innerHTML = `<div class="zone-target" aria-hidden="true"></div>`;
      const isRound1 = this.itemsShown < 6;
      const useTap   = this.context.ageGroup === '3-4';
      if (isRound1 && useTap) {
        zone.addEventListener('pointerdown', e => this.handleRound1ZoneTap(e, zone));
      }
      zonesEl.appendChild(zone);
    });
  }

  renderItems() {
    const stage = document.getElementById('colorItemStage');
    if (!stage) return;
    stage.innerHTML = '';

    // Shuffle tiles so they never start aligned with the containers
    const shuffled = [...ALL_COLORS].filter(c => !this.matchedColors.has(c))
      .sort(() => Math.random() - 0.5);

    shuffled.forEach(color => {
      const item = document.createElement('div');
      item.className = 'color-item';
      item.dataset.color = color;
      item.style.setProperty('--item-color', getColorHex(color));

      // Render the world-specific kawaii SVG item for this color
      const itemKey = getWorldColorItem(this.worldSlug, color);
      if (typeof ITEM_GENERATORS !== 'undefined' && ITEM_GENERATORS[itemKey]) {
        item.innerHTML = ITEM_GENERATORS[itemKey](color);
      } else {
        // Fallback: plain colour background (no item-data.js loaded yet)
        item.style.background = getColorHex(color);
      }

      const isRound2 = this.itemsShown >= 6;
      if (!isRound2) {
        const useTap = this.context.ageGroup === '3-4';
        item.addEventListener('pointerdown', useTap
          ? e => this.handleRound1ItemTap(e, item)
          : e => this.startPointerDrag(e, item));
      } else {
        item.addEventListener('pointerdown', e => this.handleTapSelect(e, item));
      }
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

  /* ── Round 1: two-tap interaction ──────────────────────── */

  handleRound1ItemTap(event, item) {
    if (this.busy || event.button > 0) return;
    event.preventDefault();
    document.querySelectorAll('.color-item.cs-selected')
      .forEach(el => el.classList.remove('cs-selected'));
    item.classList.add('cs-selected');
    this.selectedItem = item;
    const instruction = document.getElementById('colorInstruction');
    if (instruction) instruction.textContent = 'Now tap its matching bucket!';
  }

  handleRound1ZoneTap(event, zone) {
    if (this.busy || event.button > 0) return;
    event.preventDefault();
    if (!this.selectedItem) return;
    const item      = this.selectedItem;
    const itemColor = item.dataset.color;
    const zoneColor = zone.dataset.color;
    if (itemColor === zoneColor) {
      item.classList.remove('cs-selected');
      this.selectedItem = null;
      this.handleDrop(itemColor, zoneColor, zone, item);
    } else {
      zone.classList.add('flash-wrong');
      setTimeout(() => zone.classList.remove('flash-wrong'), 450);
      item.classList.remove('cs-selected');
      this.selectedItem = null;
      this.context.speak('try again');
      const instruction = document.getElementById('colorInstruction');
      if (instruction) instruction.textContent = 'Tap a color!';
    }
  }

  handleTapSelect(event, item) {
    if (this.busy) return;
    this.handleDrop(item.dataset.color, item.dataset.color, null, item);
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

      if (zoneEl) zoneEl.classList.add('matched');
      if (itemEl) itemEl.classList.add('correct');
      this.context.randomEncouragement();
      this.renderScore();
      this.renderProgress();

      setTimeout(async () => {
        // Report progress first — holds busy=true through any phase transition overlay
        await this.context.reportProgress(this.itemsShown, this.totalItems);
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
      const wrongPhrases = ['try again', 'aww man'];
      this.context.speak(wrongPhrases[Math.floor(Math.random() * wrongPhrases.length)]);
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

    // characterAnimation not called here — celebration overlay (z-index 9200)
    // fully covers the character (z-index 5), so it would be invisible.
    this.context.randomEncouragement();

    await this.context.showCelebration({
      accuracy,
      onContinue: () => this.context.goToNextGame('shape-recognition')
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
