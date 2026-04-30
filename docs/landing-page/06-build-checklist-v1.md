# ReadyKiddo Landing Page Build Checklist v1

## Document Purpose

This document turns the approved ReadyKiddo landing page documentation into a practical build checklist.

Use this file when rebuilding the MVP landing page so each step is intentional, testable, and aligned with the approved production direction.

This document should be read with:

- `01-production-spec-v1.md`
- `02-layer-system-v1.md`
- `03-responsive-rules-v1.md`
- `04-motion-rules-v1.md`
- `05-asset-inventory-v1.md`

---

## Build Philosophy

The ReadyKiddo landing page should be built slowly and deliberately.

Do not rush to add interaction.
Do not rush to add a CTA.
Do not rush to add extra sections.

The first priority is the hero scene.

The MVP hero is successful only when it clearly communicates:

> A parent and child begin a shared learning journey through a world they build together.

---

## Build Phases

The build should happen in phases:

1. Repository and file setup
2. Base HTML structure
3. Core visual scene
4. Human story layer
5. Learning object layers
6. Foreground polish
7. Logo and copy
8. Responsive tuning
9. Motion tuning
10. Accessibility and performance pass
11. QA review
12. MVP approval

Each phase should be completed and reviewed before moving too far ahead.

---

# Phase 1: Repository and File Setup

## Goal

Prepare the repo for a clean, disciplined landing page build.

## Checklist

- [ ] Confirm `index.html` exists
- [ ] Confirm `styles.css` exists
- [ ] Confirm documentation exists under `docs/landing-page/`
- [ ] Create `assets/` folder if needed
- [ ] Create `assets/brand/` folder if needed
- [ ] Create `assets/landing/` folder if needed
- [ ] Create `assets/landing/svg/` folder if needed
- [ ] Create `assets/landing/webp/` folder if needed
- [ ] Keep current build simple until layer system is stable

## Notes

During early iteration, inline SVG is acceptable. Once assets stabilize, reusable layers should be extracted into organized asset files.

---

# Phase 2: Base HTML Structure

## Goal

Create the semantic page structure that will hold the layered scene and real text content.

## Checklist

- [ ] Add `<main>` wrapper for the landing page
- [ ] Add brand/logo container
- [ ] Add hero copy section
- [ ] Add headline as real HTML text
- [ ] Add subheadline as real HTML text
- [ ] Add world-stage container
- [ ] Add layered SVG or layer containers
- [ ] Keep CTA hidden for Phase 1
- [ ] Add proper page title
- [ ] Add meta description
- [ ] Add viewport tag with `viewport-fit=cover`

## Required Copy

Headline:

```text
Build a learning world together.
```

Subheadline:

```text
A parent-child experience that turns early skills into a world you build together.
```

Future CTA, hidden in Phase 1:

```text
Start the journey
```

## Acceptance Check

The page structure should make sense even before visual styling is complete.

---

# Phase 3: Core Visual Scene

## Goal

Build the emotional foundation of the hero scene before adding secondary details.

## Layers Included

- Layer 1: Sky base
- Layer 2: Sun / horizon glow
- Layer 3: Clouds
- Layer 4: Far mountains
- Layer 5: Mid hills
- Layer 6: Front ground plane
- Layer 7: Main path
- Layer 8: Path polish

## Checklist

### Sky and Glow

- [ ] Add soft cream/gold sky base
- [ ] Preserve clean copy zone
- [ ] Add horizon glow aligned with path endpoint
- [ ] Keep glow soft and non-dramatic
- [ ] Avoid harsh sun rays

### Clouds

- [ ] Add left cloud cluster
- [ ] Add right cloud cluster
- [ ] Keep clouds away from headline
- [ ] Use warm ivory tones
- [ ] Keep contrast low

### Mountains and Hills

- [ ] Add far mountain back layer
- [ ] Add far mountain front layer
- [ ] Preserve central valley/opening
- [ ] Add mid hill layers
- [ ] Keep terrain warm and soft
- [ ] Avoid flat wave shapes

