import { choiceLabel, choiceGlyph } from "../data.js";
import { normalizeName } from "../state.js";
import { escapeHtml } from "../interaction-engine.js";

export const landingRoute = {
  name: "landing",
  render({ state }) {
    const name = normalizeName(state.name);
    const hasProfile = state.hasCompletedJourney;
    const avatarGlyph = choiceGlyph("avatar", state.avatar);

    return `
      <section class="route hero-route motion-stage" aria-labelledby="landing-title">
        <div class="hero-copy" data-animate>
          <p class="eyebrow">Premium neuro-inclusive learning for ages 4-7</p>
          <h1 id="landing-title">A world that moves at your child's pace.</h1>
          <p class="hero-text">
            ReadyKiddo blends tactile motion, calm guidance, streaming lessons, and world creation
            into a low-friction experience that adapts before the first quest begins.
          </p>

          ${hasProfile ? `
            <div class="landing-welcome-back" data-animate>
              <span class="welcome-avatar" aria-hidden="true">${escapeHtml(avatarGlyph)}</span>
              <div>
                <p class="eyebrow">Welcome back</p>
                <strong class="welcome-name">${escapeHtml(name)}'s world is waiting.</strong>
              </div>
            </div>
          ` : ""}

          <div class="action-row">
            <a class="primary-cta" href="#/comfort" id="landing-create-cta">
              ${hasProfile ? "Rebuild your world" : "Create your own world"}
              <span aria-hidden="true">→</span>
            </a>
            ${hasProfile ? `<a class="secondary-cta" href="#/world">Return to my world</a>` : ""}
          </div>

          <div class="sync-strip" aria-label="Current adaptive settings" data-animate>
            <div class="sync-tile"><span>Sensory</span><strong>${choiceLabel("sensoryIntensity", state.sensoryIntensity)}</strong></div>
            <div class="sync-tile"><span>Music</span><strong>${choiceLabel("music", state.music)}</strong></div>
            <div class="sync-tile"><span>Navigation</span><strong>${choiceLabel("navigationMethod", state.navigationMethod)}</strong></div>
            <div class="sync-tile"><span>Vibe</span><strong>${choiceLabel("vibe", state.vibe)}</strong></div>
          </div>
        </div>

        <aside class="hero-visual native-sheet" aria-label="Motion-first world preview" data-animate>
          <div class="orb-stage">
            <div class="world-orb" aria-hidden="true">
              <span class="orb-glow"></span>
              <span class="orb-core"></span>
              <span class="orb-ring"></span>
              <span class="orb-pin"></span>
              <span class="orb-pin"></span>
              <span class="orb-pin"></span>
            </div>
            <div class="micro-card">
              <span class="lesson-pill">Today's first quest</span>
              <h2>Build a kindness bridge</h2>
              <p>One clear decision at a time, with motion and sound tuned to the learner.</p>
            </div>
          </div>
        </aside>
      </section>
    `;
  },

  mount({ mount }) {
    // Add press ripple to primary CTA
    const cta = mount.querySelector("#landing-create-cta");
    if (!cta) return;
    cta.addEventListener("pointerdown", () => {
      cta.classList.add("is-pressed");
    });
    cta.addEventListener("pointerup", () => {
      setTimeout(() => cta.classList.remove("is-pressed"), 320);
    });
    cta.addEventListener("pointerleave", () => cta.classList.remove("is-pressed"));
  }
};
