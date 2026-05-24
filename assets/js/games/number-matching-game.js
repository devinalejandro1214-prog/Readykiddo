/*
   ReadyKiddo - Number Matching Game
   Count world-themed items, then tap the numeral that matches the set.
*/

class NumberMatchingGame {
  constructor(context) {
    this.context = context;
    this.worldSlug = context.worldSlug || 'space';

    this.totalRounds = 10;
    this.currentRound = 0;
    this.ended = false;
    this.busy = false;

    this.round = null;
    this.countedIndex = 0;
    this.choiceCount = 3;

    this.colors = ['red', 'blue', 'yellow', 'orange', 'green', 'purple'];
    this.worldItems = this.getWorldItemKeys();

    this.performance = {
      correctFirstTry: 0,
      wrongAttempts: 0,
      roundsCompleted: 0,
      responseTimes: [],
      roundDetails: []
    };
  }

  async startGame() {
    this.hideShellCharacter();
    this.renderShell();

    const saved = this.loadProgress();
    if (saved) {
      const resumeRequested = new URLSearchParams(window.location.search).get('resume') === 'true';
      const shouldResume = resumeRequested || await this.showResumePrompt(saved);
      if (shouldResume) {
        this.restoreProgress(saved);
        this.context.syncPhase?.(this.currentRound);
      } else {
        this.clearProgress();
      }
    }

    this.renderProgress();
    setTimeout(() => this.beginRound(), 450);
  }

  hideShellCharacter() {
    const shellCharacter = document.getElementById('gameCharacter');
    if (shellCharacter) shellCharacter.style.display = 'none';
  }

  getWorldItemKeys() {
    if (typeof getWorldItems === 'function') {
      const items = getWorldItems(this.worldSlug);
      if (Array.isArray(items) && items.length) return items;
    }
    return ['star', 'planet', 'rocket'];
  }

  beginRound() {
    if (this.ended) return;
    if (this.currentRound >= this.totalRounds) return this.end();

    const earlyRound = this.currentRound < 5;
    const min = earlyRound ? 1 : 5;
    const max = earlyRound ? 5 : 10;
    const target = this.randomInt(min, max);

    this.choiceCount = earlyRound ? 3 : 4;
    this.countedIndex = 0;
    this.busy = false;
    this.round = {
      target,
      itemKey: this.pick(this.worldItems),
      color: this.pick(this.colors),
      choices: this.buildChoices(target, min, max, this.choiceCount),
      showBadges: earlyRound,
      startedAt: Date.now(),
      hadWrongAttempt: false
    };

    this.renderRound();
    this.renderProgress();
    this.context.speak(`count ${target}`);
  }

