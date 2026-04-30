# ReadyKiddo Landing Page Production Spec v1

## Document Purpose

This document is the source of truth for the first ReadyKiddo landing page rebuild.

The goal is to build the MVP landing page with discipline, not speed. This document captures the approved direction for the visual experience, emotional intent, layer system, responsiveness, and early production rules before the page is rebuilt.

This spec should guide design, asset creation, coding, motion, testing, and future iteration.

---

## Product Context

ReadyKiddo is a parent-child learning experience designed to bridge the gap between what a child learns in school and how a parent stays connected at home.

The landing page should not feel like a generic education website, app dashboard, or menu of activities. It should feel like the beginning of a shared learning journey.

The core idea is:

> A parent and child build a learning world together.

The landing page should visually express that idea before the user clicks anything.

---

## MVP Landing Page Goal

The MVP landing page should create a professional, warm, storybook-like first impression.

It should communicate:

- Parent-child connection
- Early learning
- Shared discovery
- A world that can grow
- A calm, trustworthy experience
- A journey that begins at home

The user should feel that ReadyKiddo is not simply another learning game. It is a world that helps the parent remain part of the child’s learning experience.

---

## Approved Hero Message

### Headline

**Build a learning world together.**

### Subheadline

**A parent-child experience that turns early skills into a world you build together.**

### Future CTA Copy

The CTA is reserved for a later phase and should not be visible in the purely visual MVP pass.

Approved future CTA:

**Start the journey**

---

## Emotional Direction

The page should feel:

- Warm
- Safe
- Hopeful
- Premium
- Gentle
- Human
- Storybook-like
- School-friendly
- Parent-friendly
- Child-friendly

The page should not feel:

- Blocky
- Generic
- Cheap
- Loud
- Overly cartoonish
- Like a dashboard
- Like a streaming app
- Like a game menu
- Like a worksheet
- Like a standard SaaS homepage

---

## Visual Direction

The hero should feel like the user is standing at the beginning of a learning world.

The scene should include:

- A soft sunrise atmosphere
- A warm horizon glow
- Gentle clouds
- Far mountains
- Rolling hills
- A foreground ground plane
- A golden curved path
- Parent and child silhouettes
- Early learning objects
- Subtle foreground plants
- Gentle sparkles
- Centered ReadyKiddo branding
- Real HTML headline and subheadline

The visual structure should support the story:

1. The logo establishes brand trust.
2. The headline states the promise.
3. The path creates direction.
4. The parent and child create emotion.
5. The horizon creates hope.
6. The learning objects communicate early education.

---

## Approved Layer List

The landing page will be built as a layered hero system.

### Environment Layers

1. Sky base and atmosphere
2. Sun / horizon glow
3. Clouds
4. Far mountains
5. Mid mountains / rolling hills
6. Front ground plane

### Journey Layers

7. Main path
8. Path highlight / texture / shadow

### Human Story Layer

9. Parent + child

### Learning Object Layers

10. Letter A cluster
11. Number block cluster
12. Shape cluster
13. Open book
14. Small learning landmark

### Foreground Framing Layers

15. Foreground plants left
16. Foreground plants right
17. Sparkles / magic accents

### UI Layers

18. Logo placement
19. Headline
20. Subheadline
21. Future CTA zone

---

## Layer Direction Summary

### Layer 1: Sky Base + Atmosphere

Soft cream upper sky, warm golden middle, luminous pale horizon. The sky must create warmth, safety, and openness. The headline area must remain clean and readable.

### Layer 2: Sun / Horizon Glow

A soft sunrise glow aligned with the end of the path. The glow should create hope and forward pull without becoming a harsh sunburst or dramatic effect.

### Layer 3: Clouds

Two soft, low-contrast cloud clusters. Clouds should frame the scene and add calm motion without crowding the headline.

### Layer 4: Far Mountains

Soft distant warm mountains with low contrast. They should make the world feel larger without competing with the horizon glow.

### Layer 5: Mid Hills

Two to three soft rolling hill bands in warm honey/apricot tones. They should frame the path and create a safe, reachable world.

### Layer 6: Front Ground Plane

A warm foreground terrain band that anchors the path and parent-child figures. It should feel like the starting point of the journey.

### Layer 7: Main Path

A wide-to-narrow golden curved path with an organic S-curve. It should connect the foreground to the horizon and become the future transition mechanism.

### Layer 8: Path Highlight / Texture / Shadow

Soft center highlight, warm edge shadow, subtle texture marks, and a gentle fade into the horizon glow. This prevents the path from feeling flat.

### Layer 9: Parent + Child

Simple, refined navy silhouettes with a clear hand-hold. They should be lower-center, grounded, universal, and emotionally readable.

### Layer 10: Letter A Cluster

A left-side floating cream medallion with a large navy A, small orange accents, soft shadow, and gentle float motion.

### Layer 11: Number Block Cluster

A right-side rounded number block cluster, led by a cream block with an orange 1. It should feel playful but not like cheap toy clipart.

### Layer 12: Shape Cluster

A small grounded lower-left shape cluster using circle, triangle, and rounded square forms in the ReadyKiddo palette.

### Layer 13: Open Book

A mid-right floating storybook with warm cream pages, navy/orange cover accents, a soft center glow, and restrained sparkles.

### Layer 14: Small Learning Landmark

A tiny distant learning landmark near the horizon. It should suggest a destination without looking like a literal school or fantasy castle centerpiece.