### Front Ground

- [ ] Add warm foreground plane
- [ ] Create organic curved top edge
- [ ] Leave center path space clean
- [ ] Support future foreground plants

### Path

- [ ] Add main golden path
- [ ] Make path wide at bottom
- [ ] Taper path toward horizon glow
- [ ] Use soft S-curve
- [ ] Add center highlight
- [ ] Add edge shadow
- [ ] Add subtle texture marks
- [ ] Keep path future-transition-ready

## Acceptance Check

Before adding figures or learning objects, the scene should already feel warm, dimensional, and purposeful.

---

# Phase 4: Human Story Layer

## Goal

Add the emotional center of the product: parent and child together.

## Layers Included

- Layer 9: Parent + child

## Checklist

- [ ] Create refined navy parent silhouette
- [ ] Create refined navy child silhouette
- [ ] Show clear hand-hold
- [ ] Place figures lower center
- [ ] Align figures with beginning of path
- [ ] Add soft contact shadow
- [ ] Keep figures universal
- [ ] Avoid facial details
- [ ] Avoid blocky or icon-like bodies
- [ ] Confirm figures are visible on mobile

## Acceptance Check

The parent-child bond should be instantly readable without any explanation.

---

# Phase 5: Learning Object Layers

## Goal

Add early learning cues without making the page feel like a worksheet or app menu.

## Layers Included

- Layer 10: Letter A cluster
- Layer 11: Number block cluster
- Layer 12: Shape cluster
- Layer 13: Open book
- Layer 14: Small learning landmark

## Checklist

### Letter A Cluster

- [ ] Add left-side floating medallion
- [ ] Use warm cream base
- [ ] Use navy letter A
- [ ] Add small orange accents
- [ ] Add soft warm shadow
- [ ] Keep it secondary

### Number Block Cluster

- [ ] Add right-side rounded block cluster
- [ ] Use cream main block
- [ ] Use orange number 1
- [ ] Add smaller support block
- [ ] Add soft tan shading
- [ ] Avoid cheap toy-block look

### Shape Cluster

- [ ] Add lower-left grounded shape group
- [ ] Include circle
- [ ] Include triangle
- [ ] Include rounded square
- [ ] Use orange/navy/slate palette
- [ ] Keep shapes away from center path

### Open Book

- [ ] Add mid-right floating book
- [ ] Use warm cream pages
- [ ] Use navy/orange accents
- [ ] Add soft center glow
- [ ] Avoid readable page text
- [ ] Keep book magical but restrained

### Small Learning Landmark

- [ ] Add tiny distant landmark
- [ ] Place near horizon glow
- [ ] Use cream/orange/navy tones
- [ ] Keep contrast low
- [ ] Avoid literal school signage
- [ ] Hide or reduce on mobile if needed

## Acceptance Check

The scene should clearly suggest early learning while still feeling like a storybook world.

---

# Phase 6: Foreground Polish

## Goal

Add depth, framing, and subtle wonder without cluttering the scene.

## Layers Included

- Layer 15: Foreground plants left
- Layer 16: Foreground plants right
- Layer 17: Sparkles / magic accents

## Checklist

### Foreground Plants Left

- [ ] Add bottom-left foliage group
- [ ] Use rounded navy/slate leaves
- [ ] Add small cream/orange accents
- [ ] Keep it away from path center
- [ ] Crop safely on mobile

### Foreground Plants Right

- [ ] Add bottom-right foliage group
- [ ] Make it related to left side
- [ ] Do not mirror left side exactly
- [ ] Keep it slightly taller and airier
- [ ] Avoid crowding right learning objects

### Sparkles

- [ ] Add warm subtle sparkles near glow
- [ ] Add restrained sparkles near book
- [ ] Add restrained sparkles near Letter A
- [ ] Add one to three subtle path accents
- [ ] Keep sparkles away from headline
- [ ] Reduce quantity on mobile

## Acceptance Check

