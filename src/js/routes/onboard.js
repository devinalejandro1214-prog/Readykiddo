import { categories, guides, choiceLabel } from "../data.js";
import { normalizeName } from "../state.js";
import { escapeHtml } from "../interaction-engine.js";

function splitNameLetters(name) {
  return Array.from(name || "friend").map(char => `<span>${escapeHtml(char)}</span>`).join("");
}

function stepIndex(parsed) {
  const raw = Number.parseInt(parsed.parts[1] || "0", 10);
  if (!Number.isFinite(raw)) return 0;
  return Math.min(Math.max(raw, 0), categories.length - 1);
}

/** Render the step ribbon — dot row at the top of each onboard card */
function stepRibbonHTML(current, total) {
  const dots = Array.from({ length: total }, (_, i) => {
    let cls = "step-ribbon-dot";
    if (i < current) cls += " is-done";
    else if (i === current) cls += " is-current";
    return `<span class="${cls}" aria-hidden="true"></span>`;
  }).join("");
  return `<div class="step-ribbon" aria-label="Step ${current + 1} of ${total}">
    ${dots}
    <span class="step-ribbon-label">Step ${current + 1} of ${total}</span>
  </div>`;
}

export const onboardRoute = {
  name: "onboard",
  render({ state, parsed }) {
    const index = stepIndex(parsed);
    const category = categories[index];
    const progress = Math.round(((index + 1) / categories.length) * 100);
    const guide = guides[state.guideStyle] || guides.coach;
    const name = normalizeName(state.name);
    const isName = category.key === "name";
    const isDrag = state.navigationMethod === "drag";
    const isVoice = state.navigationMethod === "voice";
    const isLast = index === categories.length - 1;

    return `
      <section class="route route-grid" aria-labelledby="onboard-title">
        <aside class="side-panel" data-animate>
          <div class="facilitator">
            <div class="buddy-disc" aria-hidden="true"><span class="buddy-face">${escapeHtml(guide.face)}</span></div>
            <div>
              <p class="eyebrow">${escapeHtml(guide.label)}</p>
              <h2>${escapeHtml(index === 0 ? guide.intro(name) : `${name}, keep going.`)}</h2>
              <p>${escapeHtml(guide.step(name, category))}</p>
            </div>
          </div>
          <div class="helper-card">
            ${escapeHtml(category.helper)}
          </div>
          <div class="pill-row">
            <span class="status-pill">Motion: ${choiceLabel("sensoryIntensity", state.sensoryIntensity)}</span>
            <span class="status-pill">Nav: ${choiceLabel("navigationMethod", state.navigationMethod)}</span>
            <span class="status-pill">Music: ${choiceLabel("music", state.music)}</span>
          </div>
        </aside>

        <div class="journey-panel glass-card panel-pad" data-animate>
          ${stepRibbonHTML(index, categories.length)}

          <div class="panel-topline">
            <div>
              <h1 id="onboard-title">${escapeHtml(category.title)}</h1>
            </div>
            <div class="motion-progress" aria-label="World creation progress">
              <span class="progress-track"><span class="progress-fill" style="width:${progress}%"></span></span>
              <strong>${progress}%</strong>
            </div>
          </div>

          <div class="world-timeline" aria-hidden="true">
            <span style="--fill:${progress}%"></span>
          </div>

          ${isName ? `
            <div class="name-seed" data-name-seed>
              <div class="name-seed-orb" aria-hidden="true"></div>
              <div class="name-letters" aria-hidden="true">${splitNameLetters(state.name)}</div>
            </div>
            <div class="name-lane">
              <label for="custom-name">Or type a short name</label>
              <div class="name-row">
                <input id="custom-name" maxlength="16" autocomplete="nickname" placeholder="Your name" value="${escapeHtml(state.name)}" />
                <button class="small-button" type="button" data-action="use-custom-name">Use name</button>
              </div>
            </div>
          ` : ""}

          ${isDrag ? `<div class="drop-zone" data-drop-zone>Drop your favorite choice here</div>` : ""}

          ${isVoice ? `
            <div class="helper-card">
              Voice mode is ready. Tap Listen and say a choice name, or tap any card.
              <button class="small-button" type="button" data-action="listen">Listen</button>
            </div>
          ` : ""}

          <div class="choice-grid" data-choice-grid role="radiogroup" aria-label="${escapeHtml(category.title)}"></div>

          <div class="journey-actions">
            <a class="secondary-cta" href="${index === 0 ? "#/comfort" : `#/onboard/${index - 1}`}">Back</a>
            <button class="secondary-cta" type="button" data-action="reset-path">Reset path</button>
            <button class="primary-cta" data-size="compact" type="button" data-action="advance-step">
              ${isLast ? "Reveal world" : "Next"}
            </button>
          </div>
        </div>
      </section>
    `;
  },

  mount({ mount, parsed, controls }) {
    const { store, interaction, audio, toast, transitionScreen } = window.ReadyKiddo;
    const index = stepIndex(parsed);
    const category = categories[index];
    const isLast = index === categories.length - 1;
    let cleanupBag = [];

    const renderGrid = () => {
      const grid = mount.querySelector("[data-choice-grid]");
      if (!grid) return;

      interaction.renderChoices({
        container: grid,
        category,
        currentValue: store.get()[category.key],
        onChoose: value => {
          store.set({ [category.key]: value });
          toast(`${choiceLabel(category.key, value)} selected.`);
          controls.rerender();
        }
      });

      const selected = grid.querySelector('[aria-checked="true"], [aria-selected="true"]');
      selected?.setAttribute("data-focus-preferred", "true");
    };

    renderGrid();

    if (category.key === "name") {
      window.ReadyKiddo.motionDirector.animateNameSeed(mount);
    }

    const dropZone = mount.querySelector("[data-drop-zone]");
    if (dropZone) {
      interaction.attachDropZone(dropZone, category, value => {
        store.set({ [category.key]: value });
        controls.rerender();
      });
    }

    const listen = mount.querySelector("[data-action='listen']");
    listen?.addEventListener("click", () => interaction.startVoice(category, value => {
      store.set({ [category.key]: value });
      controls.rerender();
    }));

    const custom = mount.querySelector("#custom-name");
    const useCustom = mount.querySelector("[data-action='use-custom-name']");
    const applyName = () => {
      const name = normalizeName(custom?.value);
      store.set({ name });
      toast(`Hello, ${name}.`);
      controls.rerender();
    };

    useCustom?.addEventListener("click", applyName);
    custom?.addEventListener("keydown", event => {
      if (event.key === "Enter") {
        event.preventDefault();
        applyName();
      }
    });

    const reset = mount.querySelector("[data-action='reset-path']");
    reset?.addEventListener("click", () => {
      store.reset();
      toast("Fresh world canvas opened.");
      controls.navigate("#/comfort");
    });

    // ── Advance Step with Transition Screen ──────────────────────────────────
    const advanceBtn = mount.querySelector("[data-action='advance-step']");
    advanceBtn?.addEventListener("click", async () => {
      const state = store.get();
      const value = state[category.key];

      // Find what was chosen
      const chosen = category.choices?.find(c => c.value === value);
      const glyph = chosen?.glyph ?? "✓";
      const label = chosen?.label ?? choiceLabel(category.key, value);

      if (transitionScreen && value) {
        await transitionScreen.show({
          glyph,
          label,
          stepIndex: index,
          totalSteps: categories.length,
          guideStyle: state.guideStyle || "coach",
          sensory: state.sensoryIntensity || "gentle",
          palette: state.colorPalette
        });
      }

      if (isLast) {
        controls.navigate("#/world");
      } else {
        controls.navigate(`#/onboard/${index + 1}`);
      }
    });

    interaction.attachTilt(category, store.get()[category.key], value => {
      store.set({ [category.key]: value });
      audio.tone("choice");
      controls.rerender();
    }, cleanupBag);

    controls.cleanup(() => {
      for (const cleanup of cleanupBag) cleanup();
    });
  }
};
