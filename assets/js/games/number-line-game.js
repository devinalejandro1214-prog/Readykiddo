/*
   ReadyKiddo - Letter Line Game
   Alien asks child to fill missing letters on an A-J or K-T line.
   Drag the correct tile onto the active slot. Wrong drops spring back.
*/

class NumberLineGame {
  constructor(context) {
    this.context = context;
    this.letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

    this.rounds = [
      { start: 0, gaps: 1, decoys: 2, mode: 'fixed' },
      { start: 10, gaps: 2, decoys: 3, mode: 'fixed' },
      { gaps: 2, decoys: 3, mode: 'random' },
      { gaps: 2, decoys: 4, mode: 'random' },
      { gaps: 3, decoys: 4, mode: 'random' },
      { gaps: 3, decoys: 4, mode: 'random' }
    ];

    this.currentRound = 0;
    this.activeGapIdx = 0;
    this.gapPositions = [];
    this.sequence = [];

    this._pupilHandler = null;
    this._dragState = null;

    this.performance = {
      totalGaps: 0,
      correctFirst: 0,
      wrongAttempts: 0
    };
  }

  async startGame() {
    this.currentRound = 0;
    this.beginRound();
  }

  beginRound() {
    const cfg = this.rounds[this.currentRound];
    this.sequence = cfg.mode === 'random'
      ? this._buildRandomSequence()
      : this.letters.slice(cfg.start, cfg.start + 10);
    this.gapPositions = this._pickGaps(cfg.gaps).sort((a, b) => a - b);
    this.activeGapIdx = 0;
    this.performance.totalGaps += cfg.gaps;
    this._render();
    this._speakActivePrompt();
  }

