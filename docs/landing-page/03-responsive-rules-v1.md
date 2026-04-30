# ReadyKiddo Landing Page Responsive Rules v1

## Document Purpose

This document defines how the ReadyKiddo landing page must behave across desktop, tablet, and mobile browsers.

The landing page is a layered story scene, not a standard web layout. Responsive behavior must protect the emotional center of the page while allowing decorative layers to crop, reduce, or hide as needed.

This document should be read with:

- `01-production-spec-v1.md`
- `02-layer-system-v1.md`

---

## Responsive Philosophy

The ReadyKiddo landing page must feel intentionally composed on every screen size.

The goal is not to show every layer on every device.

The goal is to preserve the story:

> A parent and child begin a shared learning journey through a world they build together.

On smaller screens, the design should simplify without feeling broken.

---

## Protected Center Story

The following elements are protected across all breakpoints:

1. ReadyKiddo logo
2. Headline
3. Subheadline
4. Main path
5. Parent + child silhouettes
6. Horizon glow

These elements must remain visible, readable, and emotionally clear.

If the layout becomes crowded, reduce or crop secondary elements first.

---

## Cropping Priority

When space is limited, crop or reduce layers in this order:

1. Sparkles / magic accents
2. Shape cluster
3. Small learning landmark
4. Foreground plants left/right
5. Number block cluster
6. Open book
7. Letter A cluster
8. Clouds
9. Side hills / side mountains

Never crop out:

- Headline
- Subheadline
- Logo
- Parent-child hand-hold
- Main path direction
- Horizon glow connection

---

## Breakpoint Strategy

Use three primary responsive bands:

| Range | Target | Role |
|---|---|---|
| 1200px and up | Desktop | Full cinematic composition |
| 761px to 1199px | Tablet | Balanced cropped composition |
| 760px and below | Mobile | Protected emotional story |

Additional micro-breakpoints should be used for:

- narrow phones under 420px
- short desktop screens under 700px height
- mobile browser safe areas

---

## Recommended Technical Rules

Use modern responsive CSS patterns:

```css
height: 100svh;
min-height: 640px;
font-size: clamp(...);
top: max(22px, env(safe-area-inset-top));
```

Use:

- `100svh` for mobile viewport stability
- `env(safe-area-inset-top)` for safe top spacing
- `clamp()` for typography and layout scaling
- SVG `preserveAspectRatio="xMidYMid slice"` for scene crops
- breakpoint-specific art scaling
- reduced-motion media query

Avoid:

- fixed pixel-only layout
- relying only on `100vh` for mobile
- text baked into artwork
- one crop for all devices
- side elements that cannot be hidden

---

# Desktop Rules

## Target Screens

Desktop testing should include:

| Size | Purpose |
|---|---|
| 1440 x 900 | Primary design target |
| 1536 x 864 | Common laptop screen |
| 1920 x 1080 | Large desktop |
| 1366 x 768 | Smaller laptop |

## Desktop Goal

Desktop should feel cinematic, wide, warm, and complete.

It should show the full storybook scene with strong horizontal breathing room.

## Desktop Must Preserve

- Full centered logo
- Large headline
- Comfortable subheadline
- Visible horizon glow
- Full path direction
- Parent + child grounded lower-center
- Learning objects on both sides
- Foreground framing plants

## Desktop Composition

### Logo

- Top-center
- Soft translucent cream pill
- Approximate width: 190px to 240px total visual width
- Safe breathing room above and below

### Headline

- Centered in upper sky zone
- Large, cinematic, and readable
- Should likely resolve into two lines

Preferred desktop line feel:

```text
Build a learning world
together.
```

or

```text
Build a learning
world together.
```

### Subheadline

- Centered under headline
- Max width: 620px to 700px
- Clear but not dominant

### Illustration

- Full landscape visible
- Side learning objects visible
- Foreground plants visible
- Path begins broad at lower center and tapers to glow

## Desktop Art Scaling

Desktop should use a full-width composition with minimal crop.

