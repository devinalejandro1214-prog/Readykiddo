# ReadyKiddo Landing Page Layer System v1

## Document Purpose

This document expands the approved ReadyKiddo landing page layers into a practical production system.

Use this document when creating assets, building the hero layout, writing CSS, tuning responsive behavior, adding motion, and checking whether the landing page still matches the approved creative direction.

This document should be read with:

- `01-production-spec-v1.md`

---

## Core Layer Principle

The ReadyKiddo hero is not a normal web layout. It is a layered story scene.

Each layer has a specific job. Decorative elements must never weaken the central story:

> A parent and child begin a shared learning journey through a world they build together.

The protected center of the scene is:

- Headline
- Subheadline
- Path
- Parent + child
- Horizon glow

If any layer competes with those elements, that layer should be reduced, moved, cropped, or hidden.

---

## Global Layer Rules

### Art Direction

- Warm sunrise storybook style
- Premium, soft, and intentional
- Brand-owned palette
- No generic clipart
- No blocky CSS shapes
- No dashboard or tile language

### Format Preference

- Use SVG for structured illustration layers
- Use real HTML for text and future CTA
- Use SVG for logo and small symbolic objects
- Use transparent WebP later only when painterly quality is needed

### Mobile Priority

On mobile, preserve the emotional story first:

1. Logo
2. Headline
3. Subheadline
4. Path
5. Parent + child
6. Horizon glow

Side objects and decorative layers may be cropped, reduced, or hidden.

---

## Recommended Z-Index Order

| Stack | Layer | Role |
|---:|---|---|
| 1 | Sky base | Atmosphere |
| 2 | Sun glow | Hope |
| 3 | Clouds | Airiness |
| 4 | Far mountains | Distance |
| 5 | Learning landmark | Destination |
| 6 | Mid hills | Terrain |
| 7 | Front ground | Stage |
| 8 | Main path | Journey |
| 9 | Path polish | Depth |
| 10 | Learning objects | Education |
| 11 | Parent + child | Emotion |
| 12 | Foreground plants | Framing |
| 13 | Sparkles | Wonder |
| 14 | Logo | Brand |
| 15 | Headline | Promise |
| 16 | Subheadline | Clarity |
| 17 | Future CTA | Action |

---

# Layer Details

---

## Layer 1: Sky Base + Atmosphere

| Field | Value |
|---|---|
| Layer name | `layer-01-sky-base` |
| Purpose | Emotional foundation |
| Format | SVG or WebP |
| Transparency | No |
| Motion | None |
| Priority | Critical |
| Status | Approved |

### Visual Role

The sky establishes the emotional tone. It should feel soft, safe, warm, and open.

### Approved Direction

- Soft cream upper sky
- Warm golden middle
- Luminous pale horizon
- Clean copy zone
- Painterly softness
- No visual noise behind text

### Desktop Behavior

The desktop sky should feel wide and calm, with enough open space for the logo and hero copy.

### Tablet Behavior

The tablet sky should preserve the same clean central copy zone, even if side atmosphere is cropped.

### Mobile Behavior

Mobile must protect text readability. The center upper sky should remain clean and bright.

### Avoid

- Flat beige fill
- Harsh orange
- Heavy texture
- Busy clouds behind copy
- Generic gradient feel

---

## Layer 2: Sun / Horizon Glow

| Field | Value |
|---|---|
| Layer name | `layer-02-sun-horizon-glow` |
| Purpose | Hope and direction |
| Format | SVG or WebP |
| Transparency | Yes |
| Motion | Gentle pulse |
| Priority | Critical |
| Status | Approved |

### Visual Role

The glow is the promise ahead. It gives the path a destination and makes the scene feel hopeful.

### Approved Direction

- Soft sunrise bloom
- Warm ivory center
- Pale gold inner glow
- Peach-gold outer haze
- Centered near path endpoint
- No sharp rays

### Desktop Behavior

The glow should be broad and softly visible behind the distant world.

### Tablet Behavior

The glow should remain aligned with the path and central composition.

### Mobile Behavior

The glow can scale slightly larger, but it must not reduce headline readability.

### Avoid

- Hard sun disk
- Neon yellow
- Dramatic portal effect
- Heavy lens flare
- Sharp sunburst rays

---

## Layer 3: Clouds

