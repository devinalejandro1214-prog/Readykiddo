/* ─────────────────────────────────────────────────────────
   ReadyKiddo — Draw It. Snap It.  (Game #11)

   A guided, step-by-step drawing experience. Each mission has an
   ordered list of steps; every step animates an SVG outline (via
   stroke-dasharray / stroke-dashoffset) so the child can copy it
   stroke-by-stroke. Completed steps stay on a faint "ghost" layer
   so the full picture builds up. Finishing a mission shows the
   composed drawing and routes into the shared celebration overlay.

   Ported from the DrawItSnapIt.html prototype into the site's
   vanilla-JS, single-#gameArea game pattern (see color-sort-game.js).

   Voice is wired through the context API:
     • context.speakInstruction(text)  → TEACHER voice, per-step direction
     • context.speakPraise(text)       → CHARACTER voice, step encouragement
     • context.randomEncouragement()   → recorded praise clip on completion
   Step sentences are freeform with no recorded clips, so speakInstruction
   gracefully falls back to browser speechSynthesis (acceptable per spec).
   ───────────────────────────────────────────────────────── */

/* ── Palette (shared by all missions) ─────────────────────── */
const DRAWIT_ORANGE = '#F4A839', DRAWIT_BLACK = '#222222', DRAWIT_BLUE = '#2E8BC0',
      DRAWIT_YELLOW = '#F4C430', DRAWIT_GREEN = '#3CA04A', DRAWIT_BROWN = '#8B5A2B',
      DRAWIT_PURPLE = '#9B5DE5', DRAWIT_PINK = '#F15BB5', DRAWIT_RED = '#E03B3B';

/* ─────────────────────────────────────────────────────────
   Mission data — authored in a 300×300 viewBox.
   Only correct, recognizable drawings ship (see header note in
   draw-it-art-check.html). The three beginner missions keep the
   prototype's verified art verbatim; Lion and Butterfly are fully
   authored multi-step art. The Dragon stub was dropped because a
   single squiggle never read as a dragon.
   ───────────────────────────────────────────────────────── */