Recommended behavior:

```css
.journey-art {
  width: 100%;
  height: 100%;
}
```

For very wide screens, slight scale-up is acceptable if it improves composition.

## Desktop Avoid

- Logo too close to headline
- Headline crowding horizon
- Parent/child too small to feel emotional
- Path too narrow
- Decorative side objects becoming focal points

---

# Tablet Rules

## Target Screens

Tablet testing should include:

| Size | Purpose |
|---|---|
| 768 x 1024 | iPad portrait |
| 820 x 1180 | modern tablet portrait |
| 1024 x 1366 | iPad Pro portrait |
| 1024 x 768 | tablet landscape |

## Tablet Goal

Tablet should feel like a slightly cropped version of the desktop scene, not a broken desktop page.

The central story should remain strong.

## Tablet Must Preserve

- Centered logo
- Headline and subheadline readability
- Path-to-horizon connection
- Parent + child figures
- Horizon glow
- At least one or two visible learning-world cues

## Tablet Composition

### Logo

- Slightly smaller than desktop
- Still centered
- Still safe-area aware

### Headline

- Large but controlled
- Should not crowd the logo
- Should not overlap the illustration focal point

### Subheadline

- Max width: 540px to 620px
- Comfortable line height

### Illustration

- Slight side crop allowed
- Center path and figures preserved
- Side objects may shift outward
- Foreground plants may crop lightly

## Tablet Art Scaling

Recommended behavior:

```css
.journey-art {
  width: 125% to 135%;
  left: -12.5% to -17.5%;
}
```

This allows the central story to feel larger without losing composition.

## Tablet Avoid

- Side objects crowding headline
- Figures becoming too small
- Path becoming visually disconnected from glow
- Cropping the horizon glow too tightly
- Too much foreground density

---

# Mobile Rules

## Target Screens

Mobile testing should include:

| Size | Purpose |
|---|---|
| 390 x 844 | iPhone common target |
| 393 x 852 | Android/iPhone target |
| 430 x 932 | larger phone |
| 360 x 800 | narrow Android |
| 375 x 667 | short phone / older iPhone |

## Mobile Goal

Mobile should feel intimate and focused.

It does not need to show the full world. It must show the beginning of the journey clearly.

## Mobile Must Preserve

- Logo visible and sharp
- Headline readable
- Subheadline readable
- Path centered
- Parent + child visible
- Hand-hold visible
- Horizon glow visible

## Mobile Composition

### Logo

- Compact
- Top-center
- Safe-area aware
- No overlap with headline

Approximate total visual width:

```text
145px to 175px
```

### Headline

Mobile headline should likely be two or three lines.

Acceptable mobile line feel:

```text
Build a
learning world
together.
```

or

```text
Build a learning
world together.
```

The headline must feel intentional, not crushed.

### Subheadline

Use a narrow readable width:

```text
330px to 370px maximum
```

If the screen is narrow, reduce line length before making text too small.

### Illustration

Mobile should crop the side world and focus on:

- path
- figures
- horizon glow
- enough learning-world detail to feel rich

Side elements may be partially cropped or hidden.

## Mobile Art Scaling

Recommended behavior:

```css
.journey-art {
  width: 180% to 210%;
  left: -40% to -55%;
  top: 6% to 12%;
}
```

This keeps the center story large enough to read emotionally.

## Mobile Safe Areas

Mobile should account for browser and device UI.

Use:

```css
top: max(18px, env(safe-area-inset-top));
height: 100svh;
```

Avoid placing critical content too close to:

- top notch area
- bottom browser controls
- bottom home indicator

## Mobile Decorative Reduction

On mobile, reduce or hide:

- Excess sparkles
- Small landmark
- Shape cluster
- Foreground plants
- Some right-side learning objects

Preserve:

- parent-child figures
- path
- glow
- main message

## Mobile Avoid

- Text overlapping art
- Figures hidden below fold
- Path too wide or too cropped
- Side decorations cluttering center
- Logo crowding headline
- Overly small headline
- Browser chrome cutting off bottom story