| Field | Value |
|---|---|
| Layer name | `layer-03-clouds` |
| Purpose | Softness and air |
| Format | SVG or WebP |
| Transparency | Yes |
| Motion | Slow drift |
| Priority | High |
| Status | Approved |

### Visual Role

Clouds add atmosphere and make the sky feel alive without distracting from the copy.

### Approved Direction

- Two cloud clusters
- Warm ivory tone
- Low contrast
- Horizontally stretched forms
- Clean headline zone
- Gentle drift

### Desktop Behavior

Show left and right clusters with enough negative space around the hero copy.

### Tablet Behavior

Clouds may crop slightly, but the copy zone must remain clean.

### Mobile Behavior

Reduce cloud presence. One strong cluster and one faint cluster is enough.

### Avoid

- Bubble clipart
- Symmetrical clouds
- High contrast edges
- Clouds crossing headline text
- Too many cloud groups

---

## Layer 4: Far Mountains

| Field | Value |
|---|---|
| Layer name | `layer-04-far-mountains` |
| Purpose | World depth |
| Format | SVG |
| Transparency | Yes |
| Motion | None |
| Priority | High |
| Status | Approved |

### Visual Role

The far mountains make the world feel larger and give the horizon structure.

### Approved Direction

- Soft distant mountains
- Warm beige and apricot tones
- Low contrast
- Two subtle depth layers
- Center valley aligned with path
- No hard details

### Desktop Behavior

Show the full range with a gentle center opening.

### Tablet Behavior

Allow side cropping while preserving the path-to-glow relationship.

### Mobile Behavior

Mountains should not dominate. Preserve the center valley and glow.

### Avoid

- Sharp alpine peaks
- Dark mountain mass
- Cold gray tones
- Snow caps
- Realistic detail

---

## Layer 5: Mid Mountains / Rolling Hills

| Field | Value |
|---|---|
| Layer name | `layer-05-mid-hills` |
| Purpose | Reachable terrain |
| Format | SVG |
| Transparency | Yes |
| Motion | None |
| Priority | High |
| Status | Approved |

### Visual Role

The mid hills bridge the distant world and the foreground. They make the scene feel safe and approachable.

### Approved Direction

- Two to three hill bands
- Honey and apricot tones
- Soft overlapping slopes
- Center opening for path
- Subtle warm lighting
- No heavy detail

### Desktop Behavior

Full hill layering should frame the path and create depth.

### Tablet Behavior

Hills may crop at the sides but should keep the center open.

### Mobile Behavior

Simplify perceived density. Keep the path and glow readable.

### Avoid

- Flat wave shapes
- Random blobs
- Game platform terrain
- Dark foreground wall
- Busy grass texture

---

## Layer 6: Front Ground Plane

| Field | Value |
|---|---|
| Layer name | `layer-06-front-ground` |
| Purpose | Starting stage |
| Format | SVG |
| Transparency | Yes |
| Motion | None |
| Priority | Critical |
| Status | Approved |

### Visual Role

The front ground is where the journey begins. It anchors the figures and the start of the path.

### Approved Direction

- Warm caramel-gold terrain
- Organic curved top edge
- Slight center opening
- Soft contact shadow support
- Subtle side detail
- No platform look

### Desktop Behavior

The ground should frame the bottom of the full scene and support side foliage.

### Tablet Behavior

Keep the center clean and stable.

### Mobile Behavior

Respect safe areas and avoid crowding the bottom center.

### Avoid

- Flat strip
- Hard platform edge
- Too many flowers
- Strong grass texture
- Center clutter

---

## Layer 7: Main Path

| Field | Value |
|---|---|
| Layer name | `layer-07-path-base` |
| Purpose | Journey metaphor |
| Format | SVG |
| Transparency | Yes |
| Motion | Future zoom |
| Priority | Critical |
| Status | Approved |

### Visual Role

The path is the core product metaphor. It visually connects home, learning, and the world ahead.

### Approved Direction

- Wide-to-narrow golden path
- Soft S-curve
- Organic edges
- Warm orange/gold palette
- Centered to horizon glow
- Future transition-ready

### Desktop Behavior

The path should begin broad and taper elegantly into the horizon.

### Tablet Behavior

Keep the path centered and visible behind the figures.

### Mobile Behavior

The path becomes more central. It must remain emotionally readable.

### Avoid

- Straight road
- Flat orange blob
- Board-game path
- Hard edges
- Perfect symmetry

---

## Layer 8: Path Highlight / Texture / Shadow

