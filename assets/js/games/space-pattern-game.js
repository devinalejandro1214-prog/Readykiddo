/* ─────────────────────────────────────────────────────────
   ReadyKiddo — Space Pattern Game  v2.0
   "What's next in the pattern?" — world-themed item AB-pattern.

   Uses ITEM_GENERATORS from item-data.js to render world-specific
   kawaii SVG items (star/planet/rocket for space, lollipop/cupcake/
   candycane for candy-land, etc.) instead of generic colored shapes.

   Follows the same GameShell context protocol as all other
   games (reportProgress, showCelebration, saveSession, etc.)
   ───────────────────────────────────────────────────────── */

class SpacePatternGame {
  constructor(context) {
    this.context      = context;
    this.currentRound = 0;
    this._locked      = false;
    this._hintUsed    = false;
    this.performance  = { correct: 0, wrong: 0 };

    /* ── Resolve world items ────────────────────────────────
       Pull the 3 items for the current world from item-data.js.
       Fallback: space items if the world or helper is missing.
       ─────────────────────────────────────────────────────── */
    const worldSlug   = context.worldSlug || 'space';
    const worldItems  = (typeof getWorldItems === 'function')
      ? getWorldItems(worldSlug)
      : ['star', 'planet', 'rocket'];

    // Use the first three items; pad with space defaults if fewer than 3.
    const defaults = ['star', 'planet', 'rocket'];
    const keyA = worldItems[0] || defaults[0];
    const keyB = worldItems[1] || defaults[1];
    const keyC = worldItems[2] || defaults[2];

    /* ── Color assignments (fixed per item slot) ────────────
       Three distinct named colors so each item looks different.
       COLOR_HEX / DARK / LIGHT from item-data.js resolve these.
       ─────────────────────────────────────────────────────── */
    const colA = 'blue';
    const colB = 'red';
    const colC = 'yellow';

    /* ── Token shorthand ────────────────────────────────────
       { type, color, key } — key drives answer matching.
       ─────────────────────────────────────────────────────── */
    const S  = (type, color) => ({ type, color, key: `${type}|${color}` });
    const A  = S(keyA, colA);
    const B  = S(keyB, colB);
    const C  = S(keyC, colC);

    /* ── Hint labels ────────────────────────────────────────
       Human-readable item names for hint speech.
       ─────────────────────────────────────────────────────── */
    const nameA = keyA.replace(/-/g, ' ');
    const nameB = keyB.replace(/-/g, ' ');
    const nameC = keyC.replace(/-/g, ' ');

    /* ── Rounds ─────────────────────────────────────────────
       Six AB-pattern rounds using all three item pairs.
       sequence: 4 items shown, answer: 5th item,
       choices: 3 options (shuffled on render).
       ─────────────────────────────────────────────────────── */
    this.rounds = [
      {
        sequence: [A, B, A, B],
        answer:    A,
        choices:  [A, C, B],
        hint:     `${nameA}, ${nameB} — they take turns!`
      },
      {
        sequence: [B, C, B, C],
        answer:    B,
        choices:  [A, B, C],
        hint:     `${nameB}, ${nameC} — spot the pattern!`
      },
      {
        sequence: [A, C, A, C],
        answer:    A,
        choices:  [B, A, C],
        hint:     `${nameA}, ${nameC} — they keep swapping!`
      },
      {
        sequence: [C, B, C, B],
        answer:    C,
        choices:  [A, C, B],
        hint:     `${nameC} always comes back after the ${nameB}!`
      },
      {
        sequence: [B, A, B, A],
        answer:    B,
        choices:  [C, B, A],
        hint:     `${nameB}, ${nameA} — spot the swap!`
      },
      {
        sequence: [C, A, C, A],
        answer:    C,
        choices:  [B, C, A],
        hint:     `${nameC}, ${nameA} — the ${nameC} always returns!`
      },
    ];
  }

  /* ─── Lifecycle ─────────────────────────────────────────── */

  async startGame() {
    // Render our own character inside the layout — hide game-shell's copy
    const gsChar = document.getElementById('gameCharacter');
    if (gsChar) gsChar.style.visibility = 'hidden';

    this.currentRound = 0;
    this._render();
    this.context.speak('What comes next');
  }

