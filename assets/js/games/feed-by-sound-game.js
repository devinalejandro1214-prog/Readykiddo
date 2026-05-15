/* ─────────────────────────────────────────────────────────
   ReadyKiddo — Feed by Sound (Phonics)
   Gumblop says a letter sound. Child drags items that start
   with that sound into his mouth. Wrong picks dim with a
   gentle hint. Correct picks fly in and get chomped.
   ───────────────────────────────────────────────────────── */

class FeedBySoundGame {
  constructor(context) {
    this.context = context;

    /* ── Round data ──────────────────────────────────────────
       mouthShape: 'pursed' | 'wide' | 'default'
         pursed  → lip consonants /b/ /p/ /m/
         wide    → open vowel sounds
         default → everything else
       Each decoy carries `sound` so the alien can hint:
       "Hmm, that starts with /k/!"
    ────────────────────────────────────────────────────────── */
    this.rounds = [
      {
        sound: 'b',
        prompt: '/b/ like in Ball',
        speakPrompt: 'Find something that starts with the sound buh — like Ball!',
        mouthShape: 'pursed',
        correct: [
          { emoji: '🏀', label: 'Ball' },
          { emoji: '🍌', label: 'Banana' },
          { emoji: '🐻', label: 'Bear' },
        ],
        decoys: [
          { emoji: '🍎', label: 'Apple',  sound: 'a' },
          { emoji: '🚗', label: 'Car',    sound: 'k' },
        ],
      },
      {
        sound: 's',
        prompt: '/s/ like in Sun',
        speakPrompt: 'Find something that starts with the sound sss — like Sun!',
        mouthShape: 'default',
        correct: [
          { emoji: '☀️', label: 'Sun'  },
          { emoji: '🧦', label: 'Sock' },
          { emoji: '⭐', label: 'Star' },
        ],
        decoys: [
          { emoji: '🐶', label: 'Dog', sound: 'd' },
          { emoji: '🐷', label: 'Pig', sound: 'p' },
        ],
      },
      {
        sound: 'm',
        prompt: '/m/ like in Moon',
        speakPrompt: 'Find something that starts with the sound mmm — like Moon!',
        mouthShape: 'pursed',
        correct: [
          { emoji: '🌙', label: 'Moon'   },
          { emoji: '🐒', label: 'Monkey' },
          { emoji: '🥛', label: 'Milk'   },
        ],
        decoys: [
          { emoji: '🐟', label: 'Fish', sound: 'f' },
          { emoji: '🎩', label: 'Hat',  sound: 'h' },
        ],
      },
      {
        sound: 'f',
        prompt: '/f/ like in Fish',
        speakPrompt: 'Find something that starts with the sound fff — like Fish!',
        mouthShape: 'default',
        correct: [
          { emoji: '🐟', label: 'Fish'   },
          { emoji: '🌸', label: 'Flower' },
          { emoji: '🦊', label: 'Fox'    },
        ],
        decoys: [
          { emoji: '🏀', label: 'Ball', sound: 'b' },
          { emoji: '☕', label: 'Cup',  sound: 'k' },
        ],
      },
      {
        sound: 'p',
        prompt: '/p/ like in Pig',
        speakPrompt: 'Find something that starts with the sound puh — like Pig!',
        mouthShape: 'pursed',
        correct: [
          { emoji: '🍕', label: 'Pizza' },
          { emoji: '🐷', label: 'Pig'   },
          { emoji: '✏️', label: 'Pen'   },
        ],
        decoys: [
          { emoji: '☀️', label: 'Sun',  sound: 's' },
          { emoji: '🐻', label: 'Bear', sound: 'b' },
        ],
      },
      {
        sound: 'd',
        prompt: '/d/ like in Dog',
        speakPrompt: 'Find something that starts with the sound duh — like Dog!',
        mouthShape: 'default',
        correct: [
          { emoji: '🐶', label: 'Dog'  },
          { emoji: '🦆', label: 'Duck' },
          { emoji: '🥁', label: 'Drum' },
        ],
        decoys: [
          { emoji: '⭐', label: 'Star', sound: 's' },
          { emoji: '🥛', label: 'Milk', sound: 'm' },
        ],
      },
    ];

    this.currentRound    = 0;
    this.correctRemaining = 0;

    this._pupilHandler = null;
    this._dragState    = null;
    this._hintTimer    = null;

    this.performance = {
      totalCorrect:     0,
      totalWrong:       0,
      roundsCompleted:  0,
    };
  }

  /* ═══════════════════════════════════════════════════════
     LIFECYCLE
     ═══════════════════════════════════════════════════════ */

