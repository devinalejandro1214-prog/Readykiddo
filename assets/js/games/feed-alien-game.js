/*
   ReadyKiddo - Feed the Alien Game
   6 rounds with drag-to-mouth feeding
   Counting range capped at 1-10 for this version
*/

class FeedAlienGame {
  constructor(context) {
    this.context = context;
    this.worldSlug = context.worldSlug;

    this.totalItems = 6;
    this.currentRound = 0;
    this.ended = false;

    this.difficulty = 1;
    this.maxNumber = 10;

    this.requiredCount = 0;
    this.selectedCount = 0;
    this.fedFoods = new Set();
    this.roundStartTime = 0;
    this.roundCorrect = false;

    this.performance = {
      correctItems: 0,
      totalItems: 6,
      responseTimes: [],
      roundDetails: [],
      accuracy: 0,
      strengthAreas: [],
      opportunityAreas: []
    };

    this._pupilHandler = null;
    this.activeDrag = null;
    this.handleDragMove = this.onDragMove.bind(this);
    this.handleDragEnd = this.onDragEnd.bind(this);
  }

  async startGame() {
    this.render();

    const shellCharacter = document.getElementById('gameCharacter');
    if (shellCharacter) shellCharacter.style.display = 'none';

    const bgEl = document.getElementById('gameBackground');
    if (bgEl && this.context.backgroundPath) bgEl.src = this.context.backgroundPath;
    const charImg = document.getElementById('gameCharacterImg');
    if (charImg && this.context.characterPath) charImg.src = this.context.characterPath;

    this.renderProgress();
    setTimeout(() => this.beginRound(), 600);
  }

  getDifficultyRange(level) {
    switch (level) {
      case 1: return [1, 3];
      case 2: return [3, 5];
      case 3: return [5, 7];
      case 4: return [7, 10];
      default: return [1, 3];
    }
  }

  generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  updateDifficulty() {
    if (this.roundCorrect && this.currentRound > 0 && this.difficulty < 4) {
      this.difficulty++;
    }
  }

  beginRound() {
    if (this.ended) return;
    if (this.currentRound >= this.totalItems) return this.end();

    const [min, max] = this.getDifficultyRange(this.difficulty);
    this.requiredCount = this.generateRandomNumber(min, max);

    this.selectedCount = 0;
    this.fedFoods = new Set();
    this.roundStartTime = Date.now();
    this.roundCorrect = false;
    this.cancelDrag();

    this.renderAlien();
    this.renderFoodGrid();
    this.updateCounter();
    this.renderProgress();
    this.updateInstruction();

    this.context.speak(`Feed the alien ${this.requiredCount} items!`);
    console.log(`[FeedAlien] Round ${this.currentRound + 1}: Need ${this.requiredCount}`);
  }

  getFoodEmoji() {
    const worldFoods = {
      space: '🪐',
      beach: '🐚',
      jungle: '🍃',
      studio: '🎨',
      castle: '👑',
      'candy-land': '🍭'
    };
    return worldFoods[this.worldSlug] || '🍎';
  }

