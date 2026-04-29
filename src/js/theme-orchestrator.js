import { sensoryProfiles } from "./data.js";

export class ThemeOrchestrator {
  constructor(store) {
    this.store = store;
    this.unsubscribe = store.subscribe(state => this.apply(state));
  }

  apply(state) {
    const root = document.documentElement;
    root.dataset.sensory = state.sensoryIntensity;
    root.dataset.nav = state.navigationMethod;
    root.dataset.palette = state.colorPalette;
    root.dataset.vibe = state.vibe;
    root.dataset.music = state.music;
    root.dataset.interest = state.interestStyle;

    const sensory = sensoryProfiles[state.sensoryIntensity] || sensoryProfiles.gentle;
    root.style.setProperty("--sound-level", sensory.volume);

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
      meta.setAttribute("content", this.themeColorFor(state.colorPalette));
    }

    document.querySelectorAll("[data-audio-label]").forEach(label => {
      label.textContent = state.audioEnabled ? "Sound cues on" : "Sound cues";
    });

    document.querySelectorAll("[data-action='toggle-audio']").forEach(button => {
      button.setAttribute("aria-pressed", String(state.audioEnabled));
    });
  }

  themeColorFor(palette) {
    return {
      pastel: "#7C6CFF",
      "high-contrast": "#FFE95F",
      earth: "#6D8F55",
      neon: "#FB4DFF",
      deep: "#5AA9FF"
    }[palette] || "#7C6CFF";
  }

  safeMode() {
    this.store.set({
      sensoryIntensity: "low",
      navigationMethod: "buttons",
      music: "nature",
      colorPalette: "pastel",
      vibe: "cozy"
    });
  }
}
