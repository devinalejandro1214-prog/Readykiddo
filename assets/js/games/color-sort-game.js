/* ─────────────────────────────────────────────────────────
   ReadyKiddo — Color Sort Game
   Sort world-specific items by color with adaptive difficulty
   ───────────────────────────────────────────────────────── */

class ColorSortGame {
  constructor(context) {
    this.context = context;
    this.worldSlug = context.worldSlug;
    this.totalItems = 9;
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
    this.busy = false;
    this.ended = false;
    this.itemStartTime = 0;
  }

  async startGame() {
    // Initialize game UI
    this.render();

    // Set background and character from context
    const bgEl = document.getElementById('gameBackground');
    if (bgEl && this.context.backgroundPath) {
      bgEl.src = this.context.backgroundPath;
    }

    const charImg = document.getElementById('gameCharacterImg');
    if (charImg && this.context.characterPath) {
      charImg.src = this.context.characterPath;
    }

    // Greet player
    await this.context.speak(
      `Hi ${this.context.childName}! Help me sort items by color!`
    );

    // Render zones and progress
    this.renderZones();
    this.renderProgress();

    // Start first item
    setTimeout(() => this.presentNextItem(), 800);
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
        this.handleDrop(color, zone);
      });

      zonesEl.appendChild(zone);
    });
  }

  getBranchColors() {
    const colorBranches = {
      neutral: ['red', 'blue'],
      'easy-medium': ['red', 'blue', 'yellow'],
      medium: ['red', 'blue', 'yellow', 'orange'],
      'medium-hard': ['red', 'blue', 'yellow', 'green', 'purple'],
      hard: ['red', 'blue', 'yellow', 'orange', 'green', 'purple']
    };
    return colorBranches[this.currentBranch] || colorBranches.neutral;
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

    // Evaluate branch every 3 items
    if (this.itemsShown > 0 && this.itemsShown % 3 === 0) {
      this.evaluateBranch();
    }

    // Select color from current branch
    const colors = this.getBranchColors();
    this.currentColor = colors[Math.floor(Math.random() * colors.length)];

    // Get world items
    const worldItems = getWorldItems(this.worldSlug);
    const randomItem = worldItems[Math.floor(Math.random() * worldItems.length)];

    this.currentItem = randomItem;
    this.itemStartTime = Date.now();
    this.busy = false;

    // Track color attempt
    if (!this.performance.colorsAttempted[this.currentColor]) {
      this.performance.colorsAttempted[this.currentColor] = 0;
      this.performance.colorsCorrect[this.currentColor] = 0;
    }
    this.performance.colorsAttempted[this.currentColor]++;

    this.renderItem();
    this.renderProgress();
  }

  renderItem() {
    const itemStage = document.getElementById('colorItemStage');
    if (!itemStage) return;

    const itemSvg = getItemSVG(this.currentItem, this.currentColor);

    const item = document.createElement('div');
    item.className = 'color-item';
    item.id = 'colorItem';
    item.draggable = false;
    item.dataset.color = this.currentColor;
    item.innerHTML = itemSvg;

    item.addEventListener('pointerdown', e => {
      this.startPointerDrag(e, item);
    });

    itemStage.innerHTML = '';
    itemStage.appendChild(item);
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
        this.handleDrop(zone.dataset.color, zone);
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

  handleDrop(droppedColor, zoneEl) {
    if (this.busy) return;

    this.busy = true;
    const responseTime = Date.now() - this.itemStartTime;
    this.performance.responseTimes.push(responseTime);

    // Count every attempt (correct AND wrong) toward totals
    this.itemsShown++;
    this.performance.totalItems++;

    const isCorrect = droppedColor === this.currentColor;

    if (isCorrect) {
      this.correctCount++;
      this.correctStreak++;
      this.incorrectStreak = 0;
      this.performance.correctItems++;
      this.performance.colorsCorrect[this.currentColor]++;

      zoneEl.classList.add('pulse');
      setTimeout(() => zoneEl.classList.remove('pulse'), 500);

      const item = document.getElementById('colorItem');
      if (item) item.classList.add('correct');

      this.context.speak(`Great job! That's ${this.currentColor}!`);
      this.context.characterAnimation('cheer');

      // Advance after the correct fade animation (0.5s) + buffer
      setTimeout(() => this.presentNextItem(), 900);

    } else {
      this.incorrectStreak++;
      this.correctStreak = 0;

      const item = document.getElementById('colorItem');
      if (item) {
        item.classList.add('wrong');
        setTimeout(() => item.classList.remove('wrong'), 450);
      }

      // Specific feedback: tell child what color it was AND what's needed
      this.context.speak(
        `That's ${droppedColor}. We need ${this.currentColor}!`
      );
      this.context.characterAnimation('nod');

      // Advance to next item after feedback — wrong answers still progress the game
      setTimeout(() => this.presentNextItem(), 1600);
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
    alert('Game paused. Resume playing?');
  }
}

window.ColorSortGame = ColorSortGame;