  render() {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
      <div class="feed-game">
        <div class="feed-hud">
          <button class="hud-btn" id="feedPauseBtn" aria-label="Pause">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="5" width="4" height="14" rx="1.5"/>
              <rect x="14" y="5" width="4" height="14" rx="1.5"/>
            </svg>
          </button>
          <div class="feed-progress" id="feedProgress"></div>
          <div class="feed-level" id="feedLevel">Level 1</div>
        </div>

        <div class="feed-alien-container" id="feedAlienContainer"></div>
        <div class="feed-instruction" id="feedInstruction">Drag food to the alien's mouth!</div>
        <div class="feed-counter" id="feedCounter">0 / 1</div>
        <div class="feed-grid" id="feedGrid"></div>
        <div class="feed-celebration" id="feedCelebration" style="display:none;">
          <div class="celebration-emoji">🎉</div>
        </div>
      </div>
    `;
    document.getElementById('feedPauseBtn').addEventListener('click', () => this.togglePause());
  }

  renderAlien() {
    const container = document.getElementById('feedAlienContainer');
    if (!container) return;

    if (this._pupilHandler) {
      document.removeEventListener('pointermove', this._pupilHandler);
      this._pupilHandler = null;
    }

    container.innerHTML = `
      <div class="alien-wrapper">
        <div class="alien-thought-bubble" id="alienThought">
          <span class="thought-number">0</span>
        </div>
        <div class="alien" id="alienChar">
          <div class="alien-shadow"></div>
          <div class="antenna"></div>
          <div class="alien-body-shape"></div>
          <div class="alien-belly"></div>
          <div class="foot l"></div>
          <div class="foot r"></div>
          <div class="arm l"></div>
          <div class="arm r"></div>
          <div class="cheek l"></div>
          <div class="cheek r"></div>
          <div class="eye l"><div class="pupil"></div></div>
          <div class="eye r"><div class="pupil"></div></div>
          <div class="mouth-wrap">
            <div class="mouth-drop-target" id="alienMouthTarget" aria-hidden="true"></div>
            <div class="mouth" id="alienMouth">
              <div class="tongue"></div>
            </div>
          </div>
        </div>
      </div>
    `;

    this.setupAlienInteraction();
  }

  setupAlienInteraction() {
    const alienEl = document.getElementById('alienChar');
    const mouth = document.getElementById('alienMouth');
    const pupils = document.querySelectorAll('.pupil');
    if (!alienEl || !mouth) return;

    const updatePupils = (clientX, clientY) => {
      const rect = alienEl.getBoundingClientRect();
      if (!rect.width) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (clientX - cx) / (rect.width / 2);
      const dy = (clientY - cy) / (rect.height / 2);
      const x = Math.max(-1, Math.min(1, dx)) * 8;
      const y = Math.max(-1, Math.min(1, dy)) * 8;
      pupils.forEach(p => {
        p.style.transform = `translate(${x}px, ${y}px)`;
      });
      const dist = Math.hypot(clientX - cx, clientY - cy);
      mouth.classList.toggle('open', dist < rect.width * 0.75 || this.activeDrag !== null);
    };

    this._pupilHandler = e => updatePupils(e.clientX, e.clientY);
    document.addEventListener('pointermove', this._pupilHandler);

    alienEl.addEventListener('pointerenter', () => mouth.classList.add('open'));
    alienEl.addEventListener('pointerleave', () => {
      if (!this.activeDrag) mouth.classList.remove('open');
    });

    mouth.addEventListener('animationend', () => mouth.classList.remove('chomp'));
  }

  triggerChomp() {
    const mouth = document.getElementById('alienMouth');
    if (!mouth) return;
    mouth.classList.remove('chomp');
    void mouth.offsetWidth;
    mouth.classList.add('chomp');
  }

  renderAlienHappy() {
    const alienEl = document.getElementById('alienChar');
    if (alienEl) {
      alienEl.classList.add('alien-happy');
      setTimeout(() => alienEl.classList.remove('alien-happy'), 700);
    }
  }

  renderFoodGrid() {
    const grid = document.getElementById('feedGrid');
    if (!grid) return;
    grid.innerHTML = '';

    const itemCount = Math.max(this.requiredCount + 3, 8);
    const columns = itemCount > 12 ? 5 : itemCount > 9 ? 4 : 4;
    grid.style.setProperty('--feed-grid-columns', String(columns));
    grid.classList.toggle('dense', itemCount > 9);
    grid.classList.toggle('packed', itemCount > 12);

    for (let i = 0; i < itemCount; i++) {
      const food = document.createElement('div');
      food.className = 'food-item';
      food.dataset.foodId = `food-${this.currentRound}-${i}`;
      food.setAttribute('role', 'button');
      food.setAttribute('tabindex', '0');
      food.setAttribute('draggable', 'false');
      food.setAttribute('aria-label', 'Food item');
      food.innerHTML = this.getFoodEmoji();
      food.addEventListener('pointerdown', e => this.startFoodDrag(e, food));
      food.addEventListener('mousedown', e => this.startFoodDrag(e, food));
      food.addEventListener('touchstart', e => this.startFoodDrag(e, food), { passive: false });
      food.addEventListener('dragstart', e => e.preventDefault());
      grid.appendChild(food);
    }
  }

  startFoodDrag(event, foodEl) {
    if (this.roundCorrect || this.activeDrag) return;
    if (this.fedFoods.has(foodEl.dataset.foodId)) return;

    event.preventDefault();
    const point = this.getPoint(event);
    if (!point) return;

    const rect = foodEl.getBoundingClientRect();
    const placeholder = document.createElement('div');
    placeholder.className = 'food-placeholder';
    placeholder.style.width = `${rect.width}px`;
    placeholder.style.height = `${rect.height}px`;

    foodEl.after(placeholder);
    foodEl.classList.add('food-source-hidden');

    // Clone the tile — strip food-item so its animation/transition can't fight us
    const ghost = document.createElement('div');
    ghost.className = 'food-drag-ghost';
    ghost.textContent = foodEl.textContent;
    ghost.style.width = `${rect.width}px`;
    ghost.style.height = `${rect.height}px`;
    ghost.style.borderRadius = '20px';
    ghost.style.background = 'linear-gradient(135deg, #fff8dc, #ffe4b5)';
    ghost.style.border = '3px solid #f59e0b';
    ghost.style.fontSize = foodEl.style.fontSize || window.getComputedStyle(foodEl).fontSize;
    ghost.style.display = 'flex';
    ghost.style.alignItems = 'center';
    ghost.style.justifyContent = 'center';

    const offsetX = point.clientX - rect.left;
    const offsetY = point.clientY - rect.top;
    const startX = rect.left;
    const startY = rect.top;

    // Position: fixed left:0 top:0, move entirely via transform — no CSS fighting
    ghost.style.transform = `translate(${startX}px, ${startY}px) scale(1.1) rotate(-4deg)`;
    document.body.appendChild(ghost);

    this.activeDrag = {
      foodId: foodEl.dataset.foodId,
      sourceEl: foodEl,
      ghostEl: ghost,
      placeholderEl: placeholder,
      pointerId: typeof event.pointerId === 'number' ? event.pointerId : null,
      offsetX,
      offsetY,
      width: rect.width,
      height: rect.height,
      currentLeft: startX,
      currentTop: startY
    };

    if (typeof event.pointerId === 'number' && typeof foodEl.setPointerCapture === 'function') {
      try {
        foodEl.setPointerCapture(event.pointerId);
      } catch (err) {
        // Ignore browsers that reject capture on this target.
      }
    }

    document.body.classList.add('feed-dragging');
    document.addEventListener('pointermove', this.handleDragMove);
    document.addEventListener('pointerup', this.handleDragEnd);
    document.addEventListener('pointercancel', this.handleDragEnd);
    document.addEventListener('mousemove', this.handleDragMove);
    document.addEventListener('mouseup', this.handleDragEnd);
    document.addEventListener('touchmove', this.handleDragMove, { passive: false });
    document.addEventListener('touchend', this.handleDragEnd);
    document.addEventListener('touchcancel', this.handleDragEnd);

    const mouthTarget = document.getElementById('alienMouthTarget');
    if (mouthTarget) mouthTarget.classList.add('active');
    const mouth = document.getElementById('alienMouth');
    if (mouth) mouth.classList.add('open');
  }

  onDragMove(event) {
    if (!this.activeDrag) return;
    if (typeof event.pointerId === 'number' && this.activeDrag.pointerId !== null && event.pointerId !== this.activeDrag.pointerId) {
      return;
    }
    const point = this.getPoint(event);
    if (!point) return;
    if (event.cancelable) event.preventDefault();
    const { ghostEl, offsetX, offsetY } = this.activeDrag;
    const nextLeft = point.clientX - offsetX;
    const nextTop  = point.clientY - offsetY;
    this.activeDrag.currentLeft = nextLeft;
    this.activeDrag.currentTop  = nextTop;
    // translate sets the viewport position directly (ghost has left:0, top:0)
    ghostEl.style.transform = `translate(${nextLeft}px, ${nextTop}px) scale(1.1) rotate(-4deg)`;

    const mouthTarget = document.getElementById('alienMouthTarget');
    if (!mouthTarget) return;
    const hit = this.isGhostOverMouth();
    mouthTarget.classList.toggle('over', hit);
  }

  onDragEnd(event) {
    if (!this.activeDrag) return;
    if (typeof event.pointerId === 'number' && this.activeDrag.pointerId !== null && event.pointerId !== this.activeDrag.pointerId) {
      return;
    }
    this.getPoint(event);

    const mouthTarget = document.getElementById('alienMouthTarget');
    const hit = this.isGhostOverMouth();

    if (hit) {
      this.feedFood(this.activeDrag.foodId, this.activeDrag.sourceEl, this.activeDrag.placeholderEl, this.activeDrag.ghostEl);
    } else {
      this.restoreDraggedFood();
    }

    this.cleanupDragState();
  }

  feedFood(foodId, sourceEl, placeholderEl, ghostEl) {
    this.fedFoods.add(foodId);
    this.selectedCount = this.fedFoods.size;

    // Animate the ghost flying into the mouth, then vanish
    const mouth = document.getElementById('alienMouth');
    if (mouth && ghostEl) {
      const mr = mouth.getBoundingClientRect();
      const mouthCX = mr.left + mr.width  / 2;
      const mouthCY = mr.top  + mr.height / 2;
      const gw = ghostEl.offsetWidth  || this.activeDrag?.width  || 60;
      const gh = ghostEl.offsetHeight || this.activeDrag?.height || 60;
      // Enable transition just for this fly-in
      ghostEl.style.transition = 'transform 0.22s cubic-bezier(0.5, 0, 1, 1), opacity 0.22s ease';
      ghostEl.style.transform  = `translate(${mouthCX - gw / 2}px, ${mouthCY - gh / 2}px) scale(0.05) rotate(20deg)`;
      ghostEl.style.opacity    = '0';
      setTimeout(() => ghostEl.remove(), 240);
    } else {
      ghostEl?.remove();
    }

    placeholderEl.remove();
    sourceEl.remove();

    this.updateCounter();
    this.triggerChomp();
    this.context.speak(String(this.selectedCount));

    if (this.selectedCount === this.requiredCount) {
      this.roundCorrect = true;
      setTimeout(() => this.handleCorrect(), 380);
    }
  }

  restoreDraggedFood() {
    if (!this.activeDrag) return;
    const { sourceEl, ghostEl, placeholderEl } = this.activeDrag;
    ghostEl.remove();
    placeholderEl.remove();
    sourceEl.classList.remove('food-source-hidden');
  }

  cleanupDragState() {
    document.body.classList.remove('feed-dragging');
    document.removeEventListener('pointermove', this.handleDragMove);
    document.removeEventListener('pointerup', this.handleDragEnd);
    document.removeEventListener('pointercancel', this.handleDragEnd);
    document.removeEventListener('mousemove', this.handleDragMove);
    document.removeEventListener('mouseup', this.handleDragEnd);
    document.removeEventListener('touchmove', this.handleDragMove);
    document.removeEventListener('touchend', this.handleDragEnd);
    document.removeEventListener('touchcancel', this.handleDragEnd);

    const mouthTarget = document.getElementById('alienMouthTarget');
    if (mouthTarget) {
      mouthTarget.classList.remove('active');
      mouthTarget.classList.remove('over');
    }
    const mouth = document.getElementById('alienMouth');
    if (mouth) mouth.classList.remove('open');

    this.activeDrag = null;
  }

  getPoint(event) {
    const touch = event?.changedTouches?.[0] || event?.touches?.[0];
    const point = touch || event;
    if (!point || typeof point.clientX !== 'number' || typeof point.clientY !== 'number') {
      return null;
    }
    if (this.activeDrag) {
      this.activeDrag.lastPoint = { clientX: point.clientX, clientY: point.clientY };
    }
    return point;
  }

  isGhostOverMouth() {
    if (!this.activeDrag) return false;
    const mouthTarget = document.getElementById('alienMouthTarget');
    if (!mouthTarget) return false;

    const mouthRect = mouthTarget.getBoundingClientRect();
    const ghostRect = {
      left: this.activeDrag.currentLeft,
      right: this.activeDrag.currentLeft + this.activeDrag.width,
      top: this.activeDrag.currentTop,
      bottom: this.activeDrag.currentTop + this.activeDrag.height
    };
    return !(
      ghostRect.right < mouthRect.left ||
      ghostRect.left > mouthRect.right ||
      ghostRect.bottom < mouthRect.top ||
      ghostRect.top > mouthRect.bottom
    );
  }

  cancelDrag() {
    if (!this.activeDrag) return;
    this.restoreDraggedFood();
    this.cleanupDragState();
  }

  handleCorrect() {
    this.performance.correctItems++;
    const responseTime = Date.now() - this.roundStartTime;
    this.performance.responseTimes.push(responseTime);

    this.performance.roundDetails.push({
      round: this.currentRound + 1,
      required: this.requiredCount,
      difficulty: this.difficulty,
      responseTime,
      correct: true
    });

    this.renderAlienHappy();
    this.updateDifficulty();
    this.context.speak('perfect');
    this.renderCelebration();

    setTimeout(() => {
      this.currentRound++;
      if (this.currentRound < this.totalItems) {
        this.beginRound();
      } else {
        this.end();
      }
    }, 1400);
  }

  updateCounter() {
    const counter = document.getElementById('feedCounter');
    if (counter) {
      counter.textContent = `${this.selectedCount} / ${this.requiredCount}`;
    }

    const thought = document.querySelector('#alienThought .thought-number');
    if (thought) {
      thought.textContent = String(this.selectedCount);
      thought.parentElement?.classList.remove('count-pop');
      void thought.offsetWidth;
      thought.parentElement?.classList.add('count-pop');
    }
  }

  updateInstruction() {
    const instr = document.getElementById('feedInstruction');
    if (instr) {
      instr.textContent = `Drag ${this.requiredCount} items into the alien's mouth!`;
    }

