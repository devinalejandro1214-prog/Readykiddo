# ReadyKiddo Landing Page Motion Rules v1

## Document Purpose

This document defines the motion language for the ReadyKiddo landing page MVP.

Motion should support the emotional story of the landing page. It should make the world feel gently alive without making the experience feel cheap, loud, distracting, or overly game-like.

This document should be read with:

- `01-production-spec-v1.md`
- `02-layer-system-v1.md`
- `03-responsive-rules-v1.md`

---

## Motion Philosophy

ReadyKiddo motion should feel:

- Gentle
- Warm
- Ambient
- Premium
- Slow
- Purposeful
- Human
- Storybook-like

Motion should not feel:

- Bouncy
- Loud
- Chaotic
- Toy-like
- Arcade-like
- Reward-screen-like
- Overly animated
- Distracting

The guiding rule:

> Motion should be felt more than noticed.

If a user immediately notices the animation before they feel the scene, the motion is too strong.

---

## MVP Motion Goal

The MVP landing page should use subtle ambient motion only.

The page should feel like a calm world beginning to wake up.

Approved MVP motion categories:

1. Soft cloud drift
2. Subtle horizon glow breathing
3. Gentle floating of select learning objects
4. Tiny sparkle shimmer
5. Soft fade-in for logo and copy
6. Extremely subtle parent-child idle presence

No interaction animation is required yet because the CTA is reserved but hidden in Phase 1.

---

## Motion Intensity Scale

Use this internal scale when judging animation strength.

| Level | Description | MVP Use |
|---:|---|---|
| 0 | No motion | Stable terrain and background objects |
| 1 | Barely perceptible | Sky atmosphere, figures, glow |
| 2 | Gentle ambient | Clouds, learning objects |
| 3 | Noticeable but calm | Future CTA glow only |
| 4 | Playful animation | Not for MVP landing |
| 5 | High-energy animation | Forbidden for MVP landing |

MVP target range:

```text
Level 0 to Level 2
```

Future CTA may reach Level 3, but only after the visual foundation is approved.

---

## Approved Motion Timing

### Ambient Motion

Ambient motion should be slow.

Recommended duration range:

```text
6s to 30s
```

Use longer cycles for background elements and shorter cycles for small sparkles.

### Fade-In Motion

UI fade-in should be calm and quick enough not to delay comprehension.

Recommended duration range:

```text
600ms to 1200ms
```

### Easing

Preferred easing:

```css
ease-in-out
```

or a gentle custom cubic-bezier:

```css
cubic-bezier(0.22, 1, 0.36, 1)
```

Avoid springy, elastic, or bounce easing in the MVP landing page.

---

## Global Motion Rules

### Allowed

- Slow drifting
- Subtle opacity breathing
- Tiny scale breathing
- Gentle vertical floating
- Soft fade-in
- Slight glow pulse
- Varied delays between similar elements

### Forbidden

- Bounce effects
- Logo wobble
- Fast twinkle
- Confetti
- Fireworks
- Spinning objects
- Typewriter text
- Walking figures
- Jumpy parallax
- Hard slide-in animations
- Button pulse in Phase 1
- Cartoon pop effects

---

# Layer Motion Rules

---

## Layer 1: Sky Base + Atmosphere

| Rule | Value |
|---|---|
| Motion level | 0 to 1 |
| MVP motion | None or barely visible exposure shift |
| Duration | 12s to 24s if used |
| Priority | Stable |

### Approved Behavior

The sky should remain mostly stable. It may have a barely perceptible atmospheric warmth shift if needed, but this is optional.

### Avoid

- Visible gradient movement
- Color cycling
- Fast brightness shifts
- Noisy texture movement

---

## Layer 2: Sun / Horizon Glow

| Rule | Value |
|---|---|
| Motion level | 1 |
| MVP motion | Soft breathing glow |
| Duration | 8s to 14s |
| Priority | High |

### Approved Behavior

The horizon glow may slowly breathe in opacity and scale. The motion should be so subtle that it feels like warmth, not animation.

### Suggested CSS Concept