const DRAWIT_MISSIONS = [
  {
    id: 'simple-cat', title: 'Simple Cat', difficulty: 'Beginner', ageMin: 4,
    worldCategory: 'Pet House', locked: false,
    colors: [DRAWIT_ORANGE, DRAWIT_BLACK], colorNames: ['Orange', 'Black'],
    steps: [
      { color: DRAWIT_ORANGE, colorName: 'Orange', duration: 1.5,
        svgPath: 'M 80,150 a 70,70 0 1,1 140,0 a 70,70 0 1,1 -140,0',
        instruction: 'Draw a big round head.', encouragement: 'Great circle!' },
      { color: DRAWIT_ORANGE, colorName: 'Orange', duration: 1.5,
        svgPath: 'M 96,98 L 78,52 L 126,80 Z M 204,98 L 222,52 L 174,80 Z',
        instruction: 'Add two pointy triangle ears on top.', encouragement: 'Looking like a cat already!' },
      { color: DRAWIT_BLACK, colorName: 'Black', duration: 1.2,
        svgPath: 'M 118,138 a 7,7 0 1,1 0.1,0 Z M 182,138 a 7,7 0 1,1 0.1,0 Z',
        instruction: 'Draw two round eyes.', encouragement: 'Now it can see you!' },
      { color: DRAWIT_BLACK, colorName: 'Black', duration: 1.0,
        svgPath: 'M 150,158 L 142,167 L 158,167 Z',
        instruction: 'Add a little triangle nose.', encouragement: 'So cute.' },
      { color: DRAWIT_BLACK, colorName: 'Black', duration: 1.8,
        svgPath: 'M 92,162 L 132,168 M 92,178 L 132,176 M 208,162 L 168,168 M 208,178 L 168,176',
        instruction: 'Draw long whiskers on each side.', encouragement: 'Almost there!' },
      { color: DRAWIT_BLACK, colorName: 'Black', duration: 1.5,
        svgPath: 'M 150,167 Q 150,184 134,184 M 150,167 Q 150,184 166,184',
        instruction: 'Finish with a happy smile.', encouragement: 'You made a cat!' },
    ]
  },
  {
    id: 'happy-fish', title: 'Happy Fish', difficulty: 'Beginner', ageMin: 4,
    worldCategory: 'Ocean', locked: false,
    colors: [DRAWIT_BLUE, DRAWIT_YELLOW], colorNames: ['Blue', 'Yellow'],
    steps: [
      { color: DRAWIT_BLUE, colorName: 'Blue', duration: 1.6,
        svgPath: 'M 88,150 Q 150,86 208,150 Q 150,214 88,150 Z',
        instruction: 'Draw a big oval for the body.', encouragement: 'Splashy start!' },
      { color: DRAWIT_BLUE, colorName: 'Blue', duration: 1.4,
        svgPath: 'M 88,150 L 46,112 L 58,150 L 46,188 Z',
        instruction: 'Add a triangle tail on the left.', encouragement: 'Now it can swim!' },
      { color: DRAWIT_BLUE, colorName: 'Blue', duration: 1.2,
        svgPath: 'M 138,104 Q 162,80 184,110',
        instruction: 'Draw a curvy fin on top.', encouragement: 'Looking fishy!' },
      { color: DRAWIT_BLUE, colorName: 'Blue', duration: 1.0,
        svgPath: 'M 178,138 a 9,9 0 1,1 0.1,0 Z',
        instruction: 'Add a round eye near the front.', encouragement: 'It sees you!' },
      { color: DRAWIT_BLUE, colorName: 'Blue', duration: 1.0,
        svgPath: 'M 164,164 Q 180,176 196,162',
        instruction: 'Give it a happy smile.', encouragement: 'So friendly!' },
      { color: DRAWIT_YELLOW, colorName: 'Yellow', duration: 1.4,
        svgPath: 'M 222,118 a 7,7 0 1,1 0.1,0 Z M 238,96 a 5,5 0 1,1 0.1,0 Z M 250,78 a 4,4 0 1,1 0.1,0 Z',
        instruction: 'Add little bubbles floating up.', encouragement: 'Glub glub — you did it!' },
    ]
  },
  {
    id: 'big-tree', title: 'Big Tree', difficulty: 'Beginner', ageMin: 5,
    worldCategory: 'Backyard', locked: false,
    colors: [DRAWIT_GREEN, DRAWIT_BROWN], colorNames: ['Green', 'Brown'],
    steps: [
      { color: DRAWIT_BROWN, colorName: 'Brown', duration: 1.6,
        // Solid closed trapezoid trunk (wider at the base) so it reads as one
        // sturdy trunk, not two thin "legs".
        svgPath: 'M 132,264 L 140,178 L 160,178 L 168,264 Z',
        instruction: 'Draw a tall trunk going up.', encouragement: 'Strong and tall!' },
      { color: DRAWIT_BROWN, colorName: 'Brown', duration: 1.2,
        svgPath: 'M 150,196 L 112,164 M 150,196 L 192,166',
        instruction: 'Add two branches reaching out.', encouragement: 'Reaching for the sky!' },
      { color: DRAWIT_GREEN, colorName: 'Green', duration: 1.8,
        svgPath: 'M 90,116 a 60,60 0 1,1 120,0 a 60,60 0 1,1 -120,0',
        instruction: 'Draw a big round bunch of leaves.', encouragement: 'So leafy!' },
      { color: DRAWIT_GREEN, colorName: 'Green', duration: 1.4,
        svgPath: 'M 70,142 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0',
        instruction: 'Add a leafy puff on the left.', encouragement: 'Fuller already!' },
      { color: DRAWIT_GREEN, colorName: 'Green', duration: 1.4,
        svgPath: 'M 162,142 a 34,34 0 1,1 68,0 a 34,34 0 1,1 -68,0',
        instruction: 'Add a leafy puff on the right.', encouragement: 'Almost done!' },
      { color: DRAWIT_GREEN, colorName: 'Green', duration: 1.5,
        // Leaf marks scattered across the canopy (not a centred row) so they
        // read as foliage texture rather than a face.
        svgPath: 'M 108,110 q 7,-12 14,0 M 144,90 q 7,-12 14,0 M 182,110 q 7,-12 14,0 ' +
                 'M 126,140 q 7,-12 14,0 M 166,140 q 7,-12 14,0',
        instruction: 'Draw little leaf details inside.', encouragement: 'You grew a tree!' },
    ]
  },
  {
    /* Authored art: spiky mane ring + face + ears + eyes + muzzle + nose + mouth.
       Reads as a front-facing lion's head inside the 300×300 viewBox. */
    id: 'lion', title: 'Lion', difficulty: 'Intermediate', ageMin: 6,
    worldCategory: 'Jungle', locked: false,
    colors: [DRAWIT_BROWN, DRAWIT_YELLOW, DRAWIT_BLACK], colorNames: ['Brown', 'Yellow', 'Black'],
    steps: [
      { color: DRAWIT_BROWN, colorName: 'Brown', duration: 2.2,
        // Spiky mane: 16-point star ring around the centre (radius ~92 out / ~70 in)
        svgPath: 'M 150,58 L 167,90 L 199,73 L 195,109 L 232,108 L 209,137 L 242,150 ' +
                 'L 209,163 L 232,192 L 195,191 L 199,227 L 167,210 L 150,242 L 133,210 ' +
                 'L 101,227 L 105,191 L 68,192 L 91,163 L 58,150 L 91,137 L 68,108 ' +
                 'L 105,109 L 101,73 L 133,90 Z',
        instruction: 'Draw a big spiky mane all the way around.', encouragement: 'What a fluffy mane!' },
      { color: DRAWIT_YELLOW, colorName: 'Yellow', duration: 1.6,
        // Round face inside the mane
        svgPath: 'M 92,150 a 58,58 0 1,1 116,0 a 58,58 0 1,1 -116,0',
        instruction: 'Draw a round face in the middle.', encouragement: 'There is his face!' },
      { color: DRAWIT_YELLOW, colorName: 'Yellow', duration: 1.4,
        // Two little rounded ears poking from the top of the face
        svgPath: 'M 110,108 a 13,13 0 1,1 26,0 a 13,13 0 1,1 -26,0 ' +
                 'M 164,108 a 13,13 0 1,1 26,0 a 13,13 0 1,1 -26,0',
        instruction: 'Add two little round ears on top.', encouragement: 'I can hear you now!' },
      { color: DRAWIT_BLACK, colorName: 'Black', duration: 1.2,
        // Two eyes
        svgPath: 'M 126,144 a 7,7 0 1,1 0.1,0 Z M 174,144 a 7,7 0 1,1 0.1,0 Z',
        instruction: 'Draw two eyes.', encouragement: 'Now he can see!' },
      { color: DRAWIT_BLACK, colorName: 'Black', duration: 1.4,
        // Two side-by-side cheek bumps (minimal overlap) = a clear lion muzzle,
        // not two stacked/concentric circles.
        svgPath: 'M 117,184 a 17,15 0 1,0 34,0 a 17,15 0 1,0 -34,0 ' +
                 'M 149,184 a 17,15 0 1,0 34,0 a 17,15 0 1,0 -34,0',
        instruction: 'Draw a round nose-and-mouth area.', encouragement: 'Looking like a lion!' },
      { color: DRAWIT_BLACK, colorName: 'Black', duration: 1.5,
        // Triangle nose sitting in the cleft + mouth dropping between the bumps
        svgPath: 'M 141,168 L 159,168 L 150,179 Z M 150,179 L 150,190 ' +
                 'M 150,190 Q 137,198 129,189 M 150,190 Q 163,198 171,189',
        instruction: 'Finish the nose and a big roary mouth.', encouragement: 'Roar! You drew a lion!' },
    ]
  },
  {
    /* Authored art: body + 4 wings + antennae + wing spots.
       Reads as a symmetric butterfly inside the 300×300 viewBox. */
    id: 'butterfly', title: 'Butterfly', difficulty: 'Intermediate', ageMin: 6,
    worldCategory: 'Garden', locked: false,
    colors: [DRAWIT_PURPLE, DRAWIT_PINK, DRAWIT_BLACK], colorNames: ['Purple', 'Pink', 'Black'],
    steps: [
      { color: DRAWIT_BLACK, colorName: 'Black', duration: 1.4,
        // Slim body down the centre + small head circle on top
        svgPath: 'M 150,96 L 150,214 M 142,90 a 8,8 0 1,1 16,0 a 8,8 0 1,1 -16,0',
        instruction: 'Draw a long thin body down the middle.', encouragement: 'Good start!' },
      { color: DRAWIT_PURPLE, colorName: 'Purple', duration: 1.8,
        // Upper-left wing (big lobe)
        svgPath: 'M 150,118 Q 78,72 70,128 Q 66,168 150,154 Z',
        instruction: 'Draw a big top wing on the left.', encouragement: 'One wing done!' },
      { color: DRAWIT_PURPLE, colorName: 'Purple', duration: 1.8,
        // Upper-right wing (mirror)
        svgPath: 'M 150,118 Q 222,72 230,128 Q 234,168 150,154 Z',
        instruction: 'Draw a matching top wing on the right.', encouragement: 'Now it is even!' },
      { color: DRAWIT_PINK, colorName: 'Pink', duration: 1.6,
        // Lower-left wing (smaller lobe)
        svgPath: 'M 150,158 Q 92,168 88,212 Q 86,242 150,206 Z',
        instruction: 'Add a smaller bottom wing on the left.', encouragement: 'Looking pretty!' },
      { color: DRAWIT_PINK, colorName: 'Pink', duration: 1.6,
        // Lower-right wing (mirror)
        svgPath: 'M 150,158 Q 208,168 212,212 Q 214,242 150,206 Z',
        instruction: 'Add a matching bottom wing on the right.', encouragement: 'Almost a butterfly!' },
      { color: DRAWIT_BLACK, colorName: 'Black', duration: 1.6,
        // Curly antennae + a spot on each top wing
        svgPath: 'M 146,84 Q 132,60 118,58 M 154,84 Q 168,60 182,58 ' +
                 'M 104,120 a 9,9 0 1,1 0.1,0 Z M 196,120 a 9,9 0 1,1 0.1,0 Z',
        instruction: 'Add curly antennae and a spot on each wing.', encouragement: 'You made a butterfly!' },
    ]
  },
];

