/**
 * transition-screen.js
 * Cinematic full-bleed overlay that fires between onboarding steps.
 * Respects sensoryIntensity: skips on "low", short on "gentle".
 */

const AFFIRMATIONS = {
  coach: [
    "Strong start, Explorer!",
    "Solid pick. Moving forward.",
    "Your world is taking shape.",
    "Soundtrack locked in.",
    "Colors are dialled in.",
    "Pace set. Let's keep rolling.",
    "Your guide is ready.",
    "Sensory settings confirmed.",
    "Victory path chosen.",
    "Navigation set. Let's go!"
  ],
  professor: [
    "Name registered.",
    "Avatar assigned to profile.",
    "World style recorded.",
    "Music preference noted.",
    "Palette calibrated.",
    "Vibe parameters confirmed.",
    "Guide protocol selected.",
    "Sensory threshold locked.",
    "Victory taxonomy set.",
    "Interface method confirmed."
  ],
  comedian: [
    "Excellent! The buttons are clapping.",
    "Avatar accepted — very professional choice.",
    "World unlocked. No refunds.",
    "Soundtrack approved by the DJ fish.",
    "Colors tuned. Very tasteful.",
    "Vibe dialled. Nothing suspicious.",
    "Guide hired. References checked.",
    "Sensory levels — nice.",
    "Victory style locked. Very dramatic.",
    "Navigation confirmed. Here we go!"
  ],
  zen: [
    "Gently chosen. Well done.",
    "Your companion is at peace.",
    "Your world breathes with you.",
    "Music settles around you.",
    "Colors bloom quietly.",
    "Pace found. Rest easy.",
    "Guide arrives with calm.",
    "Stillness preserved.",
    "Victory, softly held.",
    "Path set. All is steady."
  ],
  "secret-agent": [
    "Identity confirmed, Agent.",
    "Avatar cleared for mission.",
    "World sector unlocked.",
    "Audio channel tuned.",
    "Visual spectrum set.",
    "Vibe profile uploaded.",
    "Guide operative assigned.",
    "Sensory perimeter configured.",
    "Victory protocol armed.",
    "Navigation mode engaged."
  ]
};

function getAffirmation(stepIndex, guideStyle) {
  const guide = AFFIRMATIONS[guideStyle] || AFFIRMATIONS.coach;
  return guide[stepIndex] || guide[0];
}

function holdDuration(sensory) {
  if (sensory === "low")      return 0;
  if (sensory === "gentle")   return 700;
  if (sensory === "balanced") return 1000;
  if (sensory === "lively")   return 1200;
  return 1400; // high
}

export class TransitionScreen {
  constructor() {
    this._el = null;
    this._active = false;
  }

  _build() {
    if (this._el) return;
    const el = document.createElement("div");
    el.className = "transition-screen";
    el.setAttribute("aria-live", "polite");
    el.setAttribute("aria-atomic", "true");
    el.hidden = true;
    el.innerHTML = `
      <div class="ts-inner">
        <div class="ts-glyph" aria-hidden="true"></div>
        <div class="ts-label"></div>
        <div class="ts-affirmation"></div>
        <div class="ts-progress-dots" aria-hidden="true"></div>
      </div>`;
    document.body.appendChild(el);
    this._el = el;
  }

  /**
   * Show a transition screen between onboarding steps.
   * @param {Object} opts
   * @param {string}  opts.glyph        - 2-char glyph or emoji
   * @param {string}  opts.label        - Chosen item label
   * @param {number}  opts.stepIndex    - 0-based step index
   * @param {number}  opts.totalSteps   - Total steps (for dots)
   * @param {string}  opts.guideStyle   - Guide key for affirmation text
   * @param {string}  opts.sensory      - sensoryIntensity value
   * @param {string}  [opts.palette]    - data-palette value to apply briefly
   */
  async show({ glyph, label, stepIndex = 0, totalSteps = 10, guideStyle = "coach", sensory = "gentle", palette }) {
    if (sensory === "low" || this._active) return;
    this._active = true;
    this._build();

    const el = this._el;
    const inner = el.querySelector(".ts-inner");
    const glyphEl = el.querySelector(".ts-glyph");
    const labelEl = el.querySelector(".ts-label");
    const affirmEl = el.querySelector(".ts-affirmation");
    const dotsEl = el.querySelector(".ts-progress-dots");

    // Populate content
    glyphEl.textContent = glyph || "✓";
    labelEl.textContent = label || "";
    affirmEl.textContent = getAffirmation(stepIndex, guideStyle);

    // Step dots
    dotsEl.innerHTML = Array.from({ length: totalSteps }, (_, i) =>
      `<span class="ts-dot ${i <= stepIndex ? "is-done" : ""}"></span>`
    ).join("");

    // Apply palette accent briefly
    if (palette) el.setAttribute("data-palette", palette);

    el.hidden = false;

    // Animate IN
    await inner.animate(
      [
        { opacity: 0, transform: "scale(.88) translateY(16px)", filter: "blur(12px)" },
        { opacity: 1, transform: "scale(1) translateY(0)",      filter: "blur(0)" }
      ],
      { duration: sensory === "gentle" ? 320 : 480, easing: "cubic-bezier(.22,1,.36,1)", fill: "both" }
    ).finished.catch(() => {});

    // Hold
    await new Promise(r => setTimeout(r, holdDuration(sensory)));

    // Animate OUT
    await inner.animate(
      [
        { opacity: 1, transform: "scale(1) translateY(0)",       filter: "blur(0)" },
        { opacity: 0, transform: "scale(1.06) translateY(-10px)", filter: "blur(8px)" }
      ],
      { duration: sensory === "gentle" ? 240 : 380, easing: "cubic-bezier(.4,0,1,1)", fill: "both" }
    ).finished.catch(() => {});

    el.hidden = true;
    if (palette) el.removeAttribute("data-palette");
    this._active = false;
  }
}
