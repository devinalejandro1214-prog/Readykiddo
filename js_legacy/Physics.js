/**
 * Physics.js — Animation constants, spring-damping, and kinetic parallax.
 * Exposes constants as CSS variables injected onto document.body.
 */

export const VIBE_PRESETS = {
  calm: {
    speed:          '1.5s',
    easing:         'ease-in-out',
    particle_density: 'low',
    blur:           '20px',
    env_speed:      '25s',
    tilt_max:       8,
    spring_stiffness: 0.04,
    spring_damping:   0.8,
    parallax_depth:   0.015,
    hue_rotate:     false,
  },
  balanced: {
    speed:          '0.8s',
    easing:         'cubic-bezier(0.25, 1, 0.5, 1)',
    particle_density: 'mid',
    blur:           '12px',
    env_speed:      '15s',
    tilt_max:       15,
    spring_stiffness: 0.08,
    spring_damping:   0.75,
    parallax_depth:   0.03,
    hue_rotate:     true,
  },
  active: {
    speed:          '0.3s',
    easing:         'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
    particle_density: 'high',
    blur:           '6px',
    env_speed:      '6s',
    tilt_max:       22,
    spring_stiffness: 0.15,
    spring_damping:   0.65,
    parallax_depth:   0.06,
    hue_rotate:     true,
  },
};

/**
 * Apply vibe physics constants as CSS custom properties on document.body.
 * @param {string} vibe - 'calm'|'balanced'|'active'
 */
export function applyVibe(vibe) {
  const preset = VIBE_PRESETS[vibe] || VIBE_PRESETS.balanced;
  const root = document.documentElement;
  root.style.setProperty('--speed',       preset.speed);
  root.style.setProperty('--easing',      preset.easing);
  root.style.setProperty('--blur',        preset.blur);
  root.style.setProperty('--env-speed',   preset.env_speed);
  document.body.dataset.vibe = vibe;
}

/**
 * Spring physics interpolation — smooth elastic follow.
 * @param {number} current - Current value
 * @param {number} target  - Target value
 * @param {number} velocity - Current velocity (pass by ref object)
 * @param {string} vibe
 * @returns {{ value: number, velocity: number }}
 */
export function springStep(current, target, velocity, vibe = 'balanced') {
  const { spring_stiffness: k, spring_damping: d } = VIBE_PRESETS[vibe] || VIBE_PRESETS.balanced;
  const force = (target - current) * k;
  const newVelocity = (velocity + force) * d;
  return {
    value: current + newVelocity,
    velocity: newVelocity,
  };
}

/**
 * Kinetic parallax — maps mouse position to a layered offset.
 * @param {MouseEvent} e
 * @param {number} layer  - Depth layer (1=foreground, 3=background)
 * @param {string} vibe
 * @returns {{ x: number, y: number }}
 */
export function getParallaxOffset(e, layer, vibe = 'balanced') {
  const { parallax_depth } = VIBE_PRESETS[vibe] || VIBE_PRESETS.balanced;
  const cx = window.innerWidth / 2;
  const cy = window.innerHeight / 2;
  const dx = (e.clientX - cx) * parallax_depth * layer;
  const dy = (e.clientY - cy) * parallax_depth * layer;
  return { x: dx, y: dy };
}

/**
 * Magnetic button pull — returns transform offset toward cursor.
 * @param {MouseEvent} e
 * @param {DOMRect} rect - Bounding rect of the magnetic element
 * @param {number} strength - Pull strength (default 0.35)
 */
export function getMagneticPull(e, rect, strength = 0.35) {
  const cx = rect.left + rect.width / 2;
  const cy = rect.top  + rect.height / 2;
  return {
    x: (e.clientX - cx) * strength,
    y: (e.clientY - cy) * strength,
  };
}