  async startGame() {
    this.currentRound = 0;
    this.beginRound();
  }

  beginRound() {
    const cfg = this.rounds[this.currentRound];
    this.correctRemaining = cfg.correct.length;
    this._clearHintTimer();
    this._render(cfg);
    // Speak after paint so the UI is visible first
    setTimeout(() => this.context.speak(cfg.speakPrompt), 500);
  }

  /* ═══════════════════════════════════════════════════════
     RENDERING
     ═══════════════════════════════════════════════════════ */

  _render(cfg) {
    const gameArea = document.getElementById('gameArea');
    const allItems = this._shuffle([
      ...cfg.correct.map(item => ({ ...item, isCorrect: true  })),
      ...cfg.decoys .map(item => ({ ...item, isCorrect: false })),
    ]);

    gameArea.innerHTML = `
      <div class="fbs-layout">
        ${this._alienHTML(cfg)}
        ${this._trayHTML(allItems)}
      </div>
    `;

    this._setupAlienInteraction();
    this._setupDragDrop();
  }

  _alienHTML(cfg) {
    return `
      <div class="fbs-alien-area">
        <div class="fbs-alien" id="fbsAlienChar">
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
            <div class="mouth mouth--${cfg.mouthShape}" id="fbsMouth">
              <div class="tongue"></div>
            </div>
          </div>
        </div>

        <div class="fbs-bubble" id="fbsBubble">
          <div class="fbs-sound-badge">${cfg.prompt}</div>
          <div class="fbs-bubble-sub" id="fbsBubbleSub">
            Feed me things that start with <strong>/${cfg.sound}/</strong>!
          </div>
        </div>
      </div>
    `;
  }

  _trayHTML(items) {
    return `
      <div class="fbs-tray" id="fbsTray">
        ${items.map(item => `
          <div class="fbs-item"
               data-correct="${item.isCorrect}"
               data-sound="${item.sound || ''}"
               data-label="${item.label}"
               draggable="false"
               role="button"
               aria-label="${item.label}">
            <span class="fbs-item-emoji">${item.emoji}</span>
            <span class="fbs-item-label">${item.label}</span>
          </div>
        `).join('')}
      </div>
    `;
  }

  /* ═══════════════════════════════════════════════════════
     ALIEN INTERACTION
     ═══════════════════════════════════════════════════════ */

  _setupAlienInteraction() {
    if (this._pupilHandler) {
      document.removeEventListener('pointermove', this._pupilHandler);
      this._pupilHandler = null;
    }

    const alien = document.getElementById('fbsAlienChar');
    const mouth = document.getElementById('fbsMouth');
    if (!alien || !mouth) return;

    const pupils = [...document.querySelectorAll('#fbsAlienChar .pupil')];

    this._pupilHandler = e => {
      const r  = alien.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const x  = Math.max(-1, Math.min(1, (e.clientX - cx) / (r.width  / 2))) * 6;
      const y  = Math.max(-1, Math.min(1, (e.clientY - cy) / (r.height / 2))) * 6;
      pupils.forEach(p => { p.style.transform = `translate(${x}px, ${y}px)`; });
    };

    document.addEventListener('pointermove', this._pupilHandler);

    alien.addEventListener('pointerenter', () => mouth.classList.add('open'));
    alien.addEventListener('pointerleave', () => {
      if (!this._dragState) mouth.classList.remove('open');
    });
    mouth.addEventListener('animationend', e => {
      if (e.target === mouth) mouth.classList.remove('chomp');
    });
  }

  _triggerChomp() {
    const mouth = document.getElementById('fbsMouth');
    if (!mouth) return;
    mouth.classList.remove('chomp');
    void mouth.offsetWidth;
    mouth.classList.add('chomp');
  }

  /* ═══════════════════════════════════════════════════════
     DRAG & DROP
     ═══════════════════════════════════════════════════════ */

  _setupDragDrop() {
    document.querySelectorAll('.fbs-item:not(.fbs-item--dim)').forEach(el => {
      el.addEventListener('pointerdown', e => this._startDrag(e, el));
    });
  }

