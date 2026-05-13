/* ─────────────────────────────────────────────────────────
   ReadyKiddo — Feed the Alien Game
   6 rounds: Dynamic difficulty based on performance
   Numbers: 2-20, but capped at 10 if accuracy < 65%
   Skip ahead if child passes round 1 easily
   ───────────────────────────────────────────────────────── */

class FeedAlienGame {
  constructor(context) {
    this.context = context;
    this.worldSlug = context.worldSlug;

    // Game state
    this.totalItems = 6;           // 6 rounds
    this.currentRound = 0;         // 0-5
    this.ended = false;

    // Difficulty tracking
    this.difficulty = 1;           // Current difficulty level (1-4)
    this.skippedRound1 = false;    // Did child skip past easy?
    this.accuracyThreshold = 0.65; // 65% threshold
    this.maxNumber = 20;           // Default max
    this.canReachMax = true;       // Will be false if accuracy < 65%

    // Current round state
    this.requiredCount = 0;        // How many to feed alien
    this.selectedCount = 0;        // How many child has selected
    this.selectedFoods = new Set();
    this.roundStartTime = 0;
    this.roundCorrect = false;

    // Performance tracking
    this.performance = {
      correctItems: 0,
      totalItems: 6,
      responseTimes: [],
      roundDetails: [],
      accuracy: 0,
      strengthAreas: [],
      opportunityAreas: []
    };

    // Pupil tracking cleanup
    this._pupilHandler = null;
  }

  /* ── Lifecycle ──────────────────────────────────────────── */

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

  /* ── Difficulty System ──────────────────────────────────── */

  getDifficultyRange(level) {
    // Returns [min, max] range for numbers to generate
    switch (level) {
      case 1: return [2, 5];       // Very easy
      case 2: return [6, 10];      // Easy
      case 3: return [11, 15];     // Medium (+5 progression)
      case 4: return [16, this.maxNumber]; // Hard (+5 progression)
      default: return [2, 5];
    }
  }

  generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  updateDifficulty() {
    // Called after each round to check if difficulty should change
    const currentAccuracy = this.performance.correctItems / (this.currentRound + 1);

    // Check if we should cap at 10 based on overall accuracy
    if (currentAccuracy < this.accuracyThreshold && this.maxNumber > 10) {
      this.maxNumber = 10;
      this.canReachMax = false;
      console.log('[FeedAlien] Accuracy below 65%, capping at 10');
    }

    // Check if should skip ahead after round 1
    if (this.currentRound === 0 && this.roundCorrect) {
      const wasEasy = this.requiredCount <= 3; // Very quick/easy pass
      if (wasEasy && this.difficulty < 3) {
        this.difficulty = 3; // Skip ahead to medium
        this.skippedRound1 = true;
        console.log('[FeedAlien] Skipping to difficulty 3 (fast pass on round 1)');
      }
    }

    // Progressive difficulty increase
    if (this.currentRound > 0 && this.roundCorrect && !this.skippedRound1) {
      // Normal progression: 1→2→3→4
      if (this.difficulty < 4) {
        this.difficulty++;
      }
    }
  }

  /* ── Round Management ───────────────────────────────────── */