    const level = document.getElementById('feedLevel');
    if (level) {
      level.textContent = `Level ${this.difficulty}`;
    }
  }

  renderProgress() {
    const el = document.getElementById('feedProgress');
    if (!el) return;
    el.innerHTML = '';
    for (let i = 0; i < this.totalItems; i++) {
      const pip = document.createElement('div');
      pip.className = 'feed-pip';
      if (i < this.performance.roundDetails.length) {
        pip.classList.add(this.performance.roundDetails[i].correct ? 'correct' : 'incorrect');
      } else if (i === this.currentRound) {
        pip.classList.add('current');
      }
      el.appendChild(pip);
    }
  }

  renderCelebration() {
    const cel = document.getElementById('feedCelebration');
    if (!cel) return;
    cel.style.display = 'flex';
    setTimeout(() => {
      cel.style.display = 'none';
    }, 1000);
  }

  end() {
    this.ended = true;
    this.cancelDrag();

    if (this._pupilHandler) {
      document.removeEventListener('pointermove', this._pupilHandler);
      this._pupilHandler = null;
    }

    this.performance.accuracy = this.performance.correctItems / this.totalItems;

    if (this.performance.accuracy >= 0.9) {
      this.performance.strengthAreas = ['Advanced counting', 'Accuracy'];
      this.performance.opportunityAreas = [];
    } else if (this.performance.accuracy >= 0.7) {
      this.performance.strengthAreas = ['Good counting skills'];
      this.performance.opportunityAreas = ['Building consistency'];
    } else {
      this.performance.strengthAreas = ['Getting started'];
      this.performance.opportunityAreas = ['Number recognition', 'Counting practice'];
    }

    const nextGameRecommendation = typeof window.getNextGameRecommendation === 'function'
      ? window.getNextGameRecommendation('feed-alien', 'easy', this.performance.accuracy)
      : 'world-reveal';

    this.context.saveSession({
      metrics: {
        accuracy: Math.round(this.performance.accuracy * 100),
        roundsCompleted: this.totalItems,
        averageResponseMs: this.performance.responseTimes.length
          ? Math.round(this.performance.responseTimes.reduce((sum, ms) => sum + ms, 0) / this.performance.responseTimes.length)
          : 0,
        highestDifficulty: this.difficulty
      },
      nextGameRecommendation
    });

    this.showEndScreen();
  }

  showEndScreen() {
    const gameArea = document.getElementById('gameArea');
    const accuracy = Math.round(this.performance.accuracy * 100);
    const stars = this.performance.accuracy >= 0.8 ? 3 : this.performance.accuracy >= 0.6 ? 2 : 1;
    const nextGameType = typeof window.getNextGameRecommendation === 'function'
      ? window.getNextGameRecommendation('feed-alien', 'easy', this.performance.accuracy)
      : 'world-reveal';
    const nextLabel = nextGameType === 'world-reveal' ? 'Back to World' : 'Continue Adventure';

    gameArea.innerHTML = `
      <div class="feed-end-card">
        <div class="feed-end-panel">
          <h1>Alien Satisfied!</h1>
          <p>Great job feeding your new friend!</p>

          <div class="feed-stars">
            ${Array(3).fill(0).map((_, i) => `
              <div class="feed-star ${i < stars ? 'lit' : ''}">⭐</div>
            `).join('')}
          </div>

          <div class="feed-accuracy">${accuracy}% Accurate</div>

          <button class="feed-next-btn" id="feedNextBtn">
            ▶ ${nextLabel.toUpperCase()}
          </button>
        </div>
      </div>
    `;

    const nextBtn = document.getElementById('feedNextBtn');
    if (nextBtn) {
      nextBtn.addEventListener('click', () => this.context.goToNextGame(nextGameType));
    }
  }

  togglePause() {
    // Reserved for future pause handling
  }
}

window.FeedAlienGame = FeedAlienGame;
