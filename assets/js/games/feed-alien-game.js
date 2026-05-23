/*
   ReadyKiddo - Feed the Alien Game
   6 rounds — drag food from the basket into the alien's mouth.
   Hold the basket → food pops out → drag to mouth.
*/

class FeedAlienGame {
  constructor(context) {
    this.context = context;
    this.worldSlug = context.worldSlug;

    this.totalItems = 6;
    this.currentRound = 0;
    this.ended = false;

    this.difficulty = 1;

    this.requiredCount = 0;
    this.selectedCount = 0;
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
    this.handleDragEnd  = this.onDragEnd.bind(this);
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
    this.roundStartTime = Date.now();
    this.roundCorrect = false;
    this.cancelDrag();

    this.renderAlien();
    this.renderBasket();
    this.updateCounter();
    this.renderProgress();
    this.updateInstruction();

    this.context.speak(this.getRoundSpokenPrompt());
    console.log(`[FeedAlien] Round ${this.currentRound + 1}: Need ${this.requiredCount}`);
  }

  getRoundSpokenPrompt() {
    const noun = this.requiredCount === 1
      ? 'piece of food from the basket'
      : 'pieces of food from the basket';
    return `feed the alien ${this.requiredCount} ${noun}`;
  }

  getRoundVisualText() {
    const treats = this.requiredCount === 1 ? 'treat' : 'treats';
    return `Feed the alien ${this.requiredCount} ${treats}! Drag the food from the basket to feed him.`;
  }

  getFoodSVG() {
    // Map each world to its primary item + a warm colour that reads well
    // on the cream ghost tile and the basket peeks.
    const worldFoods = {
      space:        { item: 'star',      color: 'yellow'  },
      beach:        { item: 'starfish',  color: 'orange'  },
      jungle:       { item: 'fruit',     color: 'red'     },
      studio:       { item: 'paintblob', color: 'purple'  },
      castle:       { item: 'gem',       color: 'blue'    },
      'candy-land': { item: 'lollipop',  color: 'red'     },
    };
    const { item, color } = worldFoods[this.worldSlug] || { item: 'star', color: 'yellow' };
    if (typeof ITEM_GENERATORS !== 'undefined' && ITEM_GENERATORS[item]) {
      return ITEM_GENERATORS[item](color);
    }
    // Final fallback — shouldn't occur if item-data.js is loaded
    return '<svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="42" fill="#f4c83b"/></svg>';
  }

  /* ─── Shell HTML ─────────────────────────────────────── */

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

        <div class="feed-basket-area" id="feedBasketArea"></div>