class DrawItGame {
  constructor(context) {
    this.context = context;
    this.worldSlug = context.worldSlug;

    // Engine state
    this.mission = null;     // active mission object
    this.stepIdx = 0;        // index of the current step
    this.speedFactor = 1;    // 1 = normal, 2 = slow
    this.completedMissions = 0;
    this.totalMissions = DRAWIT_MISSIONS.length;
    this.ended = false;

    this.prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }

  /* ── Lifecycle ──────────────────────────────────────────── */

  async startGame() {
    this.render();

    // Background only — this game uses its own framed canvas, not the
    // floating character, so we leave the character layer hidden.
    const bgEl = document.getElementById('gameBackground');
    if (bgEl && this.context.backgroundPath) bgEl.src = this.context.backgroundPath;

    this.showScreen('home');
    this.renderHome();
  }

  /* ── Top-level DOM ──────────────────────────────────────── */

  render() {
    const gameArea = document.getElementById('gameArea');
    gameArea.innerHTML = `
      <div class="drawit-game">
        <!-- Mission select -->
        <section class="drawit-screen drawit-active" id="drawitHome">
          <div class="drawit-hero">
            <h1 class="drawit-h1">Pick something to <span class="drawit-pop">draw</span></h1>
            <p class="drawit-sub">Follow the steps at your own pace. When you finish, your drawing comes to life!</p>
          </div>
          <div class="drawit-section-label">Ready to draw</div>
          <div class="drawit-missions" id="drawitMissions"></div>
        </section>

        <!-- Color prep -->
        <section class="drawit-screen" id="drawitPrep">
          <div class="drawit-center">
            <div class="drawit-prep-card">
              <div class="drawit-kicker">Before you start</div>
              <h2 class="drawit-h2" id="drawitPrepTitle">Grab these colors</h2>
              <p class="drawit-lead">Find one of each marker or crayon. You'll use them as you go.</p>
              <div class="drawit-color-list" id="drawitColorList"></div>
              <button class="drawit-btn drawit-btn-go drawit-block" id="drawitStartBtn">
                Start drawing ✏️
              </button>
              <button class="drawit-btn drawit-btn-ghost drawit-block" id="drawitPrepBackBtn">Back</button>
            </div>
          </div>
        </section>

        <!-- Drawing steps -->
        <section class="drawit-screen" id="drawitDraw">
          <div class="drawit-draw-head">
            <span class="drawit-step-counter" id="drawitStepCounter">Step 1</span>
            <div class="drawit-dots" id="drawitDots" aria-label="Drawing progress"></div>
            <div class="drawit-callout" id="drawitCallout">
              <span class="drawit-swatch-lg" id="drawitCalloutSwatch"></span>
              <span class="drawit-cc-text">
                <span class="drawit-cc-small" id="drawitCalloutSmall">Grab your</span>
                <span id="drawitCalloutColor">Orange marker</span>
              </span>
            </div>
          </div>

          <div class="drawit-stage">
            <div class="drawit-canvas-frame">
              <svg id="drawitGhost" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet" aria-hidden="true"></svg>
              <svg id="drawitActive" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet" role="img" aria-label="Animated drawing step"></svg>
            </div>
            <p class="drawit-instruction" id="drawitInstruction">Draw a big round head.</p>
            <div class="drawit-controls">
              <button class="drawit-ctl" id="drawitReplayBtn" aria-label="Replay this step">↻ Replay</button>
              <button class="drawit-ctl" id="drawitSlowBtn" aria-label="Draw this step slowly">🐢 Slow down</button>
              <button class="drawit-btn drawit-btn-primary" id="drawitNextBtn">
                <span id="drawitNextLabel">Next</span> <span class="drawit-arrow">→</span>
              </button>
            </div>
          </div>
        </section>

        <!-- Completion -->
        <section class="drawit-screen" id="drawitComplete">
          <div class="drawit-center">
            <div class="drawit-complete-card">
              <div class="drawit-burst">🎉</div>
              <h2 class="drawit-h2" id="drawitCompleteTitle">You did it!</h2>
              <p class="drawit-lead" id="drawitCompleteLead">Now snap a photo to bring it into your world.</p>
              <div class="drawit-twin">
                <div class="drawit-slot">
                  <div class="drawit-frame"><svg id="drawitCompleteArt" viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet"></svg></div>
                  <div class="drawit-who">Your drawing</div>
                </div>
              </div>
              <div class="drawit-complete-actions">
                <button class="drawit-btn drawit-btn-ghost" id="drawitMoreBtn">Draw another</button>
                <button class="drawit-btn drawit-btn-go" id="drawitFinishBtn">All done</button>
              </div>
            </div>
          </div>
        </section>
      </div>

      <canvas id="drawitConfetti" aria-hidden="true"></canvas>
    `;

    // Wire controls
    document.getElementById('drawitStartBtn').addEventListener('click', () => this.startDrawing());
    document.getElementById('drawitPrepBackBtn').addEventListener('click', () => this.showScreen('home'));
    document.getElementById('drawitNextBtn').addEventListener('click', () => this.nextStep());
    document.getElementById('drawitReplayBtn').addEventListener('click', () => { this.speedFactor = 1; this.animatePath(); });
    document.getElementById('drawitSlowBtn').addEventListener('click', () => { this.speedFactor = 2; this.animatePath(); });
    document.getElementById('drawitMoreBtn').addEventListener('click', () => this.showScreen('home'));
    document.getElementById('drawitFinishBtn').addEventListener('click', () => this.end());
  }