| Field | Value |
|---|---|
| Layer name | `layer-08-path-polish` |
| Purpose | Path depth |
| Format | SVG group |
| Transparency | Yes |
| Motion | Optional pulse |
| Priority | Critical |
| Status | Approved |

### Visual Role

This layer makes the path feel embedded, warm, and crafted.

### Approved Direction

- Soft curved center highlight
- Warm left edge shadow
- Subtle right rim light
- Three to six soft marks
- Fade into horizon glow
- No obvious animation yet

### Desktop Behavior

Texture can be slightly more visible because there is enough space.

### Tablet Behavior

Keep texture moderate and avoid noise.

### Mobile Behavior

Reduce texture density. Keep the path clean.

### Avoid

- Road stripe
- Bricks
- Dashes
- Polka dots
- Neon glow

---

## Layer 9: Parent + Child

| Field | Value |
|---|---|
| Layer name | `layer-09-parent-child` |
| Purpose | Emotional core |
| Format | SVG |
| Transparency | Yes |
| Motion | Tiny breathing |
| Priority | Critical |
| Status | Approved |

### Visual Role

The parent and child express the ReadyKiddo mission without explanation.

### Approved Direction

- Refined navy silhouettes
- Clear hand-hold
- Lower-center placement
- Soft contact shadow
- Subtle warm rim light
- No facial detail

### Desktop Behavior

Figures should be modest in size but emotionally clear.

### Tablet Behavior

Figures may scale slightly larger relative to the scene.

### Mobile Behavior

Preserve hand-hold and grounding at all costs.

### Avoid

- Stick figures
- Restroom icons
- Blocky bodies
- Mascot style
- Detailed faces or clothing

---

## Layer 10: Letter A Cluster

| Field | Value |
|---|---|
| Layer name | `layer-10-letter-a-cluster` |
| Purpose | Early literacy |
| Format | SVG |
| Transparency | Yes |
| Motion | Gentle float |
| Priority | Medium |
| Status | Approved |

### Visual Role

The Letter A cluster signals early literacy through wonder, not worksheets.

### Approved Direction

- Left-side floating medallion
- Warm cream base
- Large navy A
- Tiny orange accents
- Soft warm shadow
- Gentle float

### Desktop Behavior

Visible on the left as a balanced learning object.

### Tablet Behavior

Reduce or shift outward if it crowds the scene.

### Mobile Behavior

Reduce, crop, or simplify if needed.

### Avoid

- Flashcard look
- UI tile look
- Loud primary colors
- Random placement
- Competing with figures

---

## Layer 11: Number Block Cluster

| Field | Value |
|---|---|
| Layer name | `layer-11-number-block-cluster` |
| Purpose | Early numeracy |
| Format | SVG |
| Transparency | Yes |
| Motion | Slow float |
| Priority | Medium |
| Status | Approved |

### Visual Role

The number block cluster signals counting and number recognition.

### Approved Direction

- Right-side rounded block cluster
- Main cream block
- Orange number 1
- Smaller support block
- Soft tan shading
- Gentle shadow

### Desktop Behavior

Visible on the right, balancing the Letter A cluster.

### Tablet Behavior

Shift outward and reduce slightly.

### Mobile Behavior

May reduce, crop, or hide before central elements are affected.

### Avoid

- Cheap toy blocks
- Red/yellow/blue palette
- Heavy 3D plastic
- Button-like appearance
- Overcrowding right side

---

## Layer 12: Shape Cluster

| Field | Value |
|---|---|
| Layer name | `layer-12-shape-cluster` |
| Purpose | Shapes and colors |
| Format | SVG |
| Transparency | Yes |
| Motion | None |
| Priority | Low-medium |
| Status | Approved |

### Visual Role

The shape cluster reinforces colors, shapes, and spatial learning.

### Approved Direction

- Lower-left grounded cluster
- Circle, triangle, rounded square
- Orange, navy, slate palette
- Soft shadows
- No independent motion

### Desktop Behavior

Visible as a quiet foreground learning detail.

### Tablet Behavior

Reduce or shift toward the edge.

### Mobile Behavior

Crop or hide if it crowds the path or figures.

### Avoid

- Flat CSS shapes
- Rainbow colors
- UI buttons
- Center clutter
- Worksheet feel

---

## Layer 13: Open Book