  _render() {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
      <div class="nl-layout">
        ${this._alienHTML()}
        ${this._lineHTML()}
        ${this._trayHTML()}
      </div>
    `;
    this._setupAlienInteraction();
    this._setupDragDrop();
  }

  _alienHTML() {
    const target = this.sequence[this.gapPositions[this.activeGapIdx]];
    return `
      <div class="nl-alien-area">
        <div class="nl-alien" id="nlAlienChar">
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
            <div class="mouth" id="nlMouth">
              <div class="tongue"></div>
            </div>
          </div>
        </div>
        <div class="nl-bubble" id="nlBubble">
          <span class="nl-bubble-text">Where does <strong>${target}</strong> go?</span>
        </div>
      </div>
    `;
  }

  _lineHTML() {
    const slots = this.sequence.map((letter, idx) => {
      const gapOrder = this.gapPositions.indexOf(idx);
      const isGap = gapOrder !== -1;
      const alreadyFilled = gapOrder !== -1 && gapOrder < this.activeGapIdx;
      const isActive = gapOrder === this.activeGapIdx;

      if (!isGap || alreadyFilled) {
        return `<div class="nl-bubble-slot nl-bubble-slot--filled ${alreadyFilled ? 'nl-bubble-slot--placed' : ''}" data-letter="${letter}">${letter}</div>`;
      }
      if (isActive) {
        return `<div class="nl-bubble-slot nl-bubble-slot--active" data-idx="${idx}" data-letter="${letter}" id="nlActiveSlot"></div>`;
      }
      return `<div class="nl-bubble-slot nl-bubble-slot--waiting" data-idx="${idx}" data-letter="${letter}"></div>`;
    });

    return `
      <div class="nl-line-area">
        <div class="nl-track-wrap">
          <div class="nl-track"></div>
          <div class="nl-slots">${slots.join('')}</div>
        </div>
        <div class="nl-round-label">Round ${this.currentRound + 1} of ${this.rounds.length}</div>
      </div>
    `;
  }

  _trayHTML() {
    const cfg = this.rounds[this.currentRound];
    const remaining = this.gapPositions.slice(this.activeGapIdx).map(i => this.sequence[i]);
    const decoys = this._generateDecoys(remaining, this.sequence, cfg.decoys);
    const tiles = this._shuffle([...remaining, ...decoys]);

    return `
      <div class="nl-tray" id="nlTray" aria-label="Letter choices">
        ${tiles.map(letter => `
          <div class="nl-tile" data-value="${letter}" draggable="false" role="button" aria-label="Letter ${letter}">${letter}</div>
        `).join('')}
      </div>
    `;
  }

  _setupAlienInteraction() {
    if (this._pupilHandler) {
      document.removeEventListener('pointermove', this._pupilHandler);
      this._pupilHandler = null;
    }

    const alien = document.getElementById('nlAlienChar');
    const mouth = document.getElementById('nlMouth');
    if (!alien || !mouth) return;

    const pupils = [...document.querySelectorAll('#nlAlienChar .pupil')];

    this._pupilHandler = event => {
      const rect = alien.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const dx = (event.clientX - centerX) / (rect.width / 2);
      const dy = (event.clientY - centerY) / (rect.height / 2);
      const x = Math.max(-1, Math.min(1, dx)) * 6;
      const y = Math.max(-1, Math.min(1, dy)) * 6;
      pupils.forEach(pupil => {
        pupil.style.transform = `translate(${x}px, ${y}px)`;
      });
    };

    document.addEventListener('pointermove', this._pupilHandler);
    alien.addEventListener('pointerenter', () => mouth.classList.add('open'));
    alien.addEventListener('pointerleave', () => mouth.classList.remove('open'));
    mouth.addEventListener('animationend', event => {
      if (event.target === mouth) mouth.classList.remove('chomp');
    });
  }

  _triggerChomp() {
    const mouth = document.getElementById('nlMouth');
    if (!mouth) return;
    mouth.classList.remove('chomp');
    void mouth.offsetWidth;
    mouth.classList.add('chomp');
  }

  _setupDragDrop() {
    const tray = document.getElementById('nlTray');
    if (!tray) return;
    tray.querySelectorAll('.nl-tile').forEach(tile => {
      tile.addEventListener('pointerdown', event => this._startDrag(event, tile));
    });
  }

  _startDrag(event, tile) {
    event.preventDefault();
    tile.setPointerCapture(event.pointerId);

    const rect = tile.getBoundingClientRect();
    const value = tile.dataset.value;
    const clone = tile.cloneNode(true);
    clone.classList.add('nl-tile--dragging');
    clone.style.cssText = `
      position: fixed;
      left: ${rect.left}px;
      top: ${rect.top}px;
      width: ${rect.width}px;
      height: ${rect.height}px;
      pointer-events: none;
      z-index: 9999;
      margin: 0;
    `;
    document.body.appendChild(clone);
    tile.classList.add('nl-tile--ghost');

    this._dragState = {
      clone,
      originEl: tile,
      originRect: rect,
      value,
      offsetX: event.clientX - rect.left,
      offsetY: event.clientY - rect.top
    };

    tile.addEventListener('pointermove', this._onDragMove);
    tile.addEventListener('pointerup', this._onDragEnd);
    tile.addEventListener('pointercancel', this._onDragEnd);
  }

  _onDragMove = event => {
    if (!this._dragState) return;
    const { clone, offsetX, offsetY } = this._dragState;
    clone.style.left = `${event.clientX - offsetX}px`;
    clone.style.top = `${event.clientY - offsetY}px`;
  };

  _onDragEnd = event => {
    if (!this._dragState) return;
    const { clone, originEl, originRect, value } = this._dragState;
    const activeSlot = document.getElementById('nlActiveSlot');
    const target = activeSlot ? activeSlot.dataset.letter : null;
    const dropped = activeSlot
      ? this._rectsOverlap(clone.getBoundingClientRect(), activeSlot.getBoundingClientRect())
      : false;

    if (dropped && value === target) {
      if (!originEl.dataset.hadWrongAttempt) this.performance.correctFirst++;
      clone.remove();
      originEl.removeEventListener('pointermove', this._onDragMove);
      originEl.removeEventListener('pointerup', this._onDragEnd);
      originEl.removeEventListener('pointercancel', this._onDragEnd);
      this._dragState = null;
      this._handleCorrectPlacement();
    } else {
      this.performance.wrongAttempts++;
      originEl.dataset.hadWrongAttempt = '1';
      this.context.speakPraise('try again');
      this._springBack(clone, originEl, originRect, () => {
        originEl.removeEventListener('pointermove', this._onDragMove);
        originEl.removeEventListener('pointerup', this._onDragEnd);
        originEl.removeEventListener('pointercancel', this._onDragEnd);
        this._dragState = null;
      });
    }
  };

  _springBack(clone, originEl, originRect, onDone) {
    clone.style.transition = 'left 0.38s cubic-bezier(0.34, 1.56, 0.64, 1), top 0.38s cubic-bezier(0.34, 1.56, 0.64, 1)';
    clone.style.left = `${originRect.left}px`;
    clone.style.top = `${originRect.top}px`;
    setTimeout(() => {
      clone.remove();
      originEl.classList.remove('nl-tile--ghost');
      onDone();
    }, 380);
  }

  _rectsOverlap(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }

  _handleCorrectPlacement() {
    this._triggerChomp();
    this.context.randomEncouragement();
    this.activeGapIdx++;

    if (this.activeGapIdx >= this.gapPositions.length) {
      this._completeRound();
    } else {
      this._render();
      this._speakActivePrompt();
    }
  }

  _completeRound() {
    this._triggerChomp();
    const gameArea = document.getElementById('gameArea');
    const slots = this.sequence.map((letter, idx) => {
      const wasGap = this.gapPositions.includes(idx);
      return `<div class="nl-bubble-slot nl-bubble-slot--filled ${wasGap ? 'nl-bubble-slot--placed nl-bubble-slot--celebrate' : ''}" data-letter="${letter}">${letter}</div>`;
    });

    const layout = gameArea.querySelector('.nl-layout');
    if (layout) {
      const lineArea = layout.querySelector('.nl-line-area');
      if (lineArea) {
        lineArea.querySelector('.nl-track-wrap').innerHTML = `
          <div class="nl-track"></div>
          <div class="nl-slots">${slots.join('')}</div>
        `;
      }
      const bubble = document.getElementById('nlBubble');
      if (bubble) bubble.innerHTML = '<span class="nl-bubble-text">You got it! 🎉</span>';
      const tray = document.getElementById('nlTray');
      if (tray) tray.style.opacity = '0';
    }

    setTimeout(() => {
      this.currentRound++;
      if (this.currentRound >= this.rounds.length) {
        this.end();
      } else {
        this.beginRound();
      }
    }, 1800);
  }

  end() {
    if (this._pupilHandler) {
      document.removeEventListener('pointermove', this._pupilHandler);
      this._pupilHandler = null;
    }

    const accuracy = this.performance.totalGaps > 0
      ? this.performance.correctFirst / this.performance.totalGaps
      : 1;

    this.context.saveSession({
      metrics: {
        accuracy: Math.round(accuracy * 100),
        roundsCompleted: this.rounds.length,
        correctFirst: this.performance.correctFirst,
        wrongAttempts: this.performance.wrongAttempts,
        totalGaps: this.performance.totalGaps
      },
      nextGameRecommendation: typeof window.getNextGameRecommendation === 'function'
        ? window.getNextGameRecommendation('number-line', 'normal', accuracy)
        : 'world-reveal'
    });

    this._showEndScreen(accuracy);
  }

  _showEndScreen(accuracy) {
    const gameArea = document.getElementById('gameArea');
    const pct = Math.round(accuracy * 100);
    const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.65 ? 2 : 1;

    // Celebration audio + character animation
    this.context.randomEncouragement();
    this.context.characterAnimation('celebrate');
    const nextGameType = typeof window.getNextGameRecommendation === 'function'
      ? window.getNextGameRecommendation('number-line', 'normal', accuracy)
      : 'world-reveal';
    const nextLabel = nextGameType === 'world-reveal' ? 'Back to World' : 'Continue Adventure';

    gameArea.innerHTML = `
      <div class="nl-end-card">
        <div class="nl-end-panel">
          <h1>Letter Star! ⭐</h1>
          <p>You filled every missing letter!</p>
          <div class="nl-end-stars">
            ${Array(3).fill(0).map((_, i) => `<span class="nl-end-star ${i < stars ? 'lit' : ''}">⭐</span>`).join('')}
          </div>
          <div class="nl-end-accuracy">${pct}% Accurate</div>
          <button class="nl-next-btn" id="nlNextBtn">▶ ${nextLabel.toUpperCase()}</button>
        </div>
      </div>
    `;

    document.getElementById('nlNextBtn')?.addEventListener('click', () => {
      this.context.goToNextGame(nextGameType);
    });
  }

  _speakActivePrompt() {
    const target = this.sequence[this.gapPositions[this.activeGapIdx]];
    if (target) this.context.speakInstruction(`Where does ${target} go?`);
  }

  _buildRandomSequence() {
    const maxStart = this.letters.length - 10;
    const start = Math.floor(Math.random() * (maxStart + 1));
    return this.letters.slice(start, start + 10);
  }

  _pickGaps(count) {
    const pool = Array.from({ length: 8 }, (_, i) => i + 1);
    return this._shuffle(pool).slice(0, count);
  }

  _generateDecoys(correctLetters, sequence, count) {
    const seqSet = new Set(sequence);
    const correctSet = new Set(correctLetters);
    const firstIndex = this.letters.indexOf(sequence[0]);
    const lastIndex = this.letters.indexOf(sequence[sequence.length - 1]);
    const candidates = [];

    for (let i = Math.max(0, firstIndex - 3); i <= Math.min(this.letters.length - 1, lastIndex + 3); i++) {
      const letter = this.letters[i];
      if (!seqSet.has(letter)) candidates.push(letter);
    }

    sequence.forEach(letter => {
      if (!correctSet.has(letter)) candidates.push(letter);
    });

    return this._shuffle([...new Set(candidates)]).slice(0, count);
  }

  _shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

window.NumberLineGame = NumberLineGame;