---

# Short Screen Rules

Some devices have limited height, especially laptop browsers and older phones.

For screens under 700px height:

- Reduce vertical spacing between logo and headline
- Slightly reduce headline size
- Reduce subheadline top margin
- Shift art slightly downward only if figures remain visible
- Avoid hiding headline or subheadline

Recommended rule:

```css
@media (max-height: 700px) and (min-width: 761px) {
  /* compact vertical layout */
}
```

Short screens should still feel composed, not squeezed.

---

# Orientation Rules

## Portrait

Portrait layout should prioritize vertical hierarchy:

1. Logo
2. Headline
3. Subheadline
4. Path and figures
5. Horizon glow

## Landscape Mobile

Landscape mobile may be cramped vertically.

Rules:

- Keep logo compact
- Reduce headline scale
- Reduce subheadline if necessary
- Preserve path and figures if possible
- Consider hiding low-priority decorative objects

---

# Typography Rules

## Font Direction

Approved direction:

- Headline: rounded display font
- Subheadline: rounded readable sans-serif
- Logo: SVG wordmark or brand treatment

Current approved font direction:

- `Outfit` for headline / logo wordmark
- `Nunito` for supporting text

## Headline Scaling

Use `clamp()`.

Recommended desktop-to-mobile range:

```css
font-size: clamp(2.34rem, 13.2vw, 6.75rem);
```

The actual values may be tuned by breakpoint.

## Subheadline Scaling

Use `clamp()`.

Recommended range:

```css
font-size: clamp(0.96rem, 1.8vw, 1.36rem);
```

## Text Rules

- Text must remain real HTML
- Text must not be baked into the art
- Maintain contrast against sky
- Keep line height comfortable
- Avoid ultra-thin type
- Avoid all caps

---

# Layer-Specific Responsive Rules

## Environment Layers

Sky and glow must scale smoothly across all devices.

- Sky protects the copy zone
- Glow stays connected to path endpoint
- Clouds reduce on mobile
- Mountains and hills crop from sides before center

## Path Layers

The path must remain centered and emotionally readable.

- Desktop: broad and cinematic
- Tablet: centered and still tapered
- Mobile: enlarged enough to feel like the viewer stands at the start

## Parent + Child

This layer is protected.

- Hand-hold must remain visible
- Contact shadow must remain visible
- Figures must not be cropped by bottom browser UI
- Figures may scale up slightly on tablet/mobile

## Learning Objects

Learning objects are secondary.

- Desktop: visible and balanced
- Tablet: reduce or shift outward
- Mobile: crop, reduce, or hide if needed

## Foreground Plants

Foreground plants are framing elements.

- Desktop: visible and rich
- Tablet: partially cropped
- Mobile: heavily cropped or simplified

## Sparkles

Sparkles should reduce with screen size.

- Desktop: 8 to 14
- Tablet: 6 to 10
- Mobile: 4 to 7

---

# Responsive Testing Checklist

For each tested screen size, confirm:

- Logo is sharp and centered
- Headline is readable
- Subheadline is readable
- Text does not overlap busy art
- Path leads toward horizon glow
- Parent + child are visible
- Hand-hold is clear
- Figures feel grounded
- Side objects do not crowd center
- Mobile bottom UI does not cut off key elements
- Motion is subtle
- Reduced motion works

---

# Acceptance Criteria

The responsive system is approved when:

- Desktop feels cinematic and polished
- Tablet feels intentionally cropped, not broken
- Mobile preserves the emotional story
- The headline and subheadline remain readable everywhere
- The parent-child relationship is never lost
- The path remains connected to the horizon glow
- Decorative layers simplify gracefully
- No breakpoint feels like an afterthought

---

# Next Documentation Step

Create:

`04-motion-rules-v1.md`

That document should define approved motion timing, allowed animations, forbidden animations, reduced-motion behavior, and future transition rules.
