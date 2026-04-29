import { sectors, guides, choiceLabel } from "../data.js";
import { normalizeName } from "../state.js";
import { escapeHtml } from "../interaction-engine.js";

export const sectorRoute = {
  name: "sector",
  render({ state, parsed }) {
    const id = parsed.parts[1] || "stream";
    const sector = sectors.find(item => item.id === id) || sectors[0];
    const name = normalizeName(state.name);
    const guide = guides[state.guideStyle] || guides.coach;

    const activities = {
      stream: [
        ["Episode Flow", "Lessons are sequenced into short, sensory-aware chapters."],
        ["Pause Bridge", "The child can rest without losing progress."],
        ["Responsive Hints", "The Facilitator Buddy reduces language when the child hesitates."]
      ],
      create: [
        ["World Pieces", "Completed tasks add visible pieces to the world."],
        ["Tactile Studio", "Large targets, soft shadows, and motion trails support exploration."],
        ["Builder Memory", "Creations stay aligned to the child’s profile."]
      ],
      calm: [
        ["Quiet Reset", "Low-motion breathing and focus activities."],
        ["Soft Sounds", "Music cues are reduced and predictable."],
        ["Safe Return", "The child returns to the same place after regulation."]
      ],
      quest: [
        ["Micro Missions", "Short objectives with one clear success state."],
        ["Victory Loop", `${choiceLabel("victoryStyle", state.victoryStyle)} rewards close each quest.`],
        ["Navigation Sync", `${choiceLabel("navigationMethod", state.navigationMethod)} controls stay active here.`]
      ]
    }[sector.id];

    return `
      <section class="route sector-detail motion-stage" aria-labelledby="sector-title">
        <aside class="sector-art glass-card panel-pad" data-animate>
          <span class="lesson-pill">${choiceLabel("interestStyle", state.interestStyle)} sector</span>
          <div class="world-orb" aria-hidden="true">
            <span class="orb-glow"></span>
            <span class="orb-core"></span>
            <span class="orb-ring"></span>
            <span class="orb-pin"></span>
            <span class="orb-pin"></span>
            <span class="orb-pin"></span>
          </div>
          <div class="orbit-menu" aria-hidden="true"><span>1</span><span>2</span><span>3</span><span>4</span></div>
          <div class="facilitator">
            <div class="buddy-disc" aria-hidden="true"><span class="buddy-face">${escapeHtml(guide.face)}</span></div>
            <div>
              <p class="eyebrow">${escapeHtml(guide.label)}</p>
              <h2>${escapeHtml(name)}, this sector is tuned.</h2>
              <p>${escapeHtml(sector.detail)}</p>
            </div>
          </div>
        </aside>

        <div class="journey-panel glass-card panel-pad" data-animate>
          <div class="panel-topline">
            <div>
              <p class="eyebrow">World sector</p>
              <h1 id="sector-title">${escapeHtml(sector.title)}</h1>
            </div>
          </div>

          <div class="pill-row">
            <span class="status-pill">Sensory: ${choiceLabel("sensoryIntensity", state.sensoryIntensity)}</span>
            <span class="status-pill">Vibe: ${choiceLabel("vibe", state.vibe)}</span>
            <span class="status-pill">Music: ${choiceLabel("music", state.music)}</span>
            <span class="status-pill">Nav: ${choiceLabel("navigationMethod", state.navigationMethod)}</span>
          </div>

          <div class="activity-stack">
            ${activities.map(([title, body]) => `
              <article class="activity-card" data-animate data-complete="false">
                <h3>${escapeHtml(title)}</h3>
                <p>${escapeHtml(body)}</p>
              </article>
            `).join("")}
          </div>

          <div class="sector-actions">
            <a class="secondary-cta" href="#/world">Back to world</a>
            <button class="primary-cta" data-size="compact" type="button" data-action="sector-win">Complete tiny win</button>
          </div>
        </div>
      </section>
    `;
  },

  mount({ mount }) {
    const { audio, toast, store } = window.ReadyKiddo;
    const button = mount.querySelector("[data-action='sector-win']");
    button?.addEventListener("click", () => {
      const nextCard = Array.from(mount.querySelectorAll(".activity-card")).find(card => card.dataset.complete === "false");
      if (nextCard) {
        nextCard.dataset.complete = "true";
        window.ReadyKiddo.motionDirector.animateSectorComplete(nextCard);
      }
      audio.tone("confirm");
      toast(`${choiceLabel("victoryStyle", store.get().victoryStyle)} reward added.`);
    });
  }
};
