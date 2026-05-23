/* ─────────────────────────────────────────────────────────
   ReadyKiddo — Session Manager  v1.1
   Lightweight session-arc layer: phase tracking, phase
   transitions, and child-facing celebration screen.

   Wraps around existing games — does NOT touch gameplay logic.
   Games opt in by calling context.reportProgress() and
   context.showCelebration(). Games that don't call these
   continue working exactly as before.
   ───────────────────────────────────────────────────────── */

(function () {
  'use strict';

  /* ── Session topic config ───────────────────────────────
     One entry per game type.  name / icon / subline are
     shown on the start card and celebration screen.
     ─────────────────────────────────────────────────────── */
  const SESSION_TOPICS = {
    'color-sort':        { name: 'Color Mission',    icon: '🎨', subline: 'Sort the colors into their homes!'     },
    'shape-recognition': { name: 'Shape Quest',      icon: '🔷', subline: 'Match every shape to its outline!'    },
    'space-defender':    { name: 'Space Adventure',  icon: '🚀', subline: 'Defend the galaxy!'                   },
    'feed-alien':        { name: 'Counting Journey', icon: '👾', subline: 'Feed your hungry alien friend!'        },
    'number-line':       { name: 'Number Quest',     icon: '🔢', subline: 'Fill in the missing numbers!'          },
    'feed-by-sound':     { name: 'Sound Safari',     icon: '🎵', subline: 'Listen and find the match!'           },
    'abc-match':         { name: 'Letter Hunt',      icon: '🔤', subline: 'Match each letter to the picture!'    },
    'pattern-next':      { name: 'Pattern Quest',    icon: '🎯', subline: 'What comes next in the pattern?'       },
    'space-pattern':     { name: 'Space Shapes',     icon: '🚀', subline: 'Find the shape that comes next!'        },
  };

  /* ── Phase arc ──────────────────────────────────────────
     Phases define the badge colour / label / overlay content.
     Transitions are driven by PHASE_CHECKPOINTS below (not
     raw percentages), so every trigger lines up with a real
     teaching moment in the game's round structure.
     showOverlay = false → badge update only (no full overlay).
     ─────────────────────────────────────────────────────── */
  const PHASES = [
    { id: 'warm-up',   label: 'Warm Up',      emoji: '✨', audioKey: null, animation: null,        showOverlay: false },
    { id: 'explore',   label: 'Explore',      emoji: '🌟', audioKey: null, animation: 'thumbs-up', showOverlay: false },
    { id: 'challenge', label: 'Challenge',    emoji: '⚡', audioKey: null, animation: 'wave',      showOverlay: false },
    { id: 'final',     label: 'Almost There', emoji: '🔥', audioKey: null, animation: null,        showOverlay: false },
  ];

  /* ── Designed checkpoint tables ────────────────────────
     Each entry fires when `current` (correct items so far)
     first reaches `afterItem`.  Phases advance in order —
     you cannot skip or re-trigger a phase.

     Both color-sort and shape-recognition share the same
     12-item, two-round structure:
       Round 1 (items 1-6):  free drag-and-match
       Round 2 (items 7-12): audio callout — harder

     Checkpoints are aligned to meaningful moments in that
     structure so transitions feel teacher-like, not random:
       afterItem 3  → midway through Round 1, mechanic mastered
       afterItem 6  → Round 1 complete; overlay fires naturally
                      between rounds before Round 2 begins
       afterItem 10 → 2 items left in Round 2 (badge only)

     Add a new key here when wiring a new game type.
     Unknown game types fall through to no phase advances.
     ─────────────────────────────────────────────────────── */
  const PHASE_CHECKPOINTS = {
    'color-sort': [
      { phaseIdx: 1, afterItem: 3  },   // → Explore   (mid Round 1)
      { phaseIdx: 2, afterItem: 6  },   // → Challenge  (Round 2 begins)
      { phaseIdx: 3, afterItem: 10 },   // → Almost There (badge only)
    ],
    'shape-recognition': [
      { phaseIdx: 1, afterItem: 3  },
      { phaseIdx: 2, afterItem: 6  },
      { phaseIdx: 3, afterItem: 10 },
    ],
    // abc-match: 11 identical rounds (letter chip → find the matching picture).
    // All rounds are mechanically identical — no structural difficulty shift.
    // Skipping Challenge (phaseIdx 2) entirely: inserting a "Challenge" overlay
    // at the midpoint of a uniform game is a pacing lie, not a teaching moment.
    // Arc: Warm Up → Explore (mechanic established) → Almost There (finish line).
    'abc-match': [
      { phaseIdx: 1, afterItem: 3  },   // → Explore     (3/11 — tap pattern established)
      { phaseIdx: 3, afterItem: 9  },   // → Almost There (9/11 — 2 rounds left; badge only)
    ],
    // feed-alien: 6 rounds, difficulty ramps within each round (more items required).
    // The difficulty escalation is continuous and round-internal — no single structural
    // "harder mode" boundary exists, so Challenge overlay would be misleading.
    // Arc: Warm Up → Explore (drag mechanic established) → Almost There (finish line).
    'feed-alien': [
      { phaseIdx: 1, afterItem: 2  },   // → Explore     (2/6 — drag-and-feed pattern established)
      { phaseIdx: 3, afterItem: 5  },   // → Almost There (5/6 — 1 round left; badge only)
    ],
    // pattern-next: unified 8-round game (2 intro + 6 main).
    // Intro round 1 establishes the tap mechanic → Explore.
    // 6 main rounds deepen the pattern; no hard structural shift so Challenge
    // overlay is skipped (same reasoning as abc-match).
    // Arc: Warm Up → Explore (intro done) → Almost There (2 rounds left; badge only).
    'pattern-next': [
      { phaseIdx: 1, afterItem: 1  },   // → Explore     (1/8 — tap mechanic established)
      { phaseIdx: 3, afterItem: 6  },   // → Almost There (6/8 — 2 rounds left; badge only)
    ],
    // space-pattern: 6 AB-pattern shape rounds. Mechanic mirrors pattern-next.
    // Arc: Warm Up → Explore (mechanic confirmed) → Almost There (finish line).
    'space-pattern': [
      { phaseIdx: 1, afterItem: 2  },   // → Explore     (2/6 — shape pattern established)
      { phaseIdx: 3, afterItem: 5  },   // → Almost There (5/6 — 1 round left; badge only)
    ],
  };

  /* ────────────────────────────────────────────────────────
     SessionManager class
     ──────────────────────────────────────────────────────── */
  class SessionManager {
    constructor() {
      this._gameType = null;
      this._phaseIdx = 0;
      this._busy     = false;
      this._badge    = null;
      this._ready    = false;
    }

    /* ─────────────────────────────────────────────────────
       Public — topic info
       ───────────────────────────────────────────────────── */

    /**
     * Return session topic config for a game type.
     * Always returns a valid object even for unknown types.
     */
    getTopic(gameType) {
      return SESSION_TOPICS[gameType] || {
        name: 'Learning Adventure',
        icon: '⭐',
        subline: "Let's explore!",
      };
    }

    /* ─────────────────────────────────────────────────────
       Public — lifecycle
       ───────────────────────────────────────────────────── */

    /**
     * Call once per game load, after the user taps Let's Go!
     * Resets phase to Warm Up and clears any stale badge.
     */
    init(gameType) {
      this._gameType = gameType;
      this._phaseIdx = 0;
      this._busy     = false;
      this._ready    = true;
      // Remove stale badge from any previous game load
      const stale = document.querySelector('.sm-badge');
      if (stale) stale.remove();
      this._badge = null;
    }

    /**
     * Inject the phase badge into a container element.
     * Call after init(), once the game DOM is ready.
     */
    injectBadge(container) {
      if (this._badge) { this._badge.remove(); this._badge = null; }
      const badge = document.createElement('div');
      badge.className = 'sm-badge sm-phase-warm-up';
      badge.setAttribute('role', 'status');
      badge.setAttribute('aria-live', 'polite');
      badge.setAttribute('aria-label', 'Warm Up');
      badge.innerHTML =
        '<span class="sm-badge-icon" aria-hidden="true">✨</span>' +
        '<span class="sm-badge-text">Warm Up</span>';
      container.appendChild(badge);
      this._badge = badge;
    }

    /* ─────────────────────────────────────────────────────
       Public — progress reporting
       ───────────────────────────────────────────────────── */

    /**
     * Call after each correct item / round completion.
     * Automatically detects phase changes and shows transitions.
     * Returns a Promise that resolves after any transition finishes.
     *
     * @param {number} current  — items completed so far
     * @param {number} total    — total items in the session
     * @param {object} context  — GameShell context (for speak / animation)
     */
    async reportProgress(current, total, context) {
      if (!this._ready || this._busy || total === 0) return;

      const checkpoints = PHASE_CHECKPOINTS[this._gameType];

      // Unknown game type → no phase advances (game keeps its existing end screen)
      if (!checkpoints) return;

      // Find the highest designed checkpoint that current has now reached
      // but that hasn't been triggered yet.  Using Math.max across all
      // matching entries handles the resume case: if a player picks up a
      // saved game mid-session we jump straight to the correct phase in
      // one step (no intermediate overlays).
      let target = this._phaseIdx;
      for (const cp of checkpoints) {
        if (cp.phaseIdx > this._phaseIdx && current >= cp.afterItem) {
          target = Math.max(target, cp.phaseIdx);
        }
      }

      if (target > this._phaseIdx) {
        const phase = PHASES[target];
        this._phaseIdx = target;
        this._updateBadge(target);
        if (phase.showOverlay) {
          await this._showTransition(phase, context);
        }
      }
    }

    /* ─────────────────────────────────────────────────────
       Public — resume sync
       ───────────────────────────────────────────────────── */

    /**
     * Silently advance the phase badge to match a restored save position.
     * Call once after restoreProgress() so the badge immediately shows
     * the correct phase without firing any overlay for already-passed
     * checkpoints.
     *
     * @param {number} itemsShown — correct items already done (from saved state)
     */
    syncPhase(itemsShown) {
      if (!this._ready) return;
      const checkpoints = PHASE_CHECKPOINTS[this._gameType];
      if (!checkpoints) return;

      // Find the highest checkpoint already passed at this item count
      let target = 0;
      for (const cp of checkpoints) {
        if (itemsShown >= cp.afterItem) {
          target = Math.max(target, cp.phaseIdx);
        }
      }

      // Advance badge silently — no overlay, no animation delay
      if (target > this._phaseIdx) {
        this._phaseIdx = target;
        this._updateBadge(target);
      }
    }

    /* ─────────────────────────────────────────────────────
       Public — celebration
       ───────────────────────────────────────────────────── */

    /**
     * Show the child-facing end-of-session celebration screen.
     * Parent metrics are NOT shown here — they live in saveSession().
     *
     * @param {object} opts
     *   opts.accuracy   0-1 float (drives star count)
     *   opts.onContinue function called when user taps Keep Going
     * @returns Promise resolving after user dismisses
     */
    showCelebration(opts = {}) {
      const { accuracy = 1, onContinue = null } = opts;
      const topic = this.getTopic(this._gameType || '');
      const stars = Math.max(1, Math.min(3, Math.round(accuracy * 3)));

      const overlay = document.createElement('div');
      overlay.className = 'sm-celebration';
      overlay.setAttribute('role', 'dialog');
      overlay.setAttribute('aria-modal', 'true');
      overlay.setAttribute('aria-label', 'You did it');

      overlay.innerHTML = [
        '<div class="sm-celebration-inner">',
          this._sparklesHTML(16),
          `<div class="sm-celebration-icon" aria-hidden="true">${topic.icon}</div>`,
          '<div class="sm-celebration-title">You did it!</div>',
          `<div class="sm-celebration-topic">${topic.name}</div>`,
          `<div class="sm-celebration-stars" aria-label="${stars} star${stars !== 1 ? 's' : ''}">`,
            [1, 2, 3].map(i =>
              `<span class="sm-star${i <= stars ? ' sm-star-on' : ''}" aria-hidden="true"></span>`
            ).join(''),
          '</div>',
          '<button class="sm-celebration-btn" id="smCelebBtn">',
            'Keep Going <span aria-hidden="true">→</span>',
          '</button>',
        '</div>',
      ].join('');

      document.body.appendChild(overlay);

      // Trigger CSS transition after paint (double rAF is the reliable pattern)
      requestAnimationFrame(() =>
        requestAnimationFrame(() => overlay.classList.add('sm-celebration-show'))
      );

      return new Promise(resolve => {
        document.getElementById('smCelebBtn').addEventListener('click', () => {
          overlay.classList.add('sm-celebration-exit');
          setTimeout(() => {
            overlay.remove();
            if (typeof onContinue === 'function') onContinue();
            resolve();
          }, 380);
        }, { once: true });
      });
    }

    /* ─────────────────────────────────────────────────────
       Private helpers
       ───────────────────────────────────────────────────── */

    _updateBadge(idx) {
      if (!this._badge) return;
      const p = PHASES[idx];
      this._badge.className = `sm-badge sm-phase-${p.id}`;
      this._badge.setAttribute('aria-label', p.label);
      this._badge.innerHTML =
        `<span class="sm-badge-icon" aria-hidden="true">${p.emoji}</span>` +
        `<span class="sm-badge-text">${p.label}</span>`;
    }

    async _showTransition(phase, context) {
      this._busy = true;

      // audioKey is null on all current phases (see comment in PHASES array).
      // phase.animation is kept in PHASES for future use (e.g. a character avatar
      // inside the overlay) but NOT called here — the overlay sits above z-index 9100,
      // fully covering the character at z-index 5, so characterAnimation does nothing
      // visible from behind the overlay.
      if (phase.audioKey && context) context.speak(phase.audioKey);

      const overlay = document.createElement('div');
      overlay.className = 'sm-transition';
      overlay.setAttribute('aria-live', 'assertive');
      overlay.setAttribute('aria-label', phase.label);
      overlay.innerHTML =
        '<div class="sm-transition-inner">' +
          `<div class="sm-transition-emoji" aria-hidden="true">${phase.emoji}</div>` +
          `<div class="sm-transition-label">${phase.label}</div>` +
        '</div>';
      document.body.appendChild(overlay);

      // Animate in — double-RAF with a 50 ms fallback so the show class is
      // always added even on low-power devices or when RAF is throttled.
      await new Promise(r => {
        const add = () => { overlay.classList.add('sm-transition-show'); r(); };
        requestAnimationFrame(() => requestAnimationFrame(add));
        setTimeout(add, 50); // safety net — only fires if both RAFs are late
      });

      // Hold — emoji spin completes at ~640 ms; 460 ms of peak stillness follows.
      // Total from show class: 1100 ms feels quick and magical, not like a pause.
      await new Promise(r => setTimeout(r, 1100));

      // Animate out
      overlay.classList.add('sm-transition-exit');
      await new Promise(r => setTimeout(r, 260));
      overlay.remove();

      this._busy = false;
    }

    _sparklesHTML(count) {
      const dots = [];
      for (let i = 0; i < count; i++) {
        dots.push(`<div class="sm-sparkle" style="--i:${i}"></div>`);
      }
      return `<div class="sm-sparkles" aria-hidden="true">${dots.join('')}</div>`;
    }
  }

  /* ── Singleton ──────────────────────────────────────────── */
  window.SessionMgr = new SessionManager();

}());
