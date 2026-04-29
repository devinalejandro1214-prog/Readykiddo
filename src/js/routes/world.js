import { categories, sectors, guides, choiceLabel, choiceGlyph } from "../data.js";
import { normalizeName } from "../state.js";
import { escapeHtml } from "../interaction-engine.js";
import { revealWorld } from "../motion.js";

const victoryTiles = [
  { key: "collector", label: "Badge Shelf",  glyph: "BD" },
  { key: "explorer",  label: "Map Sparks",   glyph: "MP" },
  { key: "builder",   label: "Build Pieces", glyph: "BL" },
  { key: "hero",      label: "Hero Signals", glyph: "SH" },
  { key: "dj",        label: "Sound Gems",   glyph: "DJ" }
];

export const worldRoute = {
  name: "world",
  render({ state }) {
    const name = normalizeName(state.name);
    const guide = guides[state.guideStyle] || guides.coach;

    const sectorNodes = sectors.map(sector => `
      <a class="sector-node" data-sector="${sector.id}" href="#/sector/${sector.id}" data-animate>
        <span class="glyph" aria-hidden="true">${escapeHtml(sector.glyph)}</span>
        <strong>${escapeHtml(sector.title)}</strong>
        <span>${escapeHtml(sector.short)}</span>
      </a>
    `).join("");

    const rewards = victoryTiles.map(tile => `
      <div class="reward-tile ${tile.key === state.victoryStyle ? "is-active" : ""}" data-animate>
        <div class="glyph" aria-hidden="true">${escapeHtml(tile.glyph)}</div>
        <strong>${escapeHtml(tile.label)}</strong>
      </div>
    `).join("");

    return `
      <section class="route world-route motion-stage" aria-labelledby="world-title">

        <!-- World Birth overlay (fires once) -->
        <div class="world-birth" id="world-birth-overlay" aria-hidden="true"></div>

        <div class="reveal-grid">
          <aside class="profile-stack">
            <div class="profile-hero glass-card panel-pad" data-animate>
              <span class="lesson-pill">${choiceLabel("interestStyle", state.interestStyle)} world</span>
              <h1 id="world-title">${escapeHtml(name)}'s world is alive.</h1>
              <p>${escapeHtml(guide.complete(name))}</p>
              <div class="sync-strip">
                <div class="sync-tile"><span>Avatar</span><strong>${choiceGlyph("avatar", state.avatar)}</strong></div>
                <div class="sync-tile"><span>Vibe</span><strong>${choiceLabel("vibe", state.vibe)}</strong></div>
                <div class="sync-tile"><span>Music</span><strong>${choiceLabel("music", state.music)}</strong></div>
                <div class="sync-tile"><span>Nav</span><strong>${choiceLabel("navigationMethod", state.navigationMethod)}</strong></div>
              </div>
            </div>

            <div class="facilitator glass-card" data-animate>
              <div class="buddy-disc" aria-hidden="true"><span class="buddy-face">${escapeHtml(guide.face)}</span></div>
              <div>
                <p class="eyebrow">Facilitator Buddy</p>
                <h2>${escapeHtml(guide.label)}</h2>
                <p>I'll keep every sector synced to ${escapeHtml(name)}'s sensory, vibe, music, and navigation settings.</p>
              </div>
            </div>

            <div class="glass-card panel-pad" data-animate>
              <p class="eyebrow">Victory system</p>
              <div class="reward-dock">${rewards}</div>
            </div>
          </aside>

          <div class="reveal-stage glass-card panel-pad" data-animate>
            <div class="world-map" aria-label="Tailored ReadyKiddo world sectors">
              <div class="stage-surface"></div>
              <div class="world-lens" aria-hidden="true"></div>
              <div class="world-orb" aria-hidden="true">
                <span class="orb-glow"></span>
                <span class="orb-core"></span>
                <span class="orb-ring"></span>
                <span class="orb-pin"></span>
                <span class="orb-pin"></span>
                <span class="orb-pin"></span>
              </div>
              ${sectorNodes}
            </div>
          </div>
        </div>
      </section>
    `;
  },

  mount({ mount, state }) {
    const { store } = window.ReadyKiddo;
    store.set({ hasCompletedJourney: true });

    // ── World Birth animation ──────────────────────────────────────────────────
    const overlay = mount.querySelector("#world-birth-overlay");
    if (overlay && state.sensoryIntensity !== "low") {
      // Small delay so the route is painted first
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          overlay.classList.add("is-active");
          setTimeout(() => {
            overlay.style.display = "none";
          }, 1700);
        });
      });
    }

    revealWorld(mount, store.get());
  }
};