### Layer 15: Foreground Plants Left

Bottom-left SVG foliage group with rounded navy/slate leaves, cream/orange flower accents, and soft warmth.

### Layer 16: Foreground Plants Right

Bottom-right SVG foliage group, related to the left but not mirrored. It should be slightly taller and airier.

### Layer 17: Sparkles / Magic Accents

Very subtle warm SVG sparkles near the glow, book, Letter A, and path. They should shimmer gently without feeling like confetti.

### Layer 18: Logo Placement

Top-center ReadyKiddo logo in a soft translucent cream pill. SVG preferred. Safe-area aware on mobile. No playful bounce.

### Layer 19: Headline

Real HTML text. Large rounded navy display type. Centered in the clean sky zone. Soft fade-in only.

### Layer 20: Subheadline

Real HTML text. Muted slate color, medium-bold, centered, comfortable line height, responsive width.

### Layer 21: Future CTA Zone

Reserved but hidden for Phase 1. Future CTA should be path-anchored and feel like an invitation, not a generic website button.

---

## Z-Index / Stacking Direction

Recommended stacking order from back to front:

1. Sky base
2. Sun / horizon glow
3. Clouds
4. Far mountains
5. Learning landmark
6. Mid hills
7. Front ground plane
8. Main path
9. Path highlight / texture / shadow
10. Learning objects
11. Parent + child
12. Foreground plants
13. Sparkles / magic accents
14. Logo
15. Headline
16. Subheadline
17. Future CTA

The center story must remain protected. The path, parent-child figures, and horizon glow should never be visually buried by decorative layers.

---

## Asset Format Strategy

Preferred MVP approach:

- SVG for most structured illustrated layers
- Real HTML for headline, subheadline, and future CTA
- SVG logo for brand clarity
- Transparent WebP may be used later for painterly replacements

Recommended asset principles:

- Keep art layers editable when possible
- Avoid baking text into images
- Keep logo independent from the hero artwork
- Use SVG for scalable illustrated objects
- Use reduced opacity and soft filters for depth
- Avoid large unoptimized image files in the MVP

---

## Responsive Requirements

The landing page must support:

- Desktop browsers
- Tablet browsers
- Mobile browsers
- iOS Safari viewport behavior
- Android browser viewport behavior

Use viewport-safe sizing where appropriate:

- `100svh` for mobile-friendly viewport height
- `env(safe-area-inset-top)` for top spacing
- `clamp()` for responsive typography
- breakpoint-specific art scaling and cropping

### Desktop Priority

Desktop should show the full storybook landscape with generous horizontal space.

Priority elements visible:

1. Logo
2. Headline and subheadline
3. Path
4. Parent + child
5. Horizon glow
6. Learning objects
7. Foreground framing

### Tablet Priority

Tablet should preserve the central story while allowing side art to crop slightly.

Priority elements visible:

1. Logo
2. Headline and subheadline
3. Path
4. Parent + child
5. Horizon glow
6. Major learning objects

### Mobile Priority

Mobile should protect the emotional center.

Priority elements visible:

1. Logo
2. Headline
3. Subheadline
4. Path
5. Parent + child
6. Horizon glow

Mobile may reduce, crop, or hide:

- Some side learning objects
- Foreground plants
- Small landmark
- Excess sparkles

Mobile must never crop out:

- The parent-child relationship
- The path direction
- The headline
- The main brand identity

---

## Motion Rules

Motion should feel calm, premium, and ambient.

Allowed MVP motion:

- Slow cloud drift
- Soft horizon glow breathing
- Gentle floating of select learning objects
- Subtle sparkle shimmer
- Soft fade-in for logo and text

Forbidden MVP motion:

- Bouncing buttons
- Fast sparkles
- Confetti
- Wobbling logo
- Cartoon pop effects
- Overactive parallax
- Typewriter text
- Walking animation for figures

Motion should be felt more than noticed.

Reduced motion must be supported with `prefers-reduced-motion`.

---

## MVP Scope

The MVP landing hero should include:

- Fully responsive hero scene
- Approved headline and subheadline
- Centered ReadyKiddo logo treatment
- Approved layer direction
- Light ambient motion
- Clean desktop/tablet/mobile behavior

The MVP landing hero should not include yet:

- Visible CTA button
- Login/signup
- Full onboarding
- Game logic
- Parent dashboard
- School dashboard
- Data reporting
- AI explanation
- Heavy animation transition

The first objective is visual trust and emotional clarity.

---

## Definition of Done

The MVP landing page is ready when:

- It feels warm, premium, and storybook-like
- The parent-child journey is instantly understood
- The path leads the eye toward the horizon
- The page works cleanly on desktop, tablet, and mobile
- The artwork feels intentional, not blocky or generic
- The logo, headline, and subheadline are sharp and readable
- The page does not feel like a dashboard, worksheet, or generic app
- The motion is subtle and not distracting
- The mobile layout preserves the central emotional story

---

## Current Build Priority

Next documentation step:

Create `02-layer-system-v1.md` to expand each approved layer into a detailed production table with:

- Layer name
- Purpose
- Visual role
- Format
- Transparency
- Z-index
- Desktop behavior
- Tablet behavior
- Mobile behavior
- Motion behavior
- MVP priority
- Approval status

After that, create the responsive and asset inventory documents before rebuilding the final hero system.