  renderShell() {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
      <div class="nm-game">
        <div class="nm-hud">
          <button class="nm-icon-btn" id="nmPauseBtn" aria-label="Pause">
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <rect x="6" y="5" width="4" height="14" rx="1.5"></rect>
              <rect x="14" y="5" width="4" height="14" rx="1.5"></rect>
            </svg>
          </button>
          <div class="nm-progress" id="nmProgress" aria-label="Number matching progress"></div>
          <div class="nm-round-pill" id="nmRoundPill">1 / ${this.totalRounds}</div>
        </div>

        <section class="nm-panel" aria-live="polite">
          <div class="nm-prompt" id="nmPrompt">Tap each item to count.</div>
          <div class="nm-count-cloud" id="nmCountCloud">0</div>
          <div class="nm-item-field" id="nmItemField"></div>
          <div class="nm-choice-row" id="nmChoiceRow"></div>
        </section>

        <div class="nm-pop-layer" id="nmPopLayer" aria-hidden="true"></div>
      </div>
    `;

    document.getElementById('nmPauseBtn')?.addEventListener('click', () => this.togglePause());
  }

  renderRound() {
    const prompt = document.getElementById('nmPrompt');
    const cloud = document.getElementById('nmCountCloud');
    const field = document.getElementById('nmItemField');
    const choices = document.getElementById('nmChoiceRow');
    const roundPill = document.getElementById('nmRoundPill');
    if (!prompt || !cloud || !field || !choices || !roundPill || !this.round) return;

    roundPill.textContent = `${this.currentRound + 1} / ${this.totalRounds}`;
    prompt.textContent = this.round.showBadges
      ? 'Tap each item in order, then match the number.'
      : 'Tap to count each item, then pick the number.';
    cloud.textContent = '0';
    cloud.classList.remove('nm-count-cloud--ready');

    field.innerHTML = Array.from({ length: this.round.target }, (_, index) => `
      <button class="nm-count-item"
              type="button"
              data-index="${index}"
              aria-label="Count item ${index + 1}">
        <span class="nm-svg-wrap">${this.getItemSVG(this.round.itemKey, this.round.color)}</span>
        ${this.round.showBadges ? `<span class="nm-ordinal">${this.ordinal(index + 1)}</span>` : ''}
      </button>
    `).join('');

    field.querySelectorAll('.nm-count-item').forEach(button => {
      button.addEventListener('click', () => this.handleCountTap(button));
    });

    choices.innerHTML = this.round.choices.map(value => `
      <button class="nm-choice-card"
              type="button"
              data-value="${value}"
              aria-label="Number ${value}"
              disabled>
        <span class="nm-choice-svg">${this.getNumberSVG(value, this.pick(this.colors))}</span>
      </button>
    `).join('');

    choices.querySelectorAll('.nm-choice-card').forEach(button => {
      button.addEventListener('click', () => this.handleChoiceTap(button));
    });
  }

  handleCountTap(button) {
    if (this.busy || !this.round) return;

    const index = Number(button.dataset.index);
    if (index !== this.countedIndex) {
      button.classList.remove('nm-count-item--nudge');
      void button.offsetWidth;
      button.classList.add('nm-count-item--nudge');
      this.context.speak(String(this.countedIndex + 1));
      return;
    }

    this.countedIndex++;
    button.classList.add('nm-count-item--counted');
    button.disabled = true;
    this.context.speak(String(this.countedIndex));
    this.updateCountCloud();

    if (this.countedIndex >= this.round.target) {
      this.enableChoices();
    }
  }

  updateCountCloud() {
    const cloud = document.getElementById('nmCountCloud');
    if (!cloud) return;
    cloud.textContent = String(this.countedIndex);
    cloud.classList.remove('nm-count-cloud--pop');
    void cloud.offsetWidth;
    cloud.classList.add('nm-count-cloud--pop');
  }

  enableChoices() {
    const prompt = document.getElementById('nmPrompt');
    const cloud = document.getElementById('nmCountCloud');
    if (prompt) prompt.textContent = `Which card shows ${this.round.target}?`;
    if (cloud) cloud.classList.add('nm-count-cloud--ready');
    document.querySelectorAll('.nm-choice-card').forEach(card => {
      card.disabled = false;
      card.classList.add('nm-choice-card--ready');
    });
    this.context.speak(`find ${this.round.target}`);
  }

  handleChoiceTap(button) {
    if (this.busy || !this.round || button.disabled) return;

    const value = Number(button.dataset.value);
    this.context.speak(String(value));

    if (value === this.round.target) {
      this.handleCorrect(button);
    } else {
      this.handleWrong(button);
    }
  }

  handleCorrect(button) {
    this.busy = true;
    button.classList.add('nm-choice-card--correct');

    const responseTime = Date.now() - this.round.startedAt;
    if (!this.round.hadWrongAttempt) this.performance.correctFirstTry++;
    this.performance.responseTimes.push(responseTime);
    this.performance.roundsCompleted++;
    this.performance.roundDetails.push({
      round: this.currentRound + 1,
      target: this.round.target,
      choices: this.round.choices,
      wrongAttemptsBeforeCorrect: this.round.hadWrongAttempt ? 1 : 0,
      responseTime
    });

    this.context.randomEncouragement();
    this.showRoundPop('Nice!');

    setTimeout(async () => {
      this.currentRound++;
      this.saveProgress();
      await this.context.reportProgress?.(this.currentRound, this.totalRounds);

      if (this.currentRound >= this.totalRounds) {
        this.end();
      } else {
        this.beginRound();
      }
    }, 850);
  }

  handleWrong(button) {
    this.performance.wrongAttempts++;
    this.round.hadWrongAttempt = true;
    button.classList.remove('nm-choice-card--wrong');
    void button.offsetWidth;
    button.classList.add('nm-choice-card--wrong');

    const prompt = document.getElementById('nmPrompt');
    if (prompt) prompt.textContent = `Try again. We counted ${this.round.target}.`;
    this.context.speak('try again');
  }

  renderProgress() {
    const progress = document.getElementById('nmProgress');
    if (!progress) return;
    progress.innerHTML = '';
    for (let i = 0; i < this.totalRounds; i++) {
      const pip = document.createElement('span');
      pip.className = 'nm-pip';
      if (i < this.currentRound) pip.classList.add('nm-pip--done');
      if (i === this.currentRound && !this.ended) pip.classList.add('nm-pip--current');
      progress.appendChild(pip);
    }
  }

  showRoundPop(text) {
    const layer = document.getElementById('nmPopLayer');
    if (!layer) return;
    layer.innerHTML = `<div class="nm-round-pop">${text}</div>`;
    setTimeout(() => {
      if (layer) layer.innerHTML = '';
    }, 720);
  }

  async end() {
    if (this.ended) return;
    this.ended = true;
    this.clearProgress();

    const accuracy = this.totalRounds
      ? this.performance.correctFirstTry / this.totalRounds
      : 1;
    const avgResponseMs = this.performance.responseTimes.length
      ? Math.round(this.performance.responseTimes.reduce((sum, value) => sum + value, 0) / this.performance.responseTimes.length)
      : 0;

    this.context.saveSession({
      metrics: {
        accuracy: Math.round(accuracy * 100),
        roundsCompleted: this.totalRounds,
        correctFirstTry: this.performance.correctFirstTry,
        wrongAttempts: this.performance.wrongAttempts,
        averageResponseMs: avgResponseMs
      },
      nextGameRecommendation: 'space-defender'
    });

    this.context.randomEncouragement();
    await this.context.showCelebration?.({
      accuracy,
      onContinue: () => this.context.goToNextGame('space-defender')
    });

    if (!window.SessionMgr) this.showEndScreen(accuracy);
  }

  showEndScreen(accuracy) {
    const gameArea = document.getElementById('gameArea');
    const pct = Math.round(accuracy * 100);
    gameArea.innerHTML = `
      <div class="nm-end-card">
        <div class="nm-end-panel">
          <h1>Number Star</h1>
          <p>You counted every group.</p>
          <div class="nm-end-score">${pct}%</div>
          <button class="nm-next-btn" id="nmNextBtn">Continue</button>
        </div>
      </div>
    `;
    document.getElementById('nmNextBtn')?.addEventListener('click', () => {
      this.context.goToNextGame('space-defender');
    });
  }

  togglePause() {
    if (this.ended) return;
    const existing = document.getElementById('nmPauseOverlay');
    if (existing) {
      existing.remove();
      this.busy = false;
      return;
    }

    this.busy = true;
    const overlay = document.createElement('div');
    overlay.className = 'nm-pause-overlay';
    overlay.id = 'nmPauseOverlay';
    overlay.innerHTML = `
      <div class="nm-pause-panel">
        <h2>Paused</h2>
        <button class="nm-pause-btn nm-pause-btn--primary" id="nmResumeBtn">Resume</button>
        <button class="nm-pause-btn" id="nmSaveExitBtn">Save and Exit</button>
      </div>
    `;
    document.body.appendChild(overlay);
    document.getElementById('nmResumeBtn')?.addEventListener('click', () => {
      overlay.remove();
      this.busy = false;
    });
    document.getElementById('nmSaveExitBtn')?.addEventListener('click', () => {
      this.saveProgress();
      window.location.href = 'world-reveal.html';
    });
  }

  saveProgress() {
    if (this.ended) return;
    localStorage.setItem(this.getProgressKey(), JSON.stringify({
      currentRound: this.currentRound,
      performance: this.performance,
      savedAt: Date.now()
    }));
  }

  loadProgress() {
    const raw = localStorage.getItem(this.getProgressKey());
    if (!raw) return null;
    try {
      const state = JSON.parse(raw);
      if (!state || typeof state.currentRound !== 'number') return null;
      if (state.currentRound <= 0 || state.currentRound >= this.totalRounds) return null;
      return state;
    } catch (_) {
      return null;
    }
  }

  restoreProgress(state) {
    this.currentRound = Math.max(0, Math.min(this.totalRounds - 1, state.currentRound || 0));
    if (state.performance) {
      this.performance = {
        ...this.performance,
        ...state.performance,
        responseTimes: Array.isArray(state.performance.responseTimes) ? state.performance.responseTimes : [],
        roundDetails: Array.isArray(state.performance.roundDetails) ? state.performance.roundDetails : []
      };
    }
  }

  clearProgress() {
    localStorage.removeItem(this.getProgressKey());
  }

  getProgressKey() {
    return `numberMatchingProgress_${this.context.childId}`;
  }

  showResumePrompt(saved) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'nm-pause-overlay';
      overlay.innerHTML = `
        <div class="nm-pause-panel">
          <h2>Welcome back</h2>
          <p>You finished ${saved.currentRound} of ${this.totalRounds} rounds.</p>
          <button class="nm-pause-btn nm-pause-btn--primary" id="nmResumeSavedBtn">Continue</button>
          <button class="nm-pause-btn" id="nmStartFreshBtn">Start Fresh</button>
        </div>
      `;
      document.body.appendChild(overlay);
      document.getElementById('nmResumeSavedBtn')?.addEventListener('click', () => {
        overlay.remove();
        resolve(true);
      });
      document.getElementById('nmStartFreshBtn')?.addEventListener('click', () => {
        overlay.remove();
        resolve(false);
      });
    });
  }

  getItemSVG(itemKey, color) {
    if (typeof ITEM_GENERATORS !== 'undefined' && ITEM_GENERATORS[itemKey]) {
      return ITEM_GENERATORS[itemKey](color);
    }
    return `<svg viewBox="0 0 100 100" aria-hidden="true"><circle cx="50" cy="50" r="38" fill="#f4c83b"/></svg>`;
  }

  getNumberSVG(value, color) {
    if (typeof ITEM_GENERATORS !== 'undefined' && ITEM_GENERATORS.number) {
      return ITEM_GENERATORS.number(value)(color);
    }
    return `<span class="nm-number-fallback">${value}</span>`;
  }

  buildChoices(target, min, max, count) {
    const pool = [];
    for (let n = min; n <= max; n++) {
      if (n !== target) pool.push(n);
    }
    return this.shuffle([target, ...this.shuffle(pool).slice(0, count - 1)]);
  }

  ordinal(value) {
    const suffix = value === 1 ? 'st' : value === 2 ? 'nd' : value === 3 ? 'rd' : 'th';
    return `${value}${suffix}`;
  }

  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  pick(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  shuffle(items) {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

window.NumberMatchingGame = NumberMatchingGame;