        <div class="feed-celebration" id="feedCelebration" style="display:none;">
          <div class="celebration-emoji">🎉</div>
        </div>
      </div>
    `;
    document.getElementById('feedPauseBtn').addEventListener('click', () => this.togglePause());
  }

  /* ─── Alien ──────────────────────────────────────────── */

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
    const mouth   = document.getElementById('alienMouth');
    const pupils  = document.querySelectorAll('.pupil');
    if (!alienEl || !mouth) return;

    const updatePupils = (clientX, clientY) => {
      const rect = alienEl.getBoundingClientRect();
      if (!rect.width) return;
      const cx = rect.left + rect.width / 2;
      const cy = rect.top  + rect.height / 2;
      const dx = (clientX - cx) / (rect.width  / 2);
      const dy = (clientY - cy) / (rect.height / 2);
      const x  = Math.max(-1, Math.min(1, dx)) * 8;
      const y  = Math.max(-1, Math.min(1, dy)) * 8;
      pupils.forEach(p => { p.style.transform = `translate(${x}px, ${y}px)`; });
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

  /* ─── Basket ─────────────────────────────────────────── */

  renderBasket() {
    const area = document.getElementById('feedBasketArea');
    if (!area) return;

    const svg = this.getFoodSVG();
    area.innerHTML = `
      <div class="feed-basket" id="feedBasket"
           role="button" tabindex="0"
           aria-label="Food basket — hold and drag to feed the alien">
        <div class="basket-peeks">
          <div class="basket-peek" style="animation-delay:0s">${svg}</div>
          <div class="basket-peek" style="animation-delay:.25s">${svg}</div>
          <div class="basket-peek" style="animation-delay:.5s">${svg}</div>
        </div>
        <div class="basket-body">🧺</div>
      </div>
      <p class="basket-hint">Hold &amp; drag to feed!</p>
    `;

    const basket = document.getElementById('feedBasket');
    basket.addEventListener('pointerdown', e => this.startBasketDrag(e));
    basket.addEventListener('mousedown',   e => this.startBasketDrag(e));
    basket.addEventListener('touchstart',  e => this.startBasketDrag(e), { passive: false });
    basket.addEventListener('dragstart',   e => e.preventDefault());
  }

  /* ─── Drag — Start ───────────────────────────────────── */

  startBasketDrag(event) {
    if (this.roundCorrect || this.activeDrag) return;
    event.preventDefault();

    const point = this.getPoint(event);
    if (!point) return;

    const basket = document.getElementById('feedBasket');
    if (!basket) return;

    const bRect    = basket.getBoundingClientRect();
    const ghostSize = 72;
    const startX   = bRect.left + bRect.width  / 2 - ghostSize / 2;
    const startY   = bRect.top  + bRect.height / 2 - ghostSize / 2;

    // Build ghost tile — SVG item centred in a cream rounded tile
    const ghost = document.createElement('div');
    ghost.className = 'food-drag-ghost';
    ghost.innerHTML = this.getFoodSVG();
    ghost.style.width        = `${ghostSize}px`;
    ghost.style.height       = `${ghostSize}px`;
    ghost.style.borderRadius = '20px';
    ghost.style.background   = 'linear-gradient(135deg, #fff8dc, #ffe4b5)';
    ghost.style.border       = '3px solid #f59e0b';
    ghost.style.display      = 'flex';
    ghost.style.alignItems   = 'center';
    ghost.style.justifyContent = 'center';
    ghost.style.padding      = '8px';
    // Start at basket, small → pop into full size
    ghost.style.transform    = `translate(${startX}px, ${startY}px) scale(0.5) rotate(-6deg)`;
    document.body.appendChild(ghost);

    // Pop-out animation
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ghost.style.transition = 'transform 0.18s cubic-bezier(0.34, 1.56, 0.64, 1)';
        ghost.style.transform  = `translate(${startX}px, ${startY}px) scale(1.15) rotate(-4deg)`;
        setTimeout(() => { ghost.style.transition = 'none'; }, 200);
      });
    });

    const offsetX = point.clientX - startX;
    const offsetY = point.clientY - startY;

    this.activeDrag = {
      ghostEl:     ghost,
      pointerId:   typeof event.pointerId === 'number' ? event.pointerId : null,
      offsetX,
      offsetY,
      width:        ghostSize,
      height:       ghostSize,
      currentLeft:  startX,
      currentTop:   startY
    };

    // Pointer capture so move events follow the finger even off-element
    if (typeof event.pointerId === 'number') {
      try { basket.setPointerCapture(event.pointerId); } catch (_) {}
    }

    document.body.classList.add('feed-dragging');
    document.addEventListener('pointermove',  this.handleDragMove);
    document.addEventListener('pointerup',    this.handleDragEnd);
    document.addEventListener('pointercancel', this.handleDragEnd);
    document.addEventListener('mousemove',    this.handleDragMove);
    document.addEventListener('mouseup',      this.handleDragEnd);
    document.addEventListener('touchmove',    this.handleDragMove, { passive: false });
    document.addEventListener('touchend',     this.handleDragEnd);
    document.addEventListener('touchcancel',  this.handleDragEnd);

    const mouthTarget = document.getElementById('alienMouthTarget');
    if (mouthTarget) mouthTarget.classList.add('active');
    const mouth = document.getElementById('alienMouth');
    if (mouth) mouth.classList.add('open');
  }

  /* ─── Drag — Move ────────────────────────────────────── */

  onDragMove(event) {
    if (!this.activeDrag) return;
    if (typeof event.pointerId === 'number' &&
        this.activeDrag.pointerId !== null &&
        event.pointerId !== this.activeDrag.pointerId) return;

    const point = this.getPoint(event);
    if (!point) return;
    if (event.cancelable) event.preventDefault();

    const { ghostEl, offsetX, offsetY } = this.activeDrag;
    const nextLeft = point.clientX - offsetX;
    const nextTop  = point.clientY - offsetY;
    this.activeDrag.currentLeft = nextLeft;
    this.activeDrag.currentTop  = nextTop;
    ghostEl.style.transform = `translate(${nextLeft}px, ${nextTop}px) scale(1.1) rotate(-4deg)`;

    const mouthTarget = document.getElementById('alienMouthTarget');
    if (mouthTarget) mouthTarget.classList.toggle('over', this.isGhostOverMouth());
  }

  /* ─── Drag — End ─────────────────────────────────────── */

  onDragEnd(event) {
    if (!this.activeDrag) return;
    if (typeof event.pointerId === 'number' &&
        this.activeDrag.pointerId !== null &&
        event.pointerId !== this.activeDrag.pointerId) return;

    const point = this.getPoint(event);

    // Update ghost coords from final drop so hit-test works
    // even when no intermediate move events fired
    if (point) {
      const { offsetX, offsetY } = this.activeDrag;
      this.activeDrag.currentLeft = point.clientX - offsetX;
      this.activeDrag.currentTop  = point.clientY - offsetY;
    }

    const mouthTarget = document.getElementById('alienMouthTarget');
    let hit = this.isGhostOverMouth();

    // Fallback: cursor itself lands on or near the mouth
    if (!hit && point && mouthTarget) {
      const mr  = mouthTarget.getBoundingClientRect();
      const pad = 40;
      hit = point.clientX >= mr.left  - pad &&
            point.clientX <= mr.right  + pad &&
            point.clientY >= mr.top    - pad &&
            point.clientY <= mr.bottom + pad;
    }

    if (hit) {
      this.feedFood(this.activeDrag.ghostEl);
    } else {
      this.returnToBasket(this.activeDrag.ghostEl);
    }

    this.cleanupDragState();
  }

  /* ─── Feed ───────────────────────────────────────────── */

  feedFood(ghostEl) {
    this.selectedCount++;

    // Fly ghost into mouth
    const mouth = document.getElementById('alienMouth');
    if (mouth && ghostEl) {
      const mr     = mouth.getBoundingClientRect();
      const mouthCX = mr.left + mr.width  / 2;
      const mouthCY = mr.top  + mr.height / 2;
      const gw = ghostEl.offsetWidth  || this.activeDrag?.width  || 72;
      const gh = ghostEl.offsetHeight || this.activeDrag?.height || 72;
      ghostEl.style.transition = 'transform 0.22s cubic-bezier(0.5,0,1,1), opacity 0.22s ease';
      ghostEl.style.transform  = `translate(${mouthCX - gw/2}px, ${mouthCY - gh/2}px) scale(0.05) rotate(20deg)`;
      ghostEl.style.opacity    = '0';
      setTimeout(() => ghostEl.remove(), 240);
    } else {
      ghostEl?.remove();
    }

    this.updateCounter();
    this.triggerChomp();
    this.context.speak(String(this.selectedCount));
    this._animateBasketRefill();

    if (this.selectedCount === this.requiredCount) {
      this.roundCorrect = true;
      setTimeout(() => this.handleCorrect(), 380);
    }
  }

  // Ghost snaps back to basket when dropped outside mouth
  returnToBasket(ghostEl) {
    if (!ghostEl) return;
    const basket = document.getElementById('feedBasket');
    if (basket) {
      const br = basket.getBoundingClientRect();
      const tx = br.left + br.width  / 2 - (this.activeDrag?.width  || 72) / 2;
      const ty = br.top  + br.height / 2 - (this.activeDrag?.height || 72) / 2;
      ghostEl.style.transition = 'transform 0.28s cubic-bezier(0.4,0,0.6,1), opacity 0.28s ease';
      ghostEl.style.transform  = `translate(${tx}px, ${ty}px) scale(0.2) rotate(10deg)`;
      ghostEl.style.opacity    = '0';
    } else {
      ghostEl.style.transition = 'opacity 0.2s ease';
      ghostEl.style.opacity    = '0';
    }
    setTimeout(() => ghostEl.remove(), 300);
  }

  _animateBasketRefill() {
    const basket = document.getElementById('feedBasket');
    if (!basket) return;
    basket.classList.remove('basket-refill');
    void basket.offsetWidth;
    basket.classList.add('basket-refill');
    basket.addEventListener('animationend', () => {
      basket.classList.remove('basket-refill');
    }, { once: true });
  }

  /* ─── Drag cleanup ───────────────────────────────────── */

  cleanupDragState() {
    document.body.classList.remove('feed-dragging');
    document.removeEventListener('pointermove',   this.handleDragMove);
    document.removeEventListener('pointerup',     this.handleDragEnd);
    document.removeEventListener('pointercancel', this.handleDragEnd);
    document.removeEventListener('mousemove',     this.handleDragMove);
    document.removeEventListener('mouseup',       this.handleDragEnd);
    document.removeEventListener('touchmove',     this.handleDragMove);
    document.removeEventListener('touchend',      this.handleDragEnd);
    document.removeEventListener('touchcancel',   this.handleDragEnd);

    const mouthTarget = document.getElementById('alienMouthTarget');
    if (mouthTarget) {
      mouthTarget.classList.remove('active');
      mouthTarget.classList.remove('over');
    }
    const mouth = document.getElementById('alienMouth');
    if (mouth) mouth.classList.remove('open');

    this.activeDrag = null;
  }

  cancelDrag() {
    if (!this.activeDrag) return;
    this.activeDrag.ghostEl?.remove();
    this.cleanupDragState();
  }

  /* ─── Point helper ───────────────────────────────────── */

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

  /* ─── Hit-test ───────────────────────────────────────── */

  isGhostOverMouth() {
    if (!this.activeDrag) return false;
    const mouthTarget = document.getElementById('alienMouthTarget');
    if (!mouthTarget) return false;

    const mr = mouthTarget.getBoundingClientRect();
    const gr = {
      left:   this.activeDrag.currentLeft,
      right:  this.activeDrag.currentLeft + this.activeDrag.width,
      top:    this.activeDrag.currentTop,
      bottom: this.activeDrag.currentTop  + this.activeDrag.height
    };
    return !(gr.right < mr.left || gr.left > mr.right ||
             gr.bottom < mr.top || gr.top  > mr.bottom);
  }

  /* ─── Round correct ──────────────────────────────────── */

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
    this.context.randomEncouragement();
    this.renderCelebration();

    setTimeout(async () => {
      this.currentRound++;
      // Report progress after increment so current = completed rounds
      await this.context.reportProgress(this.currentRound, this.totalItems);
      if (this.currentRound < this.totalItems) {
        this.beginRound();
      } else {
        this.end();
      }
    }, 1400);
  }

  /* ─── UI helpers ─────────────────────────────────────── */

  updateCounter() {
    const counter = document.getElementById('feedCounter');
    if (counter) counter.textContent = `${this.selectedCount} / ${this.requiredCount}`;

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
    if (instr) instr.textContent = this.getRoundVisualText();

    const level = document.getElementById('feedLevel');
    if (level) level.textContent = `Level ${this.difficulty}`;
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
    setTimeout(() => { cel.style.display = 'none'; }, 1000);
  }

  /* ─── End ────────────────────────────────────────────── */

  async end() {
    this.ended = true;
    this.cancelDrag();

    // Cleanup listener first — no interaction possible after this
    if (this._pupilHandler) {
      document.removeEventListener('pointermove', this._pupilHandler);
      this._pupilHandler = null;
    }

    this.performance.accuracy = this.performance.correctItems / this.totalItems;

    if (this.performance.accuracy >= 0.9) {
      this.performance.strengthAreas  = ['Advanced counting', 'Accuracy'];
      this.performance.opportunityAreas = [];
    } else if (this.performance.accuracy >= 0.7) {
      this.performance.strengthAreas  = ['Good counting skills'];
      this.performance.opportunityAreas = ['Building consistency'];
    } else {
      this.performance.strengthAreas  = ['Getting started'];
      this.performance.opportunityAreas = ['Number recognition', 'Counting practice'];
    }

    // Resolve next game once for both parent data and child button
    const nextGameType = typeof window.getNextGameRecommendation === 'function'
      ? window.getNextGameRecommendation('feed-alien', 'easy', this.performance.accuracy)
      : 'world-reveal';

    // Parent-only summary — hidden from child-facing celebration
    this.context.saveSession({
      metrics: {
        accuracy: Math.round(this.performance.accuracy * 100),
        roundsCompleted: this.totalItems,
        averageResponseMs: this.performance.responseTimes.length
          ? Math.round(this.performance.responseTimes.reduce((a, b) => a + b, 0) / this.performance.responseTimes.length)
          : 0,
        highestDifficulty: this.difficulty
      },
      nextGameRecommendation: nextGameType   // matches onContinue below
    });

    // characterAnimation not called here — celebration overlay (z-index 9200)
    // fully covers the character (z-index 5), so it would be invisible.
    this.context.randomEncouragement();

    await this.context.showCelebration({
      accuracy: this.performance.accuracy,
      onContinue: () => this.context.goToNextGame(nextGameType)
    });
  }

  togglePause() {
    // Reserved for future pause handling
  }
}

window.FeedAlienGame = FeedAlienGame;