  /* ─── Render ────────────────────────────────────────────── */

  _render() {
    this._locked   = false;
    this._hintUsed = false;

    const round    = this.rounds[this.currentRound];
    const choices  = this._shuffle([...round.choices]);
    const gameArea = document.getElementById('gameArea');

    gameArea.innerHTML = this._buildHTML(round, choices);
    this._generateStars();
    this._attachListeners(choices, round);
  }

  /* ─── HTML ──────────────────────────────────────────────── */

  _buildHTML(round, choices) {
    const charSrc  = this.context.characterPath || '';
    const charHTML = charSrc
      ? `<img src="${charSrc}" alt="Your character" draggable="false"/>`
      : '';

    return `
      <div class="sp-screen" role="main">

        <!-- Star field (populated by JS) -->
        <div class="sp-stars" id="spStars" aria-hidden="true"></div>

        <!-- Top bar -->
        <div class="sp-topbar">
          <div class="sp-char-wrap">
            <div class="sp-char-avatar">${charHTML}</div>
            <div class="sp-bubble">What comes next, friend?</div>
          </div>
          <div class="sp-dots" role="status" aria-label="Round ${this.currentRound + 1} of ${this.rounds.length}">
            ${this._dotsHTML()}
          </div>
          <button class="sp-hint-btn" id="spHintBtn" aria-label="Show a hint">
            <span aria-hidden="true">?</span> Hint
          </button>
        </div>

        <!-- Open space -->
        <div class="sp-gap"></div>

        <!-- Floating question card -->
        <div class="sp-card">
          <div class="sp-card-title">What's next in the pattern?</div>
          <div class="sp-sequence"
               role="img"
               aria-label="Pattern: ${round.sequence.map(s => s.type).join(', ')}, then what?">
            ${round.sequence.map(s =>
              `<div class="sp-seq-item">${this._shapeHTML(s)}</div>`
            ).join('')}
            <div class="sp-seq-blank" aria-label="blank — what goes here?">?</div>
          </div>
        </div>

        <!-- Space between card and answers -->
        <div class="sp-gap-sm"></div>

        <!-- Answer tiles -->
        <div class="sp-answers" id="spAnswers"
             role="group" aria-label="Choose your answer">
          ${choices.map(s => `
            <button class="sp-answer"
                    data-key="${s.key}"
                    aria-label="${s.type}">
              ${this._shapeHTML(s)}
            </button>
          `).join('')}
        </div>

      </div>`;
  }

  /* ─── Item HTML ─────────────────────────────────────────── */

  _shapeHTML(token) {
    // Use the world-themed item generator from item-data.js
    if (typeof ITEM_GENERATORS !== 'undefined' && ITEM_GENERATORS[token.type]) {
      return ITEM_GENERATORS[token.type](token.color);
    }
    // Fallback: plain colored circle
    const hex = (typeof COLOR_HEX !== 'undefined' && COLOR_HEX[token.color])
      ? COLOR_HEX[token.color]
      : token.color;
    return `<svg viewBox="0 0 100 100" width="100%" height="100%" aria-hidden="true">
      <circle cx="50" cy="50" r="42" fill="${hex}"/>
    </svg>`;
  }

  /* ─── Stars ─────────────────────────────────────────────── */

  _generateStars() {
    const container = document.getElementById('spStars');
    if (!container) return;

    const html = [];
    for (let i = 0; i < 45; i++) {
      const x    = (Math.random() * 100).toFixed(1);
      const y    = (Math.random() * 100).toFixed(1);
      const size = (Math.random() * 2.5 + 1).toFixed(1);
      const op   = (Math.random() * 0.45 + 0.2).toFixed(2);
      const dur  = (Math.random() * 3 + 2).toFixed(1);
      const del  = (Math.random() * 4).toFixed(1);
      html.push(
        `<div class="sp-star" style="` +
          `left:${x}%;top:${y}%;` +
          `width:${size}px;height:${size}px;` +
          `--op:${op};--dur:${dur}s;--delay:${del}s` +
        `"></div>`
      );
    }
    container.innerHTML = html.join('');
  }