```css
@keyframes horizonGlow {
  from { opacity: 0.86; transform: scale(1); }
  to { opacity: 1; transform: scale(1.025); }
}
```

### Avoid

- Flicker
- Sharp rays
- Expanding portal effect
- Moving sun position
- Dramatic pulsing

---

## Layer 3: Clouds

| Rule | Value |
|---|---|
| Motion level | 2 |
| MVP motion | Slow horizontal drift |
| Duration | 18s to 30s |
| Priority | High |

### Approved Behavior

Clouds should drift slowly and independently. The left and right clusters should not move at the same exact speed.

### Suggested Motion

- Left cloud: slow drift right
- Right cloud: slow drift left
- Optional faint cloud: slower drift with lower opacity

### Suggested CSS Concept

```css
@keyframes cloudDriftLeft {
  from { transform: translateX(-10px); }
  to { transform: translateX(22px); }
}
```

### Avoid

- Fast movement
- Vertical bobbing
- Loop jumps
- Symmetrical movement
- Moving through headline area

---

## Layer 4: Far Mountains

| Rule | Value |
|---|---|
| Motion level | 0 |
| MVP motion | None |
| Duration | N/A |
| Priority | Stable |

### Approved Behavior

Far mountains should remain still.

### Future Behavior

They may later participate in very small parallax during the world-entry transition.

### Avoid

- Independent movement
- Floating mountains
- Opacity pulsing

---

## Layer 5: Mid Mountains / Rolling Hills

| Rule | Value |
|---|---|
| Motion level | 0 |
| MVP motion | None |
| Duration | N/A |
| Priority | Stable |

### Approved Behavior

Mid hills should remain still.

### Future Behavior

They may later scale or parallax slightly during the path transition.

### Avoid

- Waving hills
- Rolling movement
- Independent parallax in static MVP

---

## Layer 6: Front Ground Plane

| Rule | Value |
|---|---|
| Motion level | 0 |
| MVP motion | None |
| Duration | N/A |
| Priority | Stable |

### Approved Behavior

The front ground should remain stable and grounded.

### Future Behavior

During the future entry transition, it may slide downward or scale out as the camera moves forward.

### Avoid

- Ground sway
- Pulsing terrain
- Moving flowers or details in MVP

---

## Layer 7: Main Path

| Rule | Value |
|---|---|
| Motion level | 0 to 1 |
| MVP motion | None or barely visible warmth |
| Duration | 8s to 14s if used |
| Priority | Critical |

### Approved Behavior

The path should remain stable in Phase 1. It may receive subtle warmth from the path highlight layer.

### Future Behavior

The path will become the main transition mechanism later.

Potential future transition:

1. CTA activates
2. Path highlight expands
3. Camera appears to move forward
4. Horizon glow grows
5. World-building first step appears

### Avoid

- Moving road effect
- Stripes or dashed lines moving
- Strong shimmer
- Arcade-like glow

---

## Layer 8: Path Highlight / Texture / Shadow

| Rule | Value |
|---|---|
| Motion level | 1 |
| MVP motion | Optional soft warmth pulse |
| Duration | 7s to 12s |
| Priority | Medium-high |

### Approved Behavior

The path highlight can gently breathe in opacity. Texture marks should stay still.

### Suggested CSS Concept

```css
@keyframes pathWarmth {
  from { opacity: 0.34; }
  to { opacity: 0.62; }
}
```

### Avoid

- Shiny road animation
- Moving texture marks
- Sparkly trail effect
- High-contrast glow

---

## Layer 9: Parent + Child

| Rule | Value |
|---|---|
| Motion level | 0 to 1 |
| MVP motion | Extremely subtle idle presence |
| Duration | 4.5s to 7s |
| Priority | Critical |

### Approved Behavior

The figures may have a tiny breathing movement, no more than a few pixels. The hand-hold must stay clear.

### Suggested CSS Concept

```css
@keyframes figurePresence {
  from { transform: translateY(0); }
  to { transform: translateY(-3px); }
}
```

### Avoid