  _startDrag(e, itemEl) {
    if (this._dragState || itemEl.classList.contains('fbs-item--dim')) return;
    e.preventDefault();

    const rect    = itemEl.getBoundingClientRect();
    const offsetX = e.clientX - rect.left;
    const offsetY = e.clientY - rect.top;

    /* Build a clean ghost div — no class baggage, no animation fights */
    const ghost = document.createElement('div');
    ghost.className = 'fbs-item-ghost';
    ghost.innerHTML = itemEl.innerHTML;
    ghost.style.width   = `${rect.width}px`;
    ghost.style.height  = `${rect.height}px`;
    /* position: fixed left:0 top:0 — all movement via transform */
    ghost.style.transform = `translate(${rect.left}px, ${rect.top}px) scale(1.1) rotate(-3deg)`;
    document.body.appendChild(ghost);

    itemEl.classList.add('fbs-item--ghost');

    this._dragState = {
      itemEl,
      ghost,
      offsetX,
      offsetY,
      isCorrect: itemEl.dataset.correct === 'true',
      label:     itemEl.dataset.label,
      sound:     itemEl.dataset.sound,
    };

    if (typeof e.pointerId === 'number' && typeof itemEl.setPointerCapture === 'function') {
      try {
        itemEl.setPointerCapture(e.pointerId);
      } catch (err) {
        // Ignore browsers or synthetic events that reject capture.
      }
    }
    itemEl.addEventListener('pointermove',   this._onMove);
    itemEl.addEventListener('pointerup',     this._onEnd);
    itemEl.addEventListener('pointercancel', this._onEnd);

    const mouth = document.getElementById('fbsMouth');
    if (mouth) mouth.classList.add('open');
  }

  _onMove = e => {
    if (!this._dragState) return;
    const { ghost, offsetX, offsetY } = this._dragState;
    const x = e.clientX - offsetX;
    const y = e.clientY - offsetY;
    ghost.style.transform = `translate(${x}px, ${y}px) scale(1.1) rotate(-3deg)`;
  };

  _onEnd = e => {
    if (!this._dragState) return;
    const { itemEl, ghost, isCorrect, sound } = this._dragState;

    itemEl.removeEventListener('pointermove',   this._onMove);
    itemEl.removeEventListener('pointerup',     this._onEnd);
    itemEl.removeEventListener('pointercancel', this._onEnd);

    const alien   = document.getElementById('fbsAlienChar');
    const ghostR  = ghost.getBoundingClientRect();
    const onAlien = alien ? this._overlaps(ghostR, alien.getBoundingClientRect()) : false;

    if (onAlien && isCorrect) {
      this._handleCorrect(itemEl, ghost);
    } else if (onAlien && !isCorrect) {
      this._handleWrong(itemEl, ghost, sound);
    } else {
      this._springBack(ghost, itemEl);
    }

    this._dragState = null;

    const mouth = document.getElementById('fbsMouth');
    if (mouth) mouth.classList.remove('open');
  };

  /* ═══════════════════════════════════════════════════════
     OUTCOME HANDLERS
     ═══════════════════════════════════════════════════════ */

  _handleCorrect(itemEl, ghost) {
    this.performance.totalCorrect++;
    this._clearHintTimer();
    this._triggerChomp();

    /* Fly into mouth */
    const mouth = document.getElementById('fbsMouth');
    if (mouth) {
      const mr = mouth.getBoundingClientRect();
      const cx = mr.left + mr.width  / 2;
      const cy = mr.top  + mr.height / 2;
      const gw = ghost.offsetWidth  || 80;
      const gh = ghost.offsetHeight || 80;
      ghost.style.transition = 'transform 0.22s cubic-bezier(0.5,0,1,1), opacity 0.22s ease';
      ghost.style.transform  = `translate(${cx - gw / 2}px, ${cy - gh / 2}px) scale(0.05) rotate(20deg)`;
      ghost.style.opacity    = '0';
      setTimeout(() => ghost.remove(), 240);
    } else {
      ghost.remove();
    }

    itemEl.remove();
    this.correctRemaining--;

    /* Update bubble */
    const sub = document.getElementById('fbsBubbleSub');
    if (sub) {
      if (this.correctRemaining > 0) {
        sub.innerHTML = `${this.correctRemaining} more to find! Keep going! 🌟`;
      } else {
        sub.innerHTML = `You got them all! 🎉`;
      }
    }

    this.context.speak(this.correctRemaining > 0 ? 'you got it' : 'yay');

    if (this.correctRemaining === 0) {
      setTimeout(() => this._completeRound(), 800);
    }
  }

