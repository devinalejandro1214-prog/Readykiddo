/*
   ReadyKiddo — Pattern Quest Game  v2.0
   "What comes next?" — world-aware AB-pattern completion.

   Unified experience: 2 intro rounds (3-item sequences to establish
   the tap-to-answer mechanic) followed by 6 main rounds (4-item
   sequences covering all item-pair combinations).
   One smooth session arc. One celebration at the very end.

   Replaces both pattern-next v1 and space-pattern in the game chain.
   Chain position: abc-match → Pattern Quest → world-reveal

   World-aware for all 6 ReadyKiddo worlds:
     space, candy-land, jungle, beach, castle, studio

   Uses:
   - ITEM_GENERATORS + getWorldItems() from item-data.js
   - .lq-* component system (adventure-screen.css)
   - GameShell context protocol (reportProgress, showCelebration, etc.)
*/

// World-specific floating particle glyphs (module-level for compatibility)
const _PQ_WORLD_PARTICLES = {
  space:        ['✦', '·', '★', '·', '✦'],
  'candy-land': ['♥', '✿', '◆', '•', '♥'],
  jungle:       ['✿', '❋', '◦', '✿', '·'],
  beach:        ['◦', '·', '◎', '∿', '◦'],
  castle:       ['✦', '♦', '◆', '✦', '·'],
  studio:       ['♪', '♫', '✿', '·', '♪'],
};

class PatternNextGame {
  constructor(context) {
    this.context = context;

    // ── World / Theme ──────────────────────────────────────
    const worldSlug = context.worldSlug || 'space';
    const THEME_MAP = {
      space:        'space',
      'candy-land': 'candy-land',
      jungle:       'jungle',
      forest:       'jungle',   // alias
      beach:        'beach',
      castle:       'castle',
      studio:       'studio',
    };
    this.theme = THEME_MAP[worldSlug] || 'space';

    // ── World items ────────────────────────────────────────
    // Pull the 3 theme items from item-data.js so SVG items match
    // whatever world the child is currently exploring.
    const worldItems = (typeof getWorldItems === 'function')
      ? getWorldItems(worldSlug)
      : ['star', 'planet', 'rocket'];

    const defaults = ['star', 'planet', 'rocket'];
    const keyA = worldItems[0] || defaults[0];
    const keyB = worldItems[1] || defaults[1];
    const keyC = worldItems[2] || defaults[2];

    const S     = (type, color) => ({ type, color, key: `${type}|${color}` });
    const A     = S(keyA, 'blue');
    const B     = S(keyB, 'red');
    const C     = S(keyC, 'yellow');
    const nameA = keyA.replace(/-/g, ' ');
    const nameB = keyB.replace(/-/g, ' ');
    const nameC = keyC.replace(/-/g, ' ');

    // ── Rounds ────────────────────────────────────────────
    // 2 intro rounds — 3-item sequences, lower cognitive load,
    //   establishes "tap the right one" mechanic before escalating.
    // 6 main rounds — 4-item sequences, all three item-pair combos
    //   (AB, BC, AC, CB, BA, CA) so no single pair dominates.
    // No mid-session celebration — the child flows straight through.
    this.rounds = [

      // ── Intro ──────────────────────────────────────────
      {
        prompt:   'What comes next?',
        sequence: [A, B, A],
        answer:   B,
        choices:  [B, A, C],
        hint:     `${nameA}, ${nameB} — they take turns!`
      },
      {
        prompt:   'What comes next?',
        sequence: [B, A, B],
        answer:   A,
        choices:  [A, B, C],
        hint:     `${nameB}, ${nameA} — spot the swap!`
      },

      // ── Main ───────────────────────────────────────────
      {
        prompt:   "What's next in the pattern?",
        sequence: [A, B, A, B],
        answer:   A,
        choices:  [A, C, B],
        hint:     `${nameA}, ${nameB} — they take turns!`
      },
      {
        prompt:   "What's next in the pattern?",
        sequence: [B, C, B, C],
        answer:   B,
        choices:  [A, B, C],
        hint:     `${nameB}, ${nameC} — spot the pattern!`
      },
      {
        prompt:   "What's next in the pattern?",
        sequence: [A, C, A, C],
        answer:   A,
        choices:  [B, A, C],
        hint:     `${nameA}, ${nameC} — they keep swapping!`
      },
      {
        prompt:   "What's next in the pattern?",
        sequence: [C, B, C, B],
        answer:   C,
        choices:  [A, C, B],
        hint:     `${nameC} always comes back after the ${nameB}!`
      },
      {
        prompt:   "What's next in the pattern?",
        sequence: [B, A, B, A],
        answer:   B,
        choices:  [C, B, A],
        hint:     `${nameB}, ${nameA} — spot the swap!`
      },
      {
        prompt:   "What's next in the pattern?",
        sequence: [C, A, C, A],
        answer:   C,
        choices:  [B, C, A],
        hint:     `${nameC}, ${nameA} — the ${nameC} always returns!`
      },

    ];

    this.currentRound = 0;
    this._locked      = false;
    this._hintUsed    = false;
    this.performance  = { correct: 0, wrong: 0 };
  }