  /* ── Screen switching ───────────────────────────────────── */

  showScreen(name) {
    const ids = { home: 'drawitHome', prep: 'drawitPrep', draw: 'drawitDraw', complete: 'drawitComplete' };
    Object.values(ids).forEach(id => {
      const el = document.getElementById(id);
      if (el) el.classList.remove('drawit-active');
    });
    const target = document.getElementById(ids[name]);
    if (target) target.classList.add('drawit-active');
  }

  /* ── Mission select ─────────────────────────────────────── */

  miniPreview(mission) {
    const paths = mission.steps.map(s =>
      `<path d="${s.svgPath}" fill="none" stroke="${s.color}" stroke-width="6"
         stroke-linecap="round" stroke-linejoin="round" opacity="0.9"/>`).join('');
    return `<svg viewBox="0 0 300 300" preserveAspectRatio="xMidYMid meet">${paths}</svg>`;
  }

  renderHome() {
    const wrap = document.getElementById('drawitMissions');
    if (!wrap) return;
    wrap.innerHTML = DRAWIT_MISSIONS.map(m => {
      const swatches = m.colors.map(c => `<span class="drawit-card-swatch" style="background:${c}"></span>`).join('');
      return `<button class="drawit-mission" data-id="${m.id}"
                aria-label="Start ${m.title}, ${m.difficulty}, ${m.steps.length} steps">
        <div class="drawit-preview">${this.miniPreview(m)}</div>
        <div class="drawit-meta">
          <div class="drawit-title">${m.title}</div>
          <div class="drawit-chips">
            <span class="drawit-chip">${m.difficulty}</span>
            <span class="drawit-chip drawit-chip-world">${m.worldCategory}</span>
          </div>
          <div class="drawit-card-swatches">${swatches}</div>
        </div>
      </button>`;
    }).join('');
    wrap.querySelectorAll('.drawit-mission').forEach(btn => {
      btn.addEventListener('click', () => this.openMission(btn.dataset.id));
    });
  }

