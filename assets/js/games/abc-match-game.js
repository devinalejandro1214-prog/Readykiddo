/*
   ReadyKiddo – ABC Match Game
   Alien holds up a letter chip. Child taps the picture that starts with that letter.
   Wrong taps shake the tile. Correct tap: chomp + celebrate → next round.
*/

class ABCMatchGame {
  constructor(context) {
    this.context = context;

    // Each round: one letter chip shown, four emoji tiles (one correct)
    this.rounds = [
      {
        letter: 'B',
        choices: [
          { emoji: '🏀', label: 'Ball',   correct: true  },
          { emoji: '🐱', label: 'Cat',    correct: false },
          { emoji: '🍎', label: 'Apple',  correct: false },
          { emoji: '🌙', label: 'Moon',   correct: false }
        ]
      },
      {
        letter: 'C',
        choices: [
          { emoji: '🚗', label: 'Car',    correct: true  },
          { emoji: '🐶', label: 'Dog',    correct: false },
          { emoji: '🏀', label: 'Ball',   correct: false },
          { emoji: '🐟', label: 'Fish',   correct: false }
        ]
      },
      {
        letter: 'D',
        choices: [
          { emoji: '🐶', label: 'Dog',    correct: true  },
          { emoji: '🐱', label: 'Cat',    correct: false },
          { emoji: '⭐',  label: 'Star',   correct: false },
          { emoji: '🏀', label: 'Ball',   correct: false }
        ]
      },
      {
        letter: 'F',
        choices: [
          { emoji: '🐸', label: 'Frog',   correct: true  },
          { emoji: '🐶', label: 'Dog',    correct: false },
          { emoji: '🌙', label: 'Moon',   correct: false },
          { emoji: '🚗', label: 'Car',    correct: false }
        ]
      },
      {
        letter: 'H',
        choices: [
          { emoji: '🏠', label: 'House',  correct: true  },
          { emoji: '🐟', label: 'Fish',   correct: false },
          { emoji: '🐸', label: 'Frog',   correct: false },
          { emoji: '🍎', label: 'Apple',  correct: false }
        ]
      },
      {
        letter: 'L',
        choices: [
          { emoji: '🦁', label: 'Lion',   correct: true  },
          { emoji: '🍎', label: 'Apple',  correct: false },
          { emoji: '🐶', label: 'Dog',    correct: false },
          { emoji: '🏀', label: 'Ball',   correct: false }
        ]
      },
      {
        letter: 'M',
        choices: [
          { emoji: '🌙', label: 'Moon',   correct: true  },
          { emoji: '🐶', label: 'Dog',    correct: false },
          { emoji: '🐟', label: 'Fish',   correct: false },
          { emoji: '🚗', label: 'Car',    correct: false }
        ]
      },
      {
        letter: 'R',
        choices: [
          { emoji: '🚀', label: 'Rocket', correct: true  },
          { emoji: '🌙', label: 'Moon',   correct: false },
          { emoji: '🐱', label: 'Cat',    correct: false },
          { emoji: '🐸', label: 'Frog',   correct: false }
        ]
      },
      {
        letter: 'S',
        choices: [
          { emoji: '☀️', label: 'Sun',    correct: true  },
          { emoji: '🌙', label: 'Moon',   correct: false },
          { emoji: '🐶', label: 'Dog',    correct: false },
          { emoji: '🏀', label: 'Ball',   correct: false }
        ]
      },
      {
        letter: 'P',
        choices: [
          { emoji: '🍕', label: 'Pizza',  correct: true  },
          { emoji: '🐶', label: 'Dog',    correct: false },
          { emoji: '🌙', label: 'Moon',   correct: false },
          { emoji: '🏀', label: 'Ball',   correct: false }
        ]
      },
      {
        letter: 'T',
        choices: [
          { emoji: '🚂', label: 'Train',  correct: true  },
          { emoji: '🐟', label: 'Fish',   correct: false },
          { emoji: '🌙', label: 'Moon',   correct: false },
          { emoji: '🐱', label: 'Cat',    correct: false }
        ]
      }
    ];

    this.currentRound = 0;
    this._pupilHandler = null;
    this._locked = false;

    this.performance = {
      correct: 0,
      wrong: 0
    };
  }

  /* ─── Lifecycle ─────────────────────────────────────────── */

  async startGame() {
    this.currentRound = 0;
    this._beginRound();
  }