  /* ─── Lifecycle ─────────────────────────────────────────── */

  async startGame() {
    // Render our own character inside the layout — hide game-shell's copy
    // so it doesn't double-render. Restored in _end().
    const gsChar = document.getElementById('gameCharacter');
    if (gsChar) gsChar.style.visibility = 'hidden';

    this.currentRound = 0;
    this._render();
    this.context.speakInstruction('What comes next');
  }

  /* ─── Render ────────────────────────────────────────────── */

  _render() {
    this._locked   = false;
    this._hintUsed = false;

    const round    = this.rounds[this.currentRound];
    const choices  = this._shuffle([...round.choices]);
    const gameArea = document.getElementById('gameArea');

    const charSrc     = this.context.characterPath || '';
    const charImgHTML = charSrc
      ? `<img src="${charSrc}" alt="Your character" draggable="false"/>`
      : '';

    gameArea.innerHTML = this._buildHTML(round, choices, charImgHTML);
    this._generateParticles();
    this._attachListeners(choices, round);
  }

  /* ─── HTML builder ──────────────────────────────────────── */

  _buildHTML(round, choices, charImgHTML) {
    const seqLabel   = `Pattern: ${round.sequence.map(t => t.type).join(', ')}, then what?`;
    const roundLabel = `Round ${this.currentRound + 1} of ${this.rounds.length}`;

    const seqItemsHTML = round.sequence
      .map(t => `<div class="lq-seq-item" aria-hidden="true">${this._itemHTML(t)}</div>`)
      .join('');

    const answersHTML = choices.map(c => `
      <button class="lq-answer" data-value="${c.key}" aria-label="${c.type}">
        <div class="lq-item-svg" aria-hidden="true">${this._itemHTML(c)}</div>
      </button>`).join('');

    return `
      <div class="lq-screen lq-v3 lq-v3--top lq-theme-${this.theme}" role="main">

        <!-- World particle decoration layer -->
        <div class="lq-particles" id="lqParticles" aria-hidden="true"></div>

        <!-- Top strip: progress dots + hint button -->
        <div class="lq-topstrip">
          <div class="lq-progress" role="status" aria-label="${roundLabel}">
            ${this._dotsHTML()}
          </div>
          <button class="lq-hint-btn" id="lqHintBtn" aria-label="Show a hint">
            <span aria-hidden="true">?</span> Hint
          </button>
        </div>

        <!-- Character: peeks in from bottom-left (lq-v3 position) -->
        <div class="lq-char" aria-hidden="true">${charImgHTML}</div>

        <!-- Floating question panel -->
        <div class="lq-question-panel">
          <div class="lq-prompt" role="heading" aria-level="2">${round.prompt}</div>
          <div class="lq-sequence" role="img" aria-label="${seqLabel}">
            ${seqItemsHTML}
            <div class="lq-seq-item lq-seq-item--blank" aria-label="blank — what goes here?">?</div>
          </div>
        </div>

        <!-- Answer panel -->
        <div class="lq-answers-panel">
          <div class="lq-answers" id="lqAnswers"
               role="group" aria-label="Choose your answer">
            ${answersHTML}
          </div>
        </div>

      </div>`;
  }

  /* ── Item SVG renderer ──────────────────────────────────── */