  /* ── Color prep ─────────────────────────────────────────── */

  openMission(id) {
    this.mission = DRAWIT_MISSIONS.find(m => m.id === id);
    if (!this.mission) return;
    this.stepIdx = 0;
    document.getElementById('drawitPrepTitle').textContent = `Colors for ${this.mission.title}`;
    document.getElementById('drawitColorList').innerHTML = this.mission.colors.map((c, i) => `
      <div class="drawit-color-row">
        <span class="drawit-dot" style="background:${c}"></span>
        <span class="drawit-color-label">${this.mission.colorNames[i]}</span>
        <span class="drawit-color-note">marker or crayon</span>
      </div>`).join('');
    this.showScreen('prep');
    this.context.speakInstruction(`Let's draw a ${this.mission.title}! Grab your colors.`);
  }

  /* ── Drawing engine ─────────────────────────────────────── */

  startDrawing() {
    this.speedFactor = 1;
    this.stepIdx = 0;
    this.showScreen('draw');
    this.renderStep();
  }

  renderStep() {
    const step = this.mission.steps[this.stepIdx];
    const total = this.mission.steps.length;

    document.getElementById('drawitStepCounter').textContent = `Step ${this.stepIdx + 1} of ${total}`;
    document.getElementById('drawitInstruction').textContent = step.instruction;

    // Progress dots
    document.getElementById('drawitDots').innerHTML = this.mission.steps.map((s, i) =>
      `<span class="drawit-pdot ${i < this.stepIdx ? 'done' : (i === this.stepIdx ? 'active' : '')}"></span>`).join('');

    // Color callout — "Grab" first, "Keep" if unchanged, "Now grab" if changed
    const prev = this.stepIdx > 0 ? this.mission.steps[this.stepIdx - 1] : null;
    let small;
    if (!prev) small = 'Grab your';
    else if (prev.colorName === step.colorName) small = 'Keep your';
    else small = 'Now grab your';
    document.getElementById('drawitCalloutSmall').textContent = small;
    document.getElementById('drawitCalloutColor').textContent = `${step.colorName} marker`;
    document.getElementById('drawitCalloutSwatch').style.background = step.color;
    document.getElementById('drawitCallout').style.borderColor = step.color;

    // Ghost layer — all previously completed steps at low opacity
    document.getElementById('drawitGhost').innerHTML = this.mission.steps.slice(0, this.stepIdx).map(s =>
      `<path class="drawit-ghost-path" d="${s.svgPath}" stroke="${s.color}"/>`).join('');

    // Active layer — current step, animated via stroke-dashoffset
    document.getElementById('drawitActive').innerHTML =
      `<path id="drawitActivePath" class="drawit-draw-path" d="${step.svgPath}" stroke="${step.color}"/>`;
    document.getElementById('drawitActive').setAttribute('aria-label', step.instruction);

    // Next button label on the final step
    document.getElementById('drawitNextLabel').textContent =
      (this.stepIdx === total - 1) ? "We're done!" : 'Next';

    // Teacher voice reads the step direction
    this.context.speakInstruction(step.instruction);

    this.animatePath();
  }