| Field | Value |
|---|---|
| Layer name | `layer-13-open-book` |
| Purpose | Story and learning |
| Format | SVG |
| Transparency | Yes |
| Motion | Float + glow |
| Priority | Medium |
| Status | Approved |

### Visual Role

The open book connects learning, imagination, and shared discovery.

### Approved Direction

- Mid-right floating book
- Warm cream pages
- Navy/orange cover accents
- Soft center glow
- Tiny restrained sparkles
- Subtle float

### Desktop Behavior

Visible mid-right without overpowering the scene.

### Tablet Behavior

Reduce slightly and avoid headline crowding.

### Mobile Behavior

May reduce, crop, or hide to protect the central story.

### Avoid

- Textbook look
- Readable page text
- Hard rectangle pages
- Homework feeling
- Excess magic burst

---

## Layer 14: Small Learning Landmark

| Field | Value |
|---|---|
| Layer name | `layer-14-learning-landmark` |
| Purpose | Destination |
| Format | SVG |
| Transparency | Yes |
| Motion | None |
| Priority | Low-medium |
| Status | Approved |

### Visual Role

The landmark gives the path a subtle destination without becoming a focal object.

### Approved Direction

- Tiny learning landmark
- Near horizon
- Slight center-right placement
- Cream body
- Muted orange roof
- Small navy accents
- Low contrast

### Desktop Behavior

Visible as a small discovery near the glow.

### Tablet Behavior

Can remain visible if it does not crowd.

### Mobile Behavior

Optional. Hide if it becomes clutter.

### Avoid

- Literal school building
- Fantasy castle centerpiece
- Many windows
- Signs or text
- Theme-park feel

---

## Layer 15: Foreground Plants Left

| Field | Value |
|---|---|
| Layer name | `layer-15-foreground-plants-left` |
| Purpose | Left framing |
| Format | SVG |
| Transparency | Yes |
| Motion | None |
| Priority | Medium |
| Status | Approved |

### Visual Role

The left plants anchor the foreground and help the viewer feel inside the scene.

### Approved Direction

- Bottom-left foliage group
- Rounded navy/slate leaves
- Small cream/orange accents
- Soft warm shadow
- Croppable on mobile
- No motion for MVP

### Desktop Behavior

Visible and rich enough to frame the left side.

### Tablet Behavior

Slightly cropped at the edge.

### Mobile Behavior

Crop aggressively before crowding the center.

### Avoid

- Bright green grass
- Generic clipart
- Heavy detail
- Center overlap
- Competing with figures

---

## Layer 16: Foreground Plants Right

| Field | Value |
|---|---|
| Layer name | `layer-16-foreground-plants-right` |
| Purpose | Right framing |
| Format | SVG |
| Transparency | Yes |
| Motion | None |
| Priority | Medium |
| Status | Approved |

### Visual Role

The right plants complete the foreground frame without mirroring the left side.

### Approved Direction

- Bottom-right foliage group
- Slightly taller and airier
- Slate/navy leaves
- Small warm accents
- Not mirrored
- Mobile-croppable

### Desktop Behavior

Balances the right side and supports composition.

### Tablet Behavior

Crop moderately while preserving the path.

### Mobile Behavior

Crop heavily if needed.

### Avoid

- Mirrored left cluster
- Bright green palette
- Crowding right learning objects
- Dark heavy frame
- Covering path

---

## Layer 17: Sparkles / Magic Accents

| Field | Value |
|---|---|
| Layer name | `layer-17-sparkles-magic-accents` |
| Purpose | Wonder |
| Format | SVG |
| Transparency | Yes |
| Motion | Slow shimmer |
| Priority | Medium |
| Status | Approved |

### Visual Role

Sparkles add gentle magic and life without turning the page into a reward screen.

### Approved Direction

- Eight to fourteen accents on desktop
- Gold, cream, soft orange
- Near glow, book, Letter A, and path
- Varied shimmer delays
- Mobile reduced

### Desktop Behavior

Full subtle sparkle field with low visual weight.

### Tablet Behavior

Reduce quantity and preserve clean copy zone.

### Mobile Behavior

Reduce to four to seven meaningful accents.

### Avoid

- Confetti
- Rainbow glitter
- Fast twinkle
- Crowding headline
- Reward animation feel

---

## Layer 18: Logo Placement

| Field | Value |
|---|---|
| Layer name | `layer-18-logo-placement` |
| Purpose | Brand trust |
| Format | SVG |
| Transparency | Yes |
| Motion | Soft fade |
| Priority | Critical |
| Status | Approved |