  beginRound() {
    if (this.ended) return;
    if (this.currentRound >= this.totalItems) return this.end();

    // Generate required count for this round
    const [min, max] = this.getDifficultyRange(this.difficulty);
    this.requiredCount = this.generateRandomNumber(min, max);

    // Reset round state
    this.selectedCount = 0;
    this.selectedFoods = new Set();
    this.roundStartTime = Date.now();
    this.roundCorrect = false;

    // Update UI
    this.renderAlien();
    this.renderFoodGrid();
    this.updateCounter();
    this.renderProgress();
    this.updateInstruction();

    // Provide audio feedback
    const feedText = `Feed the alien ${this.requiredCount} items!`;
    this.context.speak(feedText);

    console.log(`[FeedAlien] Round ${this.currentRound + 1}: Need ${this.requiredCount} (Level ${this.difficulty})`);
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

  toggleFoodItem(foodId) {
    if (this.roundCorrect) return;

    if (this.selectedFoods.has(foodId)) {
      this.selectedFoods.delete(foodId);
      this.selectedCount = this.selectedFoods.size;
      this.updateCounter();
      this.context.speak('removed');
      return;
    }

    if (this.selectedCount >= this.requiredCount) return;

    this.selectedFoods.add(foodId);
    this.selectedCount = this.selectedFoods.size;
    this.updateCounter();

    // Chomp + play selection sound
    this.triggerChomp();
    this.context.speak('got it');

    // Check if correct
    if (this.selectedCount === this.requiredCount) {
      this.roundCorrect = true;
      this.handleCorrect();
    }
  }

  handleCorrect() {
    this.performance.correctItems++;
    const responseTime = Date.now() - this.roundStartTime;
    this.performance.responseTimes.push(responseTime);

    this.performance.roundDetails.push({
      round: this.currentRound + 1,
      required: this.requiredCount,
      difficulty: this.difficulty,
      responseTime: responseTime,
      correct: true
    });

    this.renderAlienHappy();

    // Update difficulty for next round
    this.updateDifficulty();

    // Celebration then next round
    this.context.speak('perfect');
    this.renderCelebration();
    setTimeout(() => {
      this.currentRound++;
      if (this.currentRound < this.totalItems) {
        this.beginRound();
      } else {
        this.end();
      }
    }, 1500);
  }

  /* ── Rendering ──────────────────────────────────────────── */

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
        <div class="feed-instruction" id="feedInstruction">Feed the hungry alien!</div>
        <div class="feed-counter" id="feedCounter">0 / 2</div>
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

    // Clean up any existing pupil handler before re-rendering
    if (this._pupilHandler) {
      document.removeEventListener('pointermove', this._pupilHandler);
      this._pupilHandler = null;
    }

    container.innerHTML = `
      <div class="alien-wrapper">
        <div class="alien-thought-bubble" id="alienThought">
          <span class="thought-number">${this.requiredCount}</span>
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
      mouth.classList.toggle('open', dist < rect.width * 0.75);
    };

    this._pupilHandler = (e) => updatePupils(e.clientX, e.clientY);
    document.addEventListener('pointermove', this._pupilHandler);

    alienEl.addEventListener('pointerenter', () => mouth.classList.add('open'));
    alienEl.addEventListener('pointerleave', () => mouth.classList.remove('open'));

    mouth.addEventListener('animationend', () => mouth.classList.remove('chomp'));
  }

  triggerChomp() {
    const mouth = document.getElementById('alienMouth');
    if (!mouth) return;
    mouth.classList.remove('chomp');
    void mouth.offsetWidth; // force reflow so animation restarts
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
    const itemCount = Math.max(8, Math.min(this.requiredCount + 2, 20));
    const columns = itemCount > 16 ? 5 : itemCount > 12 ? 4 : 4;
    grid.style.setProperty('--feed-grid-columns', String(columns));
    grid.classList.toggle('dense', itemCount > 12);
    grid.classList.toggle('packed', itemCount > 16);

    // Create enough food items for the requested count, plus a small buffer.
    for (let i = 0; i < itemCount; i++) {
      const food = document.createElement('button');
      food.className = 'food-item';
      food.type = 'button';
      food.dataset.foodId = `food-${this.currentRound}-${i}`;
      food.setAttribute('aria-label', 'Food item');
      food.innerHTML = this.getFoodEmoji();
      food.addEventListener('click', () => this.toggleFoodItem(food.dataset.foodId));
      grid.appendChild(food);
    }
  }

  updateCounter() {
    const counter = document.getElementById('feedCounter');
    if (counter) {
      counter.textContent = `${this.selectedCount} / ${this.requiredCount}`;
    }

    // Update visual feedback
    const foodItems = document.querySelectorAll('.food-item');
    foodItems.forEach(item => {
      item.classList.toggle('selected', this.selectedFoods.has(item.dataset.foodId));
    });
  }

  updateInstruction() {
    const instr = document.getElementById('feedInstruction');
    if (instr) {
      instr.textContent = `Feed the alien ${this.requiredCount} items!`;
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
    if (cel) {
      cel.style.display = 'flex';
      setTimeout(() => {
        cel.style.display = 'none';
      }, 1000);
    }
  }

  /* ── End Game ──────────────────────────────────────────── */

  end() {
    this.ended = true;

    // Clean up pupil tracking listener
    if (this._pupilHandler) {
      document.removeEventListener('pointermove', this._pupilHandler);
      this._pupilHandler = null;
    }

    // Calculate final accuracy
    this.performance.accuracy = this.performance.correctItems / this.totalItems;

    // Determine strengths and opportunities
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
      ? window.getNextGameRecommendation('feed-alien', this.canReachMax ? 'hard' : 'easy', this.performance.accuracy)
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
      ? window.getNextGameRecommendation('feed-alien', this.canReachMax ? 'hard' : 'easy', this.performance.accuracy)
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
    // Implement pause logic if needed
  }
}

// Ensure the class is globally accessible
window.FeedAlienGame = FeedAlienGame;
