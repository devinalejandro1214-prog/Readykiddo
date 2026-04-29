import { Store } from "./state.js";
import { ThemeOrchestrator } from "./theme-orchestrator.js";
import { AudioEngine } from "./audio-engine.js";
import { Router } from "./router.js";
import { InteractionEngine } from "./interaction-engine.js";
import { sectors } from "./data.js";
import { MotionDirector } from "./motion-director.js";
import { TransitionScreen } from "./transition-screen.js";

import { landingRoute } from "./routes/landing.js";
import { comfortRoute } from "./routes/comfort.js";
import { onboardRoute } from "./routes/onboard.js";
import { worldRoute } from "./routes/world.js";
import { sectorRoute } from "./routes/sector.js";

const mount = document.querySelector("#app");
const toastNode = document.querySelector("#toast");
const dock = document.querySelector("#world-dock");

const store = new Store();
const theme = new ThemeOrchestrator(store);
const audio = new AudioEngine(store);
const motionDirector = new MotionDirector(store);
const transitionScreen = new TransitionScreen();

let toastTimer = null;

function toast(message) {
  toastNode.hidden = false;
  toastNode.textContent = message;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastNode.hidden = true;
  }, store.get().sensoryIntensity === "low" ? 1300 : 2400);
}

const interaction = new InteractionEngine({ store, audio, toast });

window.ReadyKiddo = {
  store,
  theme,
  audio,
  interaction,
  motionDirector,
  transitionScreen,
  toast
};

const router = new Router({
  store,
  mount,
  routes: {
    landing: landingRoute,
    comfort: comfortRoute,
    onboard: onboardRoute,
    world: worldRoute,
    sector: sectorRoute
  },
  async afterRender(routeName, parsed, mount) {
    renderDock(routeName, parsed);
    await motionDirector.afterRoute(routeName, mount);
  }
});

function renderDock(routeName, parsed) {
  const showDock = routeName === "world" || routeName === "sector";

  dock.hidden = !showDock;
  if (!showDock) {
    dock.innerHTML = "";
    return;
  }

  const activeId = routeName === "sector" ? parsed.parts[1] : "world";
  dock.innerHTML = `
    <a href="#/world" class="${activeId === "world" ? "is-active" : ""}">World</a>
    ${sectors.map(sector => `
      <a href="#/sector/${sector.id}" class="${activeId === sector.id ? "is-active" : ""}">
        ${sector.title.replace("Learning ", "").replace(" Studio", "")}
      </a>
    `).join("")}
  `;
}

document.addEventListener("pointerdown", event => {
  motionDirector.touchRipple(event);
});

document.addEventListener("click", event => {
  const action = event.target.closest("[data-action]")?.dataset.action;

  if (!action) return;

  if (action === "toggle-audio") {
    const ok = audio.toggle();
    toast(ok ? (store.get().audioEnabled ? "Sound cues on." : "Sound cues off.") : "Sound is not available here.");
  }

  if (action === "safe-mode") {
    theme.safeMode();
    toast("Calm mode is on.");
  }
});

window.addEventListener("keydown", event => {
  if (event.key === "Escape") {
    theme.safeMode();
    toast("Calm mode is on.");
  }
});

store.subscribe(state => {
  if (state.audioEnabled) {
    audio.ensure();
  }
});

router.start();
