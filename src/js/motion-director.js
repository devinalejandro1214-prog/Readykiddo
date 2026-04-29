import { allowsMotion } from "./motion.js";

const routeSequence = ["landing", "comfort", "onboard", "world", "sector"];

export class MotionDirector {
  constructor(store) {
    this.store = store;
    this.previousRoute = "landing";
    this.bridge = document.querySelector("#motion-bridge");
    this.lastName = store.get().name;
  }

  routeIndex(routeName) {
    return routeSequence.indexOf(routeName) >= 0 ? routeSequence.indexOf(routeName) : 0;
  }

  setBridge(routeName) {
    if (!this.bridge) return;

    const show = routeName === "comfort" || routeName === "onboard" || routeName === "world";
    this.bridge.hidden = !show;

    const active = Math.min(3, Math.max(0, this.routeIndex(routeName)));
    this.bridge.querySelectorAll("span").forEach((node, index) => {
      node.classList.toggle("is-active", index <= active);
    });
  }

  async afterRoute(routeName, mount) {
    const state = this.store.get();
    this.setBridge(routeName);

    if (!allowsMotion(state)) {
      this.previousRoute = routeName;
      return;
    }

    const direction = this.routeIndex(routeName) >= this.routeIndex(this.previousRoute) ? 1 : -1;
    await this.choreographShell(mount, direction);
    this.previousRoute = routeName;
  }

  async choreographShell(mount, direction = 1) {
    const items = mount.querySelectorAll("[data-animate]");
    const animations = Array.from(items).slice(0, 18).map((item, index) => {
      const distance = 18 + Math.min(index, 5) * 2;
      return item.animate(
        [
          {
            opacity: 0,
            transform: `translate3d(${direction * 8}px, ${distance}px, 0) scale(.985)`,
            filter: "blur(10px)"
          },
          {
            opacity: 1,
            transform: "translate3d(0, 0, 0) scale(1)",
            filter: "blur(0)"
          }
        ],
        {
          duration: 560,
          delay: Math.min(index * 36, 260),
          easing: "cubic-bezier(.22, 1, .36, 1)",
          fill: "both"
        }
      ).finished.catch(() => undefined);
    });

    await Promise.all(animations);
  }

  animateNameSeed(scope) {
    const state = this.store.get();
    if (!allowsMotion(state)) return;

    const letters = scope.querySelectorAll(".name-letters span");
    letters.forEach((letter, index) => {
      letter.animate(
        [
          { opacity: 0, transform: "translateY(20px) rotate(-7deg) scale(.86)" },
          { opacity: 1, transform: "translateY(0) rotate(0deg) scale(1)" }
        ],
        {
          duration: 520,
          delay: index * 45,
          easing: "cubic-bezier(.18,.89,.32,1.28)",
          fill: "both"
        }
      );
    });

    const orb = scope.querySelector(".name-seed-orb");
    orb?.animate(
      [
        { transform: "scale(.88)", filter: "blur(10px)", opacity: .2 },
        { transform: "scale(1)", filter: "blur(0)", opacity: 1 }
      ],
      {
        duration: 720,
        easing: "cubic-bezier(.22, 1, .36, 1)",
        fill: "both"
      }
    );
  }

  animateSectorComplete(card) {
    const state = this.store.get();
    if (!allowsMotion(state) || !card) return;

    card.animate(
      [
        { transform: "scale(1)", filter: "brightness(1)" },
        { transform: "scale(1.025)", filter: "brightness(1.08)" },
        { transform: "scale(1)", filter: "brightness(1)" }
      ],
      {
        duration: 520,
        easing: "cubic-bezier(.18,.89,.32,1.28)"
      }
    );
  }

  touchRipple(event) {
    const card = event.target.closest?.(".choice-card");
    if (!card) return;
    const rect = card.getBoundingClientRect();
    card.style.setProperty("--touch-x", `${event.clientX - rect.left}px`);
    card.style.setProperty("--touch-y", `${event.clientY - rect.top}px`);
  }
}