  _beginRound() {
    this._locked = false;
    this._render();
    const round = this.rounds[this.currentRound];
    this.context.speak(`find ${round.letter}`);
  }

  /* ─── Render ─────────────────────────────────────────────── */

  _render() {
    const round = this.rounds[this.currentRound];
    const choices = this._shuffle([...round.choices]);
    const gameArea = document.getElementById('gameArea');

    gameArea.innerHTML = `
      <div class="am-layout">
        ${this._alienHTML(round)}
        ${this._gridHTML(choices)}
      </div>
    `;

    this._setupAlienInteraction();
    this._setupTileListeners(choices);
  }

  _alienHTML(round) {
    const letter = round.letter;
    const imgPath = `assets/images/abc-match/letters/${letter.toLowerCase()}.png`;

    return `
      <div class="am-alien-area">
        <div class="am-alien" id="amAlienChar">
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
            <div class="mouth" id="amMouth">
              <div class="tongue"></div>
            </div>
          </div>
        </div>

        <div class="am-bubble" id="amBubble">
          <div class="am-chip-wrap">
            <img
              class="am-letter-chip"
              src="${imgPath}"
              alt="Letter ${letter}"
              id="amLetterChip"
            />
          </div>
          <span class="am-bubble-text">What starts with <strong>${letter}</strong>?</span>
        </div>
      </div>
    `;
  }

  _gridHTML(choices) {
    const tiles = choices.map((c, i) => `
      <button
        class="am-tile"
        data-idx="${i}"
        data-correct="${c.correct}"
        aria-label="${c.label}"
      >
        <span class="am-tile-emoji">${c.emoji}</span>
        <span class="am-tile-label">${c.label}</span>
      </button>
    `).join('');

    return `
      <div class="am-grid" id="amGrid">
        ${tiles}
      </div>
      <div class="am-round-label">Round ${this.currentRound + 1} of ${this.rounds.length}</div>
    `;
  }

  /* ─── Alien Interaction ───────────────────────────────────── */