  animatePath() {
    const path = document.getElementById('drawitActivePath');
    if (!path) return;
    const len = path.getTotalLength();
    const dur = this.mission.steps[this.stepIdx].duration * this.speedFactor;

    if (this.prefersReduced) {
      path.style.transition = 'none';
      path.style.strokeDasharray = 'none';
      path.style.strokeDashoffset = '0';
      return;
    }
    path.style.transition = 'none';
    path.style.strokeDasharray = len;
    path.style.strokeDashoffset = len;
    // Force reflow so the transition restarts from the beginning each time
    void path.getBoundingClientRect();
    path.style.transition = `stroke-dashoffset ${dur}s ease`;
    path.style.strokeDashoffset = '0';
  }

  nextStep() {
    const step = this.mission.steps[this.stepIdx];
    // Character voice cheers the completed step
    if (step.encouragement) {
      this.showEncourage(step.encouragement);
      this.context.speakPraise(step.encouragement);
    }
    if (this.stepIdx < this.mission.steps.length - 1) {
      this.stepIdx++;
      this.speedFactor = 1;
      this.renderStep();
    } else {
      this.finishMission();
    }
  }

  /* ── Encouragement popup ────────────────────────────────── */

  showEncourage(msg) {
    let el = document.getElementById('drawitEncourage');
    if (!el) {
      el = document.createElement('div');
      el.id = 'drawitEncourage';
      el.className = 'drawit-encourage';
      el.setAttribute('role', 'status');
      document.body.appendChild(el);
    }
    el.textContent = `⭐ ${msg}`;
    el.classList.add('show');
    clearTimeout(this._encTimer);
    this._encTimer = setTimeout(() => el.classList.remove('show'), 1600);
  }