  _handleWrong(itemEl, ghost, decoySound) {
    this.performance.totalWrong++;
    this._clearHintTimer();

    /* Spring ghost back, then dim tile so it can't be dragged again */
    this._springBack(ghost, itemEl, () => {
      itemEl.classList.remove('fbs-item--ghost');
      itemEl.classList.add('fbs-item--dim');
    });

    /* Gentle alien hint — no buzzer */
    const sub = document.getElementById('fbsBubbleSub');
    if (sub) {
      const cfg  = this.rounds[this.currentRound];
      const hint = decoySound
        ? `Hmm, that starts with /${decoySound}/!`
        : `Hmm, not that one!`;
      sub.textContent = hint;
      this._hintTimer = setTimeout(() => {
        this._hintTimer = null;
        if (!document.body.contains(sub)) return;
        if (this.correctRemaining > 0) {
          sub.innerHTML = `${this.correctRemaining} more to find! Keep going! 🌟`;
        } else {
          sub.innerHTML = `You got them all! 🎉`;
        }
      }, 2000);
    }

    /* Tiny alien head-shake */
    const alien = document.getElementById('fbsAlienChar');
    if (alien) {
      alien.classList.add('fbs-alien--shake');
      setTimeout(() => alien.classList.remove('fbs-alien--shake'), 420);
    }
  }

  _springBack(ghost, itemEl, onDone) {
    const origin = itemEl.getBoundingClientRect();
    ghost.style.transition = 'transform 0.36s cubic-bezier(0.34,1.56,0.64,1)';
    ghost.style.transform  = `translate(${origin.left}px, ${origin.top}px) scale(1) rotate(0deg)`;
    setTimeout(() => {
      ghost.remove();
      itemEl.classList.remove('fbs-item--ghost');
      if (onDone) onDone();
    }, 370);
  }

  _completeRound() {
    this.performance.roundsCompleted++;
    this._clearHintTimer();

    const alien = document.getElementById('fbsAlienChar');
    if (alien) alien.classList.add('fbs-alien--happy');

    this.context.speak('yay');

    setTimeout(() => {
      this.currentRound++;
      if (this.currentRound >= this.rounds.length) {
        this.end();
      } else {
        this.beginRound();
      }
    }, 1800);
  }

  /* ═══════════════════════════════════════════════════════
     END
     ═══════════════════════════════════════════════════════ */

  end() {
    this._clearHintTimer();
    if (this._pupilHandler) {
      document.removeEventListener('pointermove', this._pupilHandler);
      this._pupilHandler = null;
    }

    const total    = this.performance.totalCorrect + this.performance.totalWrong;
    const accuracy = total > 0 ? this.performance.totalCorrect / total : 1;

    this.context.saveSession({
      metrics: {
        accuracy:        Math.round(accuracy * 100),
        roundsCompleted: this.performance.roundsCompleted,
        totalCorrect:    this.performance.totalCorrect,
        totalWrong:      this.performance.totalWrong,
      },
      nextGameRecommendation: typeof window.getNextGameRecommendation === 'function'
        ? window.getNextGameRecommendation('feed-by-sound', 'normal', accuracy)
        : 'world-reveal',
    });

    this._showEndScreen(accuracy);
  }

  _showEndScreen(accuracy) {
    const gameArea = document.getElementById('gameArea');
    const pct   = Math.round(accuracy * 100);
    const stars  = accuracy >= 0.9 ? 3 : accuracy >= 0.65 ? 2 : 1;

    // Celebration audio + character animation
    const celebClips = ['yay', 'great job', 'impressive'];
    this.context.speak(celebClips[stars - 1] || 'yay');
    this.context.characterAnimation('celebrate');

    const nextGameType = typeof window.getNextGameRecommendation === 'function'
      ? window.getNextGameRecommendation('feed-by-sound', 'normal', accuracy)
      : 'world-reveal';
    const nextLabel = nextGameType === 'world-reveal' ? 'Back to World' : 'Continue Adventure';

    gameArea.innerHTML = `
      <div class="fbs-end-card">
        <div class="fbs-end-panel">
          <h1>Sound Star! 🌟</h1>
          <p>You matched every sound perfectly!</p>
          <div class="fbs-end-stars">
            ${Array(3).fill(0).map((_, i) =>
              `<span class="fbs-end-star ${i < stars ? 'lit' : ''}">⭐</span>`
            ).join('')}
          </div>
          <div class="fbs-end-accuracy">${pct}% Accurate</div>
          <button class="fbs-next-btn" id="fbsNextBtn">
            ▶ ${nextLabel.toUpperCase()}
          </button>
        </div>
      </div>
    `;

    document.getElementById('fbsNextBtn')?.addEventListener('click', () => {
      this.context.goToNextGame(nextGameType);
    });
  }

  /* ═══════════════════════════════════════════════════════
     UTILITIES
     ═══════════════════════════════════════════════════════ */

  _overlaps(a, b) {
    return !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);
  }

  _clearHintTimer() {
    if (this._hintTimer) {
      clearTimeout(this._hintTimer);
      this._hintTimer = null;
    }
  }

  _shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
}

window.FeedBySoundGame = FeedBySoundGame;