  _setupAlienInteraction() {
    if (this._pupilHandler) {
      document.removeEventListener('pointermove', this._pupilHandler);
      this._pupilHandler = null;
    }

    const alien = document.getElementById('amAlienChar');
    const mouth = document.getElementById('amMouth');
    if (!alien || !mouth) return;

    const pupils = [...document.querySelectorAll('#amAlienChar .pupil')];

    this._pupilHandler = e => {
      const rect = alien.getBoundingClientRect();
      const dx = (e.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
      const dy = (e.clientY - (rect.top + rect.height / 2)) / (rect.height / 2);
      const x = Math.max(-1, Math.min(1, dx)) * 6;
      const y = Math.max(-1, Math.min(1, dy)) * 6;
      pupils.forEach(p => { p.style.transform = `translate(${x}px,${y}px)`; });
    };

    document.addEventListener('pointermove', this._pupilHandler);
    alien.addEventListener('pointerenter', () => mouth.classList.add('open'));
    alien.addEventListener('pointerleave', () => mouth.classList.remove('open'));
    mouth.addEventListener('animationend', e => {
      if (e.target === mouth) mouth.classList.remove('chomp');
    });
  }

  _triggerChomp() {
    const mouth = document.getElementById('amMouth');
    if (!mouth) return;
    mouth.classList.remove('chomp');
    void mouth.offsetWidth;
    mouth.classList.add('chomp');
  }

  /* ─── Tile Listeners ─────────────────────────────────────── */

  _setupTileListeners(choices) {
    const grid = document.getElementById('amGrid');
    if (!grid) return;

    grid.querySelectorAll('.am-tile').forEach(tile => {
      const idx = parseInt(tile.dataset.idx, 10);
      const choice = choices[idx];
      tile.addEventListener('pointerdown', () => this._handleTap(tile, choice));
    });
  }

  _handleTap(tileEl, choice) {
    if (this._locked) return;

    if (choice.correct) {
      this._locked = true;
      this.performance.correct++;
      this._correctResponse(tileEl);
    } else {
      this.performance.wrong++;
      this._wrongResponse(tileEl);
    }
  }

  /* ─── Correct Response ───────────────────────────────────── */

  _correctResponse(tileEl) {
    tileEl.classList.add('am-tile--correct');
    this._triggerChomp();
    this.context.speak('you got it');

    // Flying chip animation
    this._flyChipToTile(tileEl, () => {
      setTimeout(() => this._completeRound(), 600);
    });
  }

  _flyChipToTile(tileEl, onDone) {
    const chip = document.getElementById('amLetterChip');
    if (!chip) { onDone(); return; }

    const chipRect = chip.getBoundingClientRect();
    const tileRect = tileEl.getBoundingClientRect();

    const ghost = document.createElement('img');
    ghost.src = chip.src;
    ghost.alt = chip.alt;
    ghost.className = 'am-chip-ghost';
    ghost.style.cssText = `
      position: fixed;
      left: ${chipRect.left}px;
      top: ${chipRect.top}px;
      width: ${chipRect.width}px;
      height: ${chipRect.height}px;
      pointer-events: none;
      z-index: 9999;
      border-radius: 12px;
      transition: none;
    `;
    document.body.appendChild(ghost);

    // Target center
    const tx = tileRect.left + tileRect.width / 2 - chipRect.left - chipRect.width / 2;
    const ty = tileRect.top + tileRect.height / 2 - chipRect.top - chipRect.height / 2;

    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        ghost.style.transition = 'transform 0.35s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.35s ease';
        ghost.style.transform = `translate(${tx}px, ${ty}px) scale(0.45)`;
        ghost.style.opacity = '0';
      });
    });

    setTimeout(() => {
      ghost.remove();
      onDone();
    }, 380);
  }

  /* ─── Wrong Response ──────────────────────────────────────── */

  _wrongResponse(tileEl) {
    this.context.speak('try again');
    tileEl.classList.remove('am-tile--shake');
    void tileEl.offsetWidth;
    tileEl.classList.add('am-tile--shake');
    tileEl.addEventListener('animationend', () => {
      tileEl.classList.remove('am-tile--shake');
    }, { once: true });
  }

  /* ─── Round Completion ───────────────────────────────────── */

  _completeRound() {
    this.currentRound++;
    if (this.currentRound >= this.rounds.length) {
      this._end();
    } else {
      this._beginRound();
    }
  }

  /* ─── End ────────────────────────────────────────────────── */

  _end() {
    if (this._pupilHandler) {
      document.removeEventListener('pointermove', this._pupilHandler);
      this._pupilHandler = null;
    }

    const total = this.performance.correct + this.performance.wrong;
    const accuracy = total > 0 ? this.performance.correct / total : 1;

    this.context.saveSession({
      metrics: {
        accuracy: Math.round(accuracy * 100),
        roundsCompleted: this.rounds.length,
        correctAnswers: this.performance.correct,
        wrongAttempts: this.performance.wrong
      },
      nextGameRecommendation: typeof window.getNextGameRecommendation === 'function'
        ? window.getNextGameRecommendation('abc-match', 'normal', accuracy)
        : 'world-reveal'
    });

    this._showEndScreen(accuracy);
  }

  _showEndScreen(accuracy) {
    const gameArea = document.getElementById('gameArea');
    const pct = Math.round(accuracy * 100);
    const stars = accuracy >= 0.9 ? 3 : accuracy >= 0.65 ? 2 : 1;

    // Celebration audio + character animation
    const celebClips = ['yay', 'great job', 'impressive'];
    this.context.speak(celebClips[stars - 1] || 'yay');
    this.context.characterAnimation('celebrate');
    const nextGameType = typeof window.getNextGameRecommendation === 'function'
      ? window.getNextGameRecommendation('abc-match', 'normal', accuracy)
      : 'world-reveal';
    const nextLabel = nextGameType === 'world-reveal' ? 'Back to World' : 'Continue Adventure';

    gameArea.innerHTML = `
      <div class="am-end-card">
        <div class="am-end-panel">
          <h1>Letter Champion! 🔤</h1>
          <p>You matched every letter!</p>
          <div class="am-end-stars">
            ${Array(3).fill(0).map((_, i) =>
              `<span class="am-end-star ${i < stars ? 'lit' : ''}">⭐</span>`
            ).join('')}
          </div>
          <div class="am-end-accuracy">${pct}% Accurate</div>
          <button class="am-next-btn" id="amNextBtn">▶ ${nextLabel.toUpperCase()}</button>
        </div>
      </div>
    `;

    document.getElementById('amNextBtn')?.addEventListener('click', () => {
      this.context.goToNextGame(nextGameType);
    });
  }

  /* ─── Helpers ────────────────────────────────────────────── */

  _shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

window.ABCMatchGame = ABCMatchGame;