### Visual Role

The logo establishes trust and ownership of the world.

### Approved Direction

- Top-center placement
- Soft translucent cream pill
- Ready in navy
- Kiddo in orange
- SVG implementation
- Safe-area aware
- No navbar treatment

### Desktop Behavior

Clear and centered with breathing room.

### Tablet Behavior

Slightly smaller, still centered.

### Mobile Behavior

Compact, centered, safe-area aware.

### Avoid

- Top-left navbar feel
- Oversized logo
- Busy logo background
- Bouncy animation
- Blurry raster file

---

## Layer 19: Headline

| Field | Value |
|---|---|
| Layer name | `layer-19-headline` |
| Purpose | Product promise |
| Format | HTML text |
| Transparency | N/A |
| Motion | Soft fade |
| Priority | Critical |
| Status | Approved |

### Approved Copy

**Build a learning world together.**

### Visual Role

The headline states the emotional promise of the product.

### Approved Direction

- Large rounded display type
- Deep navy color
- Centered in clean sky zone
- Strong line breaks
- No over-explaining

### Desktop Behavior

Large and cinematic. Should feel confident but not crush the illustration.

### Tablet Behavior

Scale down cleanly and preserve line rhythm.

### Mobile Behavior

Readable, likely two to three lines, with no overflow.

### Avoid

- Technical language
- All caps
- Thin type
- Bubble font
- Salesy phrasing

---

## Layer 20: Subheadline

| Field | Value |
|---|---|
| Layer name | `layer-20-subheadline` |
| Purpose | Product clarity |
| Format | HTML text |
| Transparency | N/A |
| Motion | Soft fade |
| Priority | Critical |
| Status | Approved |

### Approved Copy

**A parent-child experience that turns early skills into a world you build together.**

### Visual Role

The subheadline clarifies the promise without over-explaining the technology.

### Approved Direction

- Muted slate color
- Medium-bold type
- Centered
- Comfortable line height
- Responsive max width
- No AI mention on first screen

### Desktop Behavior

Readable and calm under the headline.

### Tablet Behavior

Maintain comfortable line length.

### Mobile Behavior

Use a narrow max width and generous line height.

### Avoid

- AI-heavy language
- Long paragraph
- Thin low-contrast text
- Crowding illustration
- Corporate tone

---

## Layer 21: Future CTA Zone

| Field | Value |
|---|---|
| Layer name | `layer-21-future-cta-zone` |
| Purpose | Future action |
| Format | HTML button |
| Transparency | N/A |
| Motion | Future glow |
| Priority | Future |
| Status | Approved |

### Approved Future Copy

**Start the journey**

### Visual Role

The CTA will become the doorway from landing page into world-building.

### Approved Direction

- Hidden in Phase 1
- Path-anchored later
- Soft cream/orange treatment
- Invitation style
- Not a generic button
- HTML for accessibility

### Desktop Behavior

Future CTA can sit elegantly near the path or between copy and scene.

### Tablet Behavior

Slightly smaller and centered.

### Mobile Behavior

Thumb-friendly, safe from browser UI, and not covering figures.

### Avoid

- Large SaaS button
- Tile/card style
- Covering figures
- Salesy copy
- Premature visibility

---

# MVP Priority Map

## Critical

- Sky base
- Sun / horizon glow
- Front ground
- Main path
- Path polish
- Parent + child
- Logo
- Headline
- Subheadline

## High

- Clouds
- Far mountains
- Mid hills

## Medium

- Letter A cluster
- Number block cluster
- Open book
- Foreground plants left
- Foreground plants right
- Sparkles

## Low-Medium

- Shape cluster
- Learning landmark

## Future

- CTA zone

---

# Build Notes

The MVP should be built in this order:

1. Base HTML structure
2. Sky and glow
3. Mountains and hills
4. Front ground
5. Path and path polish
6. Parent-child figures
7. Learning objects
8. Foreground plants
9. Sparkles
10. Logo and copy
11. Responsive tuning
12. Motion tuning
13. QA pass

Do not add a visible CTA until the hero scene feels strong without it.

---

# Completion Rule

A layer is production-ready only when it works across:

- Desktop
- Tablet
- Mobile
- Reduced motion
- Safe-area mobile screens

A layer is not approved for final MVP if it weakens:

- the parent-child story
- the path direction
- the headline readability
- the warm premium tone