- Walking animation
- Waving
- Bouncing
- Arm movement
- Anything that makes figures mascot-like

---

## Layer 10: Letter A Cluster

| Rule | Value |
|---|---|
| Motion level | 2 |
| MVP motion | Gentle float and tiny rotation |
| Duration | 6s to 9s |
| Priority | Medium |

### Approved Behavior

The Letter A cluster can float very gently. Rotation should be under 2 degrees.

### Suggested CSS Concept

```css
@keyframes softFloat {
  from { transform: translateY(0) rotate(-1deg); }
  to { transform: translateY(-12px) rotate(1deg); }
}
```

### Avoid

- Bouncing
- Spinning
- Pop-in effects
- Button hover behavior

---

## Layer 11: Number Block Cluster

| Rule | Value |
|---|---|
| Motion level | 1 to 2 |
| MVP motion | Slow heavier float |
| Duration | 7s to 10s |
| Priority | Medium |

### Approved Behavior

The number block cluster may float more subtly than the Letter A cluster. It should feel slightly heavier.

### Avoid

- Toy-block bouncing
- Stacking animation
- Rotation beyond 1.5 degrees
- Attention-grabbing motion

---

## Layer 12: Shape Cluster

| Rule | Value |
|---|---|
| Motion level | 0 |
| MVP motion | None |
| Duration | N/A |
| Priority | Stable |

### Approved Behavior

The shape cluster should remain grounded.

### Future Behavior

A very tiny glow may be added later if needed, but no independent movement.

### Avoid

- Floating shapes
- Rotating pieces
- Game-piece animation
- Button-like movement

---

## Layer 13: Open Book

| Rule | Value |
|---|---|
| Motion level | 1 to 2 |
| MVP motion | Gentle float and center glow |
| Duration | 7s to 11s |
| Priority | Medium |

### Approved Behavior

The book can float slightly and its center glow may breathe gently.

### Suggested Motion

- Book float: slow and low amplitude
- Center glow: opacity pulse
- Optional nearby sparkles: shimmer only

### Avoid

- Page flipping
- Bouncing book
- Sparkle explosion
- Readable text movement
- Dramatic magic effect

---

## Layer 14: Small Learning Landmark

| Rule | Value |
|---|---|
| Motion level | 0 |
| MVP motion | None |
| Duration | N/A |
| Priority | Stable |

### Approved Behavior

The landmark should remain still and distant.

### Avoid

- Floating castle effect
- Shimmering destination
- Flag waving in MVP
- Landmark becoming a focal animation

---

## Layer 15: Foreground Plants Left

| Rule | Value |
|---|---|
| Motion level | 0 |
| MVP motion | None |
| Duration | N/A |
| Priority | Stable |

### Approved Behavior

The left plants remain still in MVP.

### Future Behavior

They may later parallax during scene transition.

### Avoid

- Leaf waving
- Grass sway
- Jitter
- Overlapping center with motion

---

## Layer 16: Foreground Plants Right

| Rule | Value |
|---|---|
| Motion level | 0 |
| MVP motion | None |
| Duration | N/A |
| Priority | Stable |

### Approved Behavior

The right plants remain still in MVP.

### Future Behavior

They may later parallax during scene transition.

### Avoid

- Mirrored movement from left plants
- Leaf waving
- Heavy foreground motion

---

## Layer 17: Sparkles / Magic Accents

| Rule | Value |
|---|---|
| Motion level | 1 to 2 |
| MVP motion | Slow shimmer and tiny scale breathing |
| Duration | 4s to 8s |
| Priority | Medium |

### Approved Behavior

Sparkles should shimmer gently with varied delays. They should not all animate at the same time.

### Suggested CSS Concept

```css
@keyframes sparkleShimmer {
  from { opacity: 0.22; transform: scale(0.94); }
  to { opacity: 0.62; transform: scale(1.06); }
}
```

### Avoid

- Fast twinkle
- Confetti motion
- Rainbow glitter
- Spinning stars
- Sparkles behind headline

---

## Layer 18: Logo Placement

