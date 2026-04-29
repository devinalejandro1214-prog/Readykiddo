import { categories, comfortKeys, guides, choiceLabel } from "../data.js";
import { escapeHtml } from "../interaction-engine.js";

export const comfortRoute = {
  name: "comfort",
  render({ state }) {
    const cards = comfortKeys.map(key => {
      const category = categories.find(item => item.key === key);
      const current = category.choices.find(choice => choice.value === state[key]);
      return `
        <article class="glass-card panel-pad" data-comfort="${category.key}" data-animate>
          <p class="eyebrow">${escapeHtml(category.title)}</p>
          <h2>${escapeHtml(current.label)}</h2>
          <p>${escapeHtml(category.helper)}</p>
          <div class="choice-grid" data-choice-grid="${category.key}" role="radiogroup" aria-label="${escapeHtml(category.title)}"></div>
        </article>
      `;
    }).join("");

    const guide = guides[state.guideStyle] || guides.coach;

    return `
      <section class="route route-grid" aria-labelledby="comfort-title">
        <aside class="side-panel" data-animate>
          <div class="facilitator">
            <div class="buddy-disc" aria-hidden="true"><span class="buddy-face">${escapeHtml(guide.face)}</span></div>
            <div>
              <p class="eyebrow">${escapeHtml(guide.label)}</p>
              <h2>Comfort first.</h2>
              <p>Before the world starts moving, we choose how much motion, sound, and interaction feels right.</p>
            </div>
          </div>
          <div class="helper-card">
            Current setup: ${choiceLabel("sensoryIntensity", state.sensoryIntensity)}, ${choiceLabel("navigationMethod", state.navigationMethod)}, ${choiceLabel("music", state.music)}.
          </div>
        </aside>

        <div class="journey-panel">
          <div class="glass-card panel-pad" data-animate>
            <div class="panel-topline">
              <div>
                <p class="eyebrow">Pre-flight setup</p>
                <h1 id="comfort-title">Make the journey feel right first.</h1>
              </div>
            </div>
          </div>

          ${cards}

          <div class="journey-actions glass-card panel-pad" data-animate>
            <a class="secondary-cta" href="#/">Back home</a>
            <a class="primary-cta" href="#/onboard/0">Start the 10-step world journey</a>
          </div>
        </div>
      </section>
    `;
  },

  mount({ mount, controls }) {
    const { store, interaction, toast } = window.ReadyKiddo;

    for (const key of comfortKeys) {
      const category = categories.find(item => item.key === key);
      const grid = mount.querySelector(`[data-choice-grid="${key}"]`);
      if (!grid) continue;

      interaction.renderChoices({
        container: grid,
        category,
        currentValue: store.get()[key],
        onChoose: value => {
          store.set({ [key]: value, hasCompletedComfort: true });
          toast(`${category.title}: ${choiceLabel(key, value)}.`);
          controls.rerender();
        }
      });
    }
  }
};