  /* ─── Progress dots ─────────────────────────────────────── */

  _dotsHTML() {
    return this.rounds.map((_, i) => {
      let dotCls  = 'sp-dot';
      let lineCls = 'sp-dot-line';
      if (i < this.currentRound) {
        dotCls  += ' sp-dot--done';
        lineCls += ' sp-dot-line--done';
      } else if (i === this.currentRound) {
        dotCls += ' sp-dot--active';
      }
      const line = i < this.rounds.length - 1
        ? `<div class="${lineCls}"></div>`
        : '';
      return `<div class="sp-dot-wrap"><div class="${dotCls}"></div>${line}</div>`;
    }).join('');
  }

  /* ─── Listeners ─────────────────────────────────────────── */

  _attachListeners(choices, round) {
    document.querySelectorAll('.sp-answer').forEach(btn => {
      btn.addEventListener('pointerdown', () => {
        if (this._locked) return;
        this._handleTap(btn, btn.dataset.key, round.answer.key);
      });
    });

    document.getElementById('spHintBtn')?.addEventListener('pointerdown', () => {
      this._showHint(round);
    });
  }

  /* ─── Tap handling ──────────────────────────────────────── */

  _handleTap(btnEl, key, answerKey) {
    if (key === answerKey) {
      this._locked = true;
      this.performance.correct++;
      btnEl.classList.add('sp-answer--correct');
      document.querySelectorAll('.sp-answer').forEach(b => b.classList.add('sp-answer--locked'));
      this.context.randomEncouragement();
      setTimeout(() => this._completeRound(), 720);
    } else {
      this.performance.wrong++;
      this.context.speak('try again');
      btnEl.classList.remove('sp-answer--wrong');
      void btnEl.offsetWidth; // force reflow so animation restarts
      btnEl.classList.add('sp-answer--wrong');
      btnEl.addEventListener('animationend',
        () => btnEl.classList.remove('sp-answer--wrong'),
        { once: true }
      );
    }
  }

  /* ─── Hint ───────────────────────────────────────────────── */

  _showHint(round) {
    if (this._hintUsed) return;
    this._hintUsed = true;

    document.getElementById('spHintBtn')?.classList.add('sp-hint-btn--used');
    this.context.speak(round.hint);

    // Bounce each sequence item in turn to highlight the pattern
    document.querySelectorAll('.sp-seq-item').forEach((el, i) => {
      setTimeout(() => {
        el.classList.add('sp-seq-item--hint');
      }, i * 160);
    });
  }

  /* ─── Round completion ──────────────────────────────────── */

  async _completeRound() {
    this.currentRound++;
    await this.context.reportProgress(this.currentRound, this.rounds.length);
    if (this.currentRound >= this.rounds.length) {
      await this._end();
    } else {
      this._render();
    }
  }

  /* ─── End ───────────────────────────────────────────────── */

  async _end() {
    // Restore game-shell character now that our layout is being replaced
    const gsChar = document.getElementById('gameCharacter');
    if (gsChar) gsChar.style.visibility = '';

    const total    = this.performance.correct + this.performance.wrong;
    const accuracy = total > 0 ? this.performance.correct / total : 1;

    // Compute next game once — used by both saveSession and onContinue
    const nextGameType = typeof window.getNextGameRecommendation === 'function'
      ? window.getNextGameRecommendation('space-pattern', 'normal', accuracy)
      : 'world-reveal';

    // Parent-only session summary
    this.context.saveSession({
      metrics: {
        accuracy:        Math.round(accuracy * 100),
        roundsCompleted: this.rounds.length,
        correctAnswers:  this.performance.correct,
        wrongAttempts:   this.performance.wrong
      },
      nextGameRecommendation: nextGameType
    });

    // characterAnimation not called — celebration overlay (z-index 9200)
    // fully covers the character (z-index 5), so it would be invisible.
    this.context.randomEncouragement();

    await this.context.showCelebration({
      accuracy,
      onContinue: () => this.context.goToNextGame(nextGameType)
    });
  }

  /* ─── Helpers ───────────────────────────────────────────── */

  _shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

window.SpacePatternGame = SpacePatternGame;