  _itemHTML(token) {
    if (typeof ITEM_GENERATORS !== 'undefined' && ITEM_GENERATORS[token.type]) {
      return ITEM_GENERATORS[token.type](token.color);
    }
    // Fallback: plain coloured circle
    const hex = (typeof COLOR_HEX !== 'undefined' && COLOR_HEX[token.color])
      ? COLOR_HEX[token.color] : '#888';
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="42" fill="${hex}"/>
    </svg>`;
  }

  /* ── World particle generator ───────────────────────────── */

  _generateParticles() {
    const container = document.getElementById('lqParticles');
    if (!container) return;

    const glyphs = _PQ_WORLD_PARTICLES[this.theme] || _PQ_WORLD_PARTICLES.space;
    const html   = [];

    for (let i = 0; i < 28; i++) {
      const x   = (Math.random() * 96  +  2).toFixed(1);
      const y   = (Math.random() * 96  +  2).toFixed(1);
      const sz  = (Math.random() * 10  +  8).toFixed(1);
      const op  = (Math.random() * 0.22 + 0.08).toFixed(2);
      const dur = (Math.random() * 6   +  5).toFixed(1);
      const del = (Math.random() * 8       ).toFixed(1);
      const g   = glyphs[i % glyphs.length];
      html.push(
        `<span class="lq-particle" style="` +
        `left:${x}%;top:${y}%;` +
        `--sz:${sz}px;--op:${op};--dur:${dur}s;--delay:${del}s` +
        `">${g}</span>`
      );
    }
    container.innerHTML = html.join('');
  }

  /* ── Progress dots ──────────────────────────────────────── */

  _dotsHTML() {
    return this.rounds.map((_, i) => {
      let cls = 'lq-dot';
      if (i < this.currentRound)        cls += ' lq-dot--done';
      else if (i === this.currentRound) cls += ' lq-dot--active';
      return `<div class="${cls}" aria-hidden="true"></div>`;
    }).join('');
  }

  /* ─── Listeners ─────────────────────────────────────────── */

  _attachListeners(choices, round) {
    const answersEl = document.getElementById('lqAnswers');
    if (answersEl) {
      answersEl.querySelectorAll('.lq-answer').forEach(btn => {
        btn.addEventListener('pointerdown', () => {
          if (this._locked) return;
          this._handleTap(btn, btn.dataset.value, round.answer.key);
        });
      });
    }

    const hintBtn = document.getElementById('lqHintBtn');
    if (hintBtn) {
      hintBtn.addEventListener('pointerdown', () => this._showHint(round));
    }
  }

  /* ─── Tap handling ──────────────────────────────────────── */

  _handleTap(btnEl, value, answer) {
    if (value === answer) {
      this._locked = true;
      this.performance.correct++;
      this._correctResponse(btnEl);
    } else {
      this.performance.wrong++;
      this._wrongResponse(btnEl);
    }
  }

  _correctResponse(btnEl) {
    btnEl.classList.add('lq-answer--correct');
    // Lock remaining cards so no double-tap is possible
    document.querySelectorAll('.lq-answer').forEach(b => b.classList.add('lq-answer--locked'));
    this.context.randomEncouragement();
    // Short green-flash pause before advancing — satisfying without feeling slow
    setTimeout(() => this._completeRound(), 720);
  }

  _wrongResponse(btnEl) {
    this.context.speakPraise('try again');
    btnEl.classList.remove('lq-answer--wrong');
    void btnEl.offsetWidth; // force reflow so animation restarts
    btnEl.classList.add('lq-answer--wrong');
    btnEl.addEventListener('animationend',
      () => btnEl.classList.remove('lq-answer--wrong'),
      { once: true }
    );
  }

  /* ─── Hint ───────────────────────────────────────────────── */

  _showHint(round) {
    if (this._hintUsed) return;
    this._hintUsed = true;

    const hintBtn = document.getElementById('lqHintBtn');
    if (hintBtn) hintBtn.classList.add('lq-hint-btn--used');

    // Staggered bounce on each sequence item draws the eye to the pattern
    document.querySelectorAll('.lq-seq-item:not(.lq-seq-item--blank)').forEach((el, i) => {
      setTimeout(() => {
        el.classList.remove('lq-seq-item--hint');
        void el.offsetWidth;
        el.classList.add('lq-seq-item--hint');
      }, i * 160);
    });

    // Op 9: hints use the generic TEACHER hint line (templated item-name
    // hints can't be pre-generated; round.hint kept for any visual use).
    this.context.speakInstruction('pattern hint');
  }

  /* ─── Round completion ──────────────────────────────────── */

  async _completeRound() {
    this.currentRound++;
    // reportProgress after increment so current === rounds completed
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
      ? window.getNextGameRecommendation('pattern-next', 'normal', accuracy)
      : 'world-reveal';

    // Parent-only session summary
    this.context.saveSession({
      metrics: {
        accuracy:        Math.round(accuracy * 100),
        roundsCompleted: this.rounds.length,
        correctAnswers:  this.performance.correct,
        wrongAttempts:   this.performance.wrong,
        introRounds:     2,
        mainRounds:      6
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

window.PatternNextGame = PatternNextGame;