| Rule | Value |
|---|---|
| Motion level | 0 to 1 |
| MVP motion | Soft fade-in only |
| Duration | 700ms to 1000ms |
| Priority | Critical |

### Approved Behavior

The logo may fade in gently when the page loads.

### Avoid

- Bounce
- Wobble
- Slide-in from edge
- Logo shimmer
- Playful mascot motion

---

## Layer 19: Headline

| Rule | Value |
|---|---|
| Motion level | 1 |
| MVP motion | Soft fade-in with tiny upward settle |
| Duration | 800ms to 1200ms |
| Priority | Critical |

### Approved Behavior

The headline can fade in after or with the logo. Any movement should be very small.

### Suggested CSS Concept

```css
@keyframes copyReveal {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

### Avoid

- Typewriter effect
- Word-by-word reveal
- Bounce
- Letter stagger
- Fast slide-in

---

## Layer 20: Subheadline

| Rule | Value |
|---|---|
| Motion level | 1 |
| MVP motion | Soft delayed fade-in |
| Duration | 800ms to 1200ms |
| Priority | Critical |

### Approved Behavior

The subheadline should fade in calmly after the headline or with a slight delay.

### Avoid

- Long delayed appearance
- Slide from side
- Typewriter effect
- Opacity flicker

---

## Layer 21: Future CTA Zone

| Rule | Value |
|---|---|
| MVP status | Hidden |
| Future motion | Soft glow and fade-in |
| Future duration | 700ms to 1200ms |
| Priority | Future |

### Approved Future Behavior

When introduced, the CTA should feel like a path invitation. It may have a soft glow pulse, but it should not feel like a generic pulsing button.

### Future Click Transition Concept

1. CTA glow brightens
2. Path highlight expands forward
3. Foreground plants subtly parallax outward
4. Camera moves toward horizon
5. Parent-child scene transitions into the first world-building moment

### Avoid

- Generic button bounce
- Urgent pulse
- Sales-style animation
- Covering parent-child figures

---

# Page Load Sequence

Recommended MVP page load sequence:

1. Scene appears immediately or with very soft fade
2. Logo fades in
3. Headline fades in
4. Subheadline fades in
5. Ambient motion continues quietly

Suggested timing:

| Element | Delay | Duration |
|---|---:|---:|
| Scene | 0ms | 500ms |
| Logo | 100ms | 800ms |
| Headline | 220ms | 900ms |
| Subheadline | 360ms | 900ms |
| Ambient motion | immediate | continuous |

No loading spinner is needed for the MVP unless assets become heavy later.

---

# Reduced Motion Rules

The landing page must support reduced motion.

Use:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation: none !important;
    transition: none !important;
  }
}
```

When reduced motion is enabled:

- Cloud drift stops
- Glow pulse stops
- Floating objects stop
- Sparkles stop animating
- Text appears without movement
- Layout remains visually complete

Reduced motion should not remove important visual layers. It should only remove movement.

---

# Performance Rules

Motion should be GPU-friendly where possible.

Prefer animating:

- `transform`
- `opacity`

Avoid animating:

- `width`
- `height`
- `top`
- `left`
- heavy filters
- layout-affecting properties

SVG filters should be used carefully. Too many animated filters may hurt mobile performance.

---

# Motion QA Checklist

Before approving the MVP landing motion, confirm:

- Motion does not distract from the headline
- Motion does not distract from the parent-child figures
- The world feels alive but calm
- Nothing bounces unless explicitly approved later
- Sparkles are subtle and not confetti-like
- Clouds drift slowly and smoothly
- Reduced motion works
- Mobile performance remains smooth
- No animation causes layout shift
- No animation loops with visible jumps

---

# Acceptance Criteria

Motion is approved when:

- The page feels gently alive
- The experience remains calm and premium
- The central story remains dominant
- Animations are subtle across desktop, tablet, and mobile
- Reduced-motion users receive a stable page
- No movement feels cheap, childish, or distracting

---

# Next Documentation Step

Create:

`05-asset-inventory-v1.md`

That document should define every asset or SVG group needed for the MVP hero, including file names, formats, transparency, status, and production notes.