  /* ── Completion (per-mission) ───────────────────────────── */

  fullDrawingSVG() {
    return this.mission.steps.map(s =>
      `<path d="${s.svgPath}" fill="none" stroke="${s.color}" stroke-width="6"
         stroke-linecap="round" stroke-linejoin="round"/>`).join('');
  }

  finishMission() {
    this.completedMissions = Math.min(this.completedMissions + 1, this.totalMissions);
    document.getElementById('drawitCompleteArt').innerHTML = this.fullDrawingSVG();
    document.getElementById('drawitCompleteTitle').textContent =
      `You drew a ${this.mission.title}!`;
    document.getElementById('drawitCompleteLead').innerHTML =
      `Your <b>${this.mission.title}</b> is ready. Snap a photo to bring it into your world — or draw another.`;
    this.showScreen('complete');

    // Recorded praise clip on mission complete
    this.context.randomEncouragement();
    this.context.reportProgress(this.completedMissions, this.totalMissions);
    this.launchConfetti();
  }

  /* ── Confetti ───────────────────────────────────────────── */

  launchConfetti() {
    if (this.prefersReduced) return;
    const canvas = document.getElementById('drawitConfetti');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    canvas.width = innerWidth * dpr; canvas.height = innerHeight * dpr; ctx.scale(dpr, dpr);
    const colors = ['#FF9933', '#0D3B66', '#3CA04A', '#F4C430', '#ffb866'];
    const pieces = Array.from({ length: 150 }, () => ({
      x: innerWidth / 2 + (Math.random() - 0.5) * 160, y: innerHeight * 0.35,
      vx: (Math.random() - 0.5) * 11, vy: Math.random() * -13 - 4,
      size: Math.random() * 8 + 4, color: colors[(Math.random() * colors.length) | 0],
      rot: Math.random() * Math.PI, vr: (Math.random() - 0.5) * 0.3, life: 0
    }));
    (function frame() {
      ctx.clearRect(0, 0, innerWidth, innerHeight);
      let alive = false;
      pieces.forEach(p => {
        p.life++; p.vy += 0.32; p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        if (p.y < innerHeight + 40) alive = true;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = p.color; ctx.globalAlpha = Math.max(0, 1 - p.life / 130);
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6); ctx.restore();
      });
      if (alive) requestAnimationFrame(frame); else ctx.clearRect(0, 0, innerWidth, innerHeight);
    })();
  }

  /* ── End — route into shared celebration overlay ────────── */

  async end() {
    if (this.ended) return;
    this.ended = true;

    this.context.saveSession({
      gameType: 'draw-it',
      accuracy: 1,                       // drawing has no wrong answers
      correctItems: this.completedMissions,
      totalItems: this.totalMissions,
      missionsCompleted: this.completedMissions,
      nextGameRecommendation: 'world-reveal'
    });

    this.context.randomEncouragement();

    if (window.RK?.logGameSession) { await window.RK.logGameSession('draw-it', { attempts: 1 }); }
    await this.context.showCelebration({
      accuracy: 1,
      onContinue: () => this.context.goToNextGame('world-reveal')
    });
  }
}

window.DrawItGame = DrawItGame;