The page should feel more polished and alive, not busier.

---

# Phase 7: Logo and Copy

## Goal

Place the ReadyKiddo brand and approved copy with clarity, warmth, and trust.

## Layers Included

- Layer 18: Logo placement
- Layer 19: Headline
- Layer 20: Subheadline
- Layer 21: Future CTA zone

## Checklist

### Logo

- [ ] Add top-center logo
- [ ] Use SVG or inline SVG
- [ ] Use translucent cream pill
- [ ] Keep Ready in navy
- [ ] Keep Kiddo in orange
- [ ] Respect mobile safe area
- [ ] Avoid navbar treatment

### Headline

- [ ] Use approved headline copy
- [ ] Use real HTML text
- [ ] Use deep navy
- [ ] Use large rounded display type
- [ ] Tune desktop line breaks
- [ ] Tune mobile line breaks
- [ ] Keep copy zone clean

### Subheadline

- [ ] Use approved subheadline copy
- [ ] Use real HTML text
- [ ] Use muted slate color
- [ ] Use readable weight
- [ ] Use comfortable line height
- [ ] Keep max width responsive

### Future CTA

- [ ] Keep hidden in Phase 1
- [ ] Reserve future interaction zone
- [ ] Do not add visible button until hero feels strong

## Acceptance Check

The brand and message should feel polished, readable, and emotionally aligned.

---

# Phase 8: Responsive Tuning

## Goal

Make the landing page feel intentionally composed across desktop, tablet, and mobile.

## Desktop Checklist

- [ ] Test at 1440 x 900
- [ ] Test at 1536 x 864
- [ ] Test at 1920 x 1080
- [ ] Test at 1366 x 768
- [ ] Confirm full scene feels cinematic
- [ ] Confirm path leads to glow
- [ ] Confirm figures are emotionally readable
- [ ] Confirm side objects do not dominate

## Tablet Checklist

- [ ] Test at 768 x 1024
- [ ] Test at 820 x 1180
- [ ] Test at 1024 x 1366
- [ ] Test at 1024 x 768
- [ ] Confirm center story is preserved
- [ ] Confirm side crop feels intentional
- [ ] Confirm headline and subheadline do not crowd

## Mobile Checklist

- [ ] Test at 390 x 844
- [ ] Test at 393 x 852
- [ ] Test at 430 x 932
- [ ] Test at 360 x 800
- [ ] Test at 375 x 667
- [ ] Confirm logo is sharp
- [ ] Confirm headline is readable
- [ ] Confirm subheadline is readable
- [ ] Confirm path is centered
- [ ] Confirm parent-child hand-hold is visible
- [ ] Confirm horizon glow is visible
- [ ] Confirm browser UI does not cut off figures

## Responsive CSS Checklist

- [ ] Use `100svh`
- [ ] Use `env(safe-area-inset-top)`
- [ ] Use `clamp()` for typography
- [ ] Use breakpoint-specific scene scaling
- [ ] Use `preserveAspectRatio` intentionally for SVG
- [ ] Reduce decorative layers on mobile

## Acceptance Check

No breakpoint should feel like an afterthought.

---

# Phase 9: Motion Tuning

## Goal

Add subtle ambient motion that makes the page feel alive without feeling childish.

## Checklist

### Ambient Motion

- [ ] Add slow cloud drift
- [ ] Add soft horizon glow breathing
- [ ] Add gentle Letter A float
- [ ] Add subtle number block float
- [ ] Add subtle book float
- [ ] Add sparkle shimmer
- [ ] Add optional tiny figure presence

### UI Motion

- [ ] Add logo fade-in
- [ ] Add headline fade-in
- [ ] Add subheadline fade-in
- [ ] Avoid bounce
- [ ] Avoid typewriter effects
- [ ] Avoid fast slide-ins

### Reduced Motion

- [ ] Add `prefers-reduced-motion` rule
- [ ] Stop ambient animations when reduced motion is active
- [ ] Keep all visual layers present

### Performance

