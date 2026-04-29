import { transitionView, animateRouteIn } from "./motion.js";

export class Router {
  constructor({ store, routes, mount, afterRender }) {
    this.store = store;
    this.routes = routes;
    this.mount = mount;
    this.afterRender = afterRender;
    this.currentCleanup = [];
    this.current = null;
  }

  start() {
    window.addEventListener("hashchange", () => this.render());
    this.render();
  }

  navigate(path) {
    window.location.hash = path;
  }

  parse() {
    const hash = window.location.hash.replace(/^#/, "") || "/";
    const [pathOnly, query = ""] = hash.split("?");
    const parts = pathOnly.split("/").filter(Boolean);
    return {
      path: pathOnly,
      parts,
      query: new URLSearchParams(query)
    };
  }

  match(parsed) {
    if (parsed.parts.length === 0) return this.routes.landing;
    if (parsed.parts[0] === "comfort") return this.routes.comfort;
    if (parsed.parts[0] === "onboard") return this.routes.onboard;
    if (parsed.parts[0] === "world") return this.routes.world;
    if (parsed.parts[0] === "sector") return this.routes.sector;
    return this.routes.landing;
  }

  async render() {
    const parsed = this.parse();
    const route = this.match(parsed);
    const state = this.store.get();

    for (const cleanup of this.currentCleanup) {
      cleanup();
    }
    this.currentCleanup = [];

    await transitionView(state, () => {
      this.mount.innerHTML = route.render({
        state,
        parsed
      });
      document.documentElement.dataset.route = route.name;
    });

    this.current = route.name;
    const controls = {
      cleanup: fn => this.currentCleanup.push(fn),
      navigate: path => this.navigate(path),
      rerender: () => this.render()
    };

    route.mount?.({
      state: this.store.get(),
      mount: this.mount,
      parsed,
      controls
    });

    await this.afterRender?.(route.name, parsed, this.mount);
    await animateRouteIn(this.mount);

    requestAnimationFrame(() => {
      this.mount.focus({ preventScroll: true });
    });
  }
}
