export function allowsMotion(state) {
  return state.sensoryIntensity !== "low" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export async function transitionView(state, updateDom) {
  if (!allowsMotion(state)) {
    updateDom();
    return;
  }

  document.body.classList.add("is-transitioning");

  try {
    if (document.startViewTransition) {
      const transition = document.startViewTransition(() => {
        updateDom();
      });
      await transition.finished;
    } else {
      updateDom();
      await animateRouteIn();
    }
  } finally {
    document.body.classList.remove("is-transitioning");
  }
}

export async function animateRouteIn(scope = document) {
  const state = window.ReadyKiddo?.store?.get?.() || { sensoryIntensity: "gentle" };

  if (!allowsMotion(state)) return;

  const items = scope.querySelectorAll?.("[data-animate]") || [];

  const animations = Array.from(items).map((element, index) => {
    const delay = Math.min(index * 42, 220);
    return element.animate(
      [
        { opacity: 0, transform: "translateY(18px) scale(.985)", filter: "blur(8px)" },
        { opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0)" }
      ],
      {
        duration: 520,
        delay,
        easing: "cubic-bezier(.22, 1, .36, 1)",
        fill: "both"
      }
    ).finished.catch(() => undefined);
  });

  await Promise.all(animations);
}

export function pulse(element, state) {
  if (!element || !allowsMotion(state)) return;

  element.animate(
    [
      { transform: "scale(1)" },
      { transform: "scale(1.035)" },
      { transform: "scale(1)" }
    ],
    {
      duration: 360,
      easing: "cubic-bezier(.18,.89,.32,1.28)"
    }
  );
}

export function animateChoiceChange(element, state) {
  if (!element || !allowsMotion(state)) return;

  element.animate(
    [
      { transform: "translateY(0) scale(1)" },
      { transform: "translateY(-5px) scale(1.018)" },
      { transform: "translateY(0) scale(1)" }
    ],
    {
      duration: 420,
      easing: "cubic-bezier(.22, 1, .36, 1)"
    }
  );
}

export function revealWorld(scope, state) {
  if (!scope || !allowsMotion(state)) return;

  const nodes = scope.querySelectorAll(".sector-node, .reward-tile, .profile-hero, .world-orb");
  nodes.forEach((node, index) => {
    node.animate(
      [
        { opacity: 0, transform: "translateY(22px) scale(.96)", filter: "blur(12px)" },
        { opacity: 1, transform: "translateY(0) scale(1)", filter: "blur(0)" }
      ],
      {
        duration: 680,
        delay: index * 70,
        easing: "cubic-bezier(.22, 1, .36, 1)",
        fill: "both"
      }
    );
  });
}