- [ ] Animate only transform and opacity where possible
- [ ] Avoid heavy animated filters
- [ ] Confirm no layout shift
- [ ] Confirm no visible loop jumps

## Acceptance Check

Motion should be felt more than noticed.

---

# Phase 10: Accessibility and Performance Pass

## Goal

Ensure the MVP landing page is accessible, readable, and performant.

## Accessibility Checklist

- [ ] Use semantic `<main>`
- [ ] Use real text for headline
- [ ] Use real text for subheadline
- [ ] Add useful page title
- [ ] Add meta description
- [ ] Use appropriate `aria-label` where needed
- [ ] Treat decorative SVG as hidden when appropriate
- [ ] Ensure color contrast is readable
- [ ] Support reduced motion
- [ ] Ensure future CTA will be keyboard accessible

## Performance Checklist

- [ ] Keep SVG optimized
- [ ] Avoid unnecessary image files
- [ ] Avoid large raster assets unless optimized
- [ ] Use WebP only when needed
- [ ] Minimize heavy filters
- [ ] Avoid layout-shifting animations
- [ ] Verify page loads quickly on mobile

## Acceptance Check

The page should be polished without becoming heavy or fragile.

---

# Phase 11: QA Review

## Goal

Review the page against the approved design intent before calling it MVP-ready.

## Visual QA

- [ ] Does it feel warm?
- [ ] Does it feel premium?
- [ ] Does it feel storybook-like?
- [ ] Does it avoid blocky shapes?
- [ ] Does it avoid generic clipart?
- [ ] Does the path feel meaningful?
- [ ] Does the horizon feel hopeful?
- [ ] Do the parent and child carry emotion?
- [ ] Do the learning objects support the world?
- [ ] Does the logo feel trustworthy?

## Product QA

- [ ] Does the page explain the concept visually?
- [ ] Does it feel parent-child centered?
- [ ] Does it suggest early learning?
- [ ] Does it avoid feeling like homework?
- [ ] Does it avoid feeling like a generic game?
- [ ] Does it feel ready for a future transition?

## Technical QA

- [ ] Desktop works
- [ ] Tablet works
- [ ] Mobile works
- [ ] Short screens work
- [ ] Reduced motion works
- [ ] No critical console errors
- [ ] No broken assets
- [ ] No missing fonts fallback issue
- [ ] Netlify deploys cleanly

---

# Phase 12: MVP Approval

## Goal

Decide whether the landing hero is ready to serve as the visual foundation for the next product phase.

## Approval Criteria

The MVP hero is approved only when:

- [ ] The page feels warm, premium, and storybook-like
- [ ] The parent-child journey is instantly understood
- [ ] The path leads the eye toward the horizon
- [ ] The page works cleanly on desktop, tablet, and mobile
- [ ] The artwork feels intentional, not blocky or generic
- [ ] The logo, headline, and subheadline are sharp and readable
- [ ] The page does not feel like a dashboard, worksheet, or generic app
- [ ] The motion is subtle and not distracting
- [ ] The mobile layout preserves the central emotional story

## Not Approved If

The MVP hero should not be approved if:

- [ ] The figures feel pasted on
- [ ] The path feels like a flat shape
- [ ] The art feels childish or cheap
- [ ] Mobile feels cramped or broken
- [ ] The headline is hard to read
- [ ] Decorative layers compete with the story
- [ ] Motion feels distracting
- [ ] The page feels like a normal SaaS homepage

---

# Build Order Summary

Use this order during production:

1. Base file setup
2. HTML structure
3. Sky and glow
4. Mountains and hills
5. Front ground
6. Path and path polish
7. Parent + child
8. Learning objects
9. Foreground plants
10. Sparkles
11. Logo and copy
12. Responsive tuning
13. Motion tuning
14. Accessibility pass
15. Performance pass
16. QA pass
17. MVP approval

---

# Next Documentation Step

Create:

`07-qa-device-checklist-v1.md`

That document should define the exact device/browser review process before approving the landing page MVP.
