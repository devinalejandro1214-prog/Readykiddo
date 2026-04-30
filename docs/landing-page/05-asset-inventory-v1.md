# ReadyKiddo Landing Page Asset Inventory v1

## Document Purpose

This document defines the asset inventory for the ReadyKiddo landing page MVP.

It lists every planned visual asset, SVG group, HTML text layer, and future interactive element needed to build the approved layered hero system.

This document should be read with:

- `01-production-spec-v1.md`
- `02-layer-system-v1.md`
- `03-responsive-rules-v1.md`
- `04-motion-rules-v1.md`

---

## Asset Strategy

The ReadyKiddo landing page should be built as a layered hero scene.

The MVP should prioritize:

- Editable assets
- Scalable vector artwork
- Responsive control
- Clean mobile behavior
- Light file weight
- Real HTML text for messaging
- Motion-ready layer separation

The MVP should avoid:

- One flat image for the whole page
- Text baked into images
- Blurry raster logo files
- Heavy unoptimized images
- Decorative assets that cannot be cropped or hidden
- Asset choices that make mobile layout fragile

---

## Preferred Formats

| Asset Type | Preferred Format | Notes |
|---|---|---|
| Logo | SVG | Sharp, reusable, brand-safe |
| Headline | HTML text | SEO, accessibility, responsive control |
| Subheadline | HTML text | SEO, accessibility, responsive control |
| Landscape layers | SVG | Scalable and easy to tune |
| Simple objects | SVG | Best for letters, numbers, shapes, plants |
| Painterly future art | WebP with transparency | Optional later upgrade |
| Motion overlays | SVG | Easy opacity/transform animation |
| Future CTA | HTML button | Accessible and trackable |

---

## Recommended Folder Structure

The final production structure should move toward:

```text
assets/
  brand/
    readykiddo-logo.svg
  landing/
    svg/
      layer-01-sky-base.svg
      layer-02-sun-horizon-glow.svg
      layer-03-clouds.svg
      layer-04-far-mountains.svg
      layer-05-mid-hills.svg
      layer-06-front-ground.svg
      layer-07-path-base.svg
      layer-08-path-polish.svg
      layer-09-parent-child.svg
      layer-10-letter-a-cluster.svg
      layer-11-number-block-cluster.svg
      layer-12-shape-cluster.svg
      layer-13-open-book.svg
      layer-14-learning-landmark.svg
      layer-15-foreground-plants-left.svg
      layer-16-foreground-plants-right.svg
      layer-17-sparkles.svg
    webp/
      future-painterly-replacements/
```

For the early MVP, assets may be built inline inside `index.html` as SVG groups while the scene is still being shaped.

Once the design stabilizes, reusable pieces should be extracted into asset files.

---

# Asset Inventory Table

| ID | Asset Name | Layer | Format | Transparency | Motion | Priority | Status |
|---|---|---:|---|---|---|---|---|
| A01 | `layer-01-sky-base` | 1 | SVG/WebP | No | None | Critical | Planned |
| A02 | `layer-02-sun-horizon-glow` | 2 | SVG/WebP | Yes | Glow pulse | Critical | Planned |
| A03 | `layer-03-clouds-left` | 3 | SVG/WebP | Yes | Drift | High | Planned |
| A04 | `layer-03-clouds-right` | 3 | SVG/WebP | Yes | Drift | High | Planned |
| A05 | `layer-03-clouds-faint` | 3 | SVG/WebP | Yes | Optional drift | Medium | Optional |
| A06 | `layer-04-far-mountains-back` | 4 | SVG | Yes | None | High | Planned |
| A07 | `layer-04-far-mountains-front` | 4 | SVG | Yes | None | High | Planned |
| A08 | `layer-05-mid-hills-back` | 5 | SVG | Yes | None | High | Planned |
| A09 | `layer-05-mid-hills-main` | 5 | SVG | Yes | None | High | Planned |
| A10 | `layer-05-mid-hills-lower` | 5 | SVG | Yes | None | Medium | Planned |
| A11 | `layer-06-front-ground` | 6 | SVG | Yes | None | Critical | Planned |
| A12 | `layer-06-ground-contact-shadow` | 6 | SVG | Yes | None | High | Planned |
| A13 | `layer-07-path-base` | 7 | SVG | Yes | Future zoom | Critical | Planned |
| A14 | `layer-08-path-center-highlight` | 8 | SVG | Yes | Optional warmth | Critical | Planned |
| A15 | `layer-08-path-edge-shadow` | 8 | SVG | Yes | None | High | Planned |
| A16 | `layer-08-path-texture-marks` | 8 | SVG | Yes | None | Medium | Planned |
| A17 | `layer-09-parent-child` | 9 | SVG | Yes | Tiny presence | Critical | Planned |
| A18 | `layer-09-figure-contact-shadow` | 9 | SVG | Yes | None | Critical | Planned |
| A19 | `layer-10-letter-a-cluster` | 10 | SVG | Yes | Float | Medium | Planned |
| A20 | `layer-11-number-block-cluster` | 11 | SVG | Yes | Slow float | Medium | Planned |
| A21 | `layer-12-shape-cluster` | 12 | SVG | Yes | None | Low-medium | Planned |
| A22 | `layer-13-open-book` | 13 | SVG | Yes | Float/glow | Medium | Planned |
| A23 | `layer-13-book-glow` | 13 | SVG | Yes | Glow pulse | Medium | Planned |
| A24 | `layer-14-learning-landmark` | 14 | SVG | Yes | None | Low-medium | Planned |
| A25 | `layer-15-foreground-plants-left` | 15 | SVG | Yes | None | Medium | Planned |
| A26 | `layer-16-foreground-plants-right` | 16 | SVG | Yes | None | Medium | Planned |
| A27 | `layer-17-sparkles` | 17 | SVG | Yes | Shimmer | Medium | Planned |
| A28 | `readykiddo-logo` | 18 | SVG | Yes | Fade-in | Critical | Planned |
| A29 | `headline-text` | 19 | HTML | N/A | Fade-in | Critical | Approved copy |
| A30 | `subheadline-text` | 20 | HTML | N/A | Fade-in | Critical | Approved copy |
| A31 | `future-cta` | 21 | HTML button | N/A | Future glow | Future | Reserved |

---

# Detailed Asset Specs

---

## A01: `layer-01-sky-base`

### Purpose

Creates the emotional foundation of the hero scene.

### Visual Requirements

- Soft cream upper sky
- Warm golden middle
- Luminous pale horizon area
- Smooth storybook atmosphere
- Clean central copy zone

### Format

Preferred MVP:

```text
SVG background or CSS/SVG gradient
```

Future painterly upgrade:

```text
WebP base image
```

### Transparency

No. This is the base layer.

### Responsive Notes

Must preserve clean space behind logo, headline, and subheadline.

### Production Notes

This may begin as CSS/SVG gradient and later become a painterly asset if needed.

---

## A02: `layer-02-sun-horizon-glow`

### Purpose

Creates the hopeful destination at the end of the path.

### Visual Requirements

- Soft sunrise bloom
- Warm ivory center
- Pale gold inner glow
- Peach-gold outer haze
- No sharp rays

### Format

Preferred:

```text
SVG radial gradient group
```

### Transparency

Yes.

### Motion

Subtle opacity/scale breathing.

### Responsive Notes

Must stay visually connected to the path endpoint on desktop, tablet, and mobile.

---

## A03: `layer-03-clouds-left`

### Purpose

Adds airiness and frames the upper-left sky.

### Visual Requirements

- Soft warm ivory cluster
- Horizontally stretched
- Low contrast
- No hard outline

### Format

Preferred:

```text
SVG group
```

Future option:

```text
Transparent WebP
```

### Transparency

Yes.

### Motion

Slow horizontal drift.

### Responsive Notes

May crop on tablet and mobile. Must not cross headline area.

---

## A04: `layer-03-clouds-right`

### Purpose

Balances the upper-right sky.

### Visual Requirements

- Smaller or lighter than left cloud cluster
- Warm ivory tone
- Low contrast
- Slightly distant feel

### Format

Preferred:

```text
SVG group
```

### Transparency

Yes.

### Motion

Slow horizontal drift at different speed than left cloud.

### Responsive Notes

May reduce or crop on mobile.

---

## A05: `layer-03-clouds-faint`

### Purpose

Optional faint cloud support for added depth.

### Visual Requirements

- Very low opacity
- No headline interference
- Barely visible

### Format

SVG or WebP.

### Transparency

Yes.

### Motion

Optional very slow drift.

### Responsive Notes

Hide on mobile if needed.

---

## A06: `layer-04-far-mountains-back`

### Purpose

Creates distant world depth.

### Visual Requirements

- Very soft warm mountain silhouette
- Low contrast
- Hazy and distant
- No hard detail

### Format

SVG.

### Transparency

Yes.

### Motion

None.

### Responsive Notes

Side crop allowed. Center valley must remain aligned with horizon glow.

---

## A07: `layer-04-far-mountains-front`

### Purpose

Adds second distant depth band.

### Visual Requirements

- Slightly more defined than back layer
- Warm beige/apricot tones
- Soft center opening

### Format

SVG.

### Transparency

Yes.

### Motion

None.

### Responsive Notes

Should not become dominant on mobile.

---

## A08: `layer-05-mid-hills-back`

### Purpose

Begins the reachable terrain system.

### Visual Requirements

- Light honey/tan tone
- Soft slope shapes
- Supports depth between mountains and foreground

### Format

SVG.

### Transparency

Yes.

### Motion

None.

---

## A09: `layer-05-mid-hills-main`

### Purpose

Creates main rolling hill body.

### Visual Requirements

- Warm apricot/honey color
- Organic sweeping slopes
- Center opening for path

### Format

SVG.

### Transparency

Yes.

### Motion

None.

---

## A10: `layer-05-mid-hills-lower`

### Purpose

Transitions from mid terrain into the foreground.

### Visual Requirements

- Slightly deeper warm tone
- Soft overlap with front ground
- No game-platform look

### Format

SVG.

### Transparency

Yes.

### Motion

None.

---

## A11: `layer-06-front-ground`

### Purpose

Creates the starting stage where the journey begins.

### Visual Requirements

- Warm caramel-gold terrain
- Organic curved top edge
- Stable foreground base
- Space for path and figures

### Format

SVG.

### Transparency

Yes.

### Motion

None.

### Responsive Notes

Must not crowd bottom center on mobile.

---

## A12: `layer-06-ground-contact-shadow`

### Purpose

Provides grounding support for figures and foreground objects.

### Visual Requirements

- Soft oval shadows
- Warm brown/navy blend
- Low opacity
- No dramatic darkness

### Format

SVG.

### Transparency

Yes.

### Motion

None.

---

## A13: `layer-07-path-base`

### Purpose

Defines the main journey path.

### Visual Requirements

- Wide at bottom
- Narrows toward horizon
- Gentle S-curve
- Organic edges
- Golden orange palette

### Format

SVG.

### Transparency

Yes.

### Motion

No MVP movement. Future transition-ready.

### Responsive Notes

Critical on all devices. Must stay centered and connected to horizon glow.

---

## A14: `layer-08-path-center-highlight`

### Purpose

Adds light and direction to the path.

### Visual Requirements

- Soft cream/gold highlight
- Follows path curve
- Tapered and subtle
- Not a road stripe

### Format

SVG.

### Transparency

Yes.

### Motion

Optional subtle opacity breathing.

---

## A15: `layer-08-path-edge-shadow`

### Purpose

Embeds the path into the terrain.

### Visual Requirements

- Warm left edge shadow
- Subtle right rim light
- No hard outline

### Format

SVG.

### Transparency

Yes.

### Motion

None.

---

## A16: `layer-08-path-texture-marks`

### Purpose

Adds handcrafted path detail.

### Visual Requirements

- Three to six low-opacity soft marks
- Oval or brush-like patches
- Follows path perspective
- No pattern or repetition

### Format

SVG.

### Transparency

Yes.

### Motion

None.

### Responsive Notes

Reduce or hide some marks on mobile.

---

## A17: `layer-09-parent-child`

### Purpose

Expresses the ReadyKiddo mission visually.

### Visual Requirements

- Refined navy silhouettes
- Clear hand-hold
- Universal figures
- No facial detail
- Gentle posture toward path

### Format

SVG.

### Transparency

Yes.

### Motion

Tiny presence movement only.

### Responsive Notes

Protected layer. Hand-hold must remain visible on mobile.

---

## A18: `layer-09-figure-contact-shadow`

### Purpose

Grounds the parent-child figures physically in the scene.

### Visual Requirements

- Soft oval shadow beneath figures
- Low opacity
- Wider than figures
- Warm tone

### Format

SVG.

### Transparency

Yes.

### Motion

None.

---

## A19: `layer-10-letter-a-cluster`

### Purpose

Signals early literacy.

### Visual Requirements

- Left-side floating medallion
- Warm cream base
- Large navy A
- Small orange accents
- Soft shadow

### Format

SVG.

### Transparency

Yes.

### Motion

Gentle float with tiny rotation.

### Responsive Notes

Can reduce or crop on mobile.

---

## A20: `layer-11-number-block-cluster`

### Purpose

Signals early numeracy.

### Visual Requirements

- Right-side rounded block cluster
- Main cream block with orange 1
- Smaller support block
- Soft tan shading
- Gentle shadow

### Format

SVG.

### Transparency

Yes.

### Motion

Slow, heavier float.

### Responsive Notes

Can reduce, crop, or hide before central story is affected.

---

## A21: `layer-12-shape-cluster`

### Purpose

Signals shape, color, and spatial learning.

### Visual Requirements

- Lower-left grounded cluster
- Circle, triangle, rounded square
- Orange/navy/slate palette
- Soft shadows

### Format

SVG.

### Transparency

Yes.

### Motion

None.

### Responsive Notes

Optional on mobile. Hide if it creates clutter.

---

## A22: `layer-13-open-book`

### Purpose

Connects learning, reading, imagination, and story.

### Visual Requirements

- Mid-right floating storybook
- Warm cream pages
- Navy/orange cover accents
- Soft curved pages
- No readable text

### Format

SVG.

### Transparency

Yes.

### Motion

Gentle float.

---

## A23: `layer-13-book-glow`

### Purpose

Adds subtle wonder to the open book.

### Visual Requirements

- Pale gold center glow
- Low opacity
- Soft and restrained

### Format

SVG.

### Transparency

Yes.

### Motion

Soft glow pulse.

---

## A24: `layer-14-learning-landmark`

### Purpose

Creates a distant destination.

### Visual Requirements

- Tiny soft learning landmark
- Cream body
- Muted orange roof
- Small navy accents
- No text or sign
- Low contrast inside horizon glow

### Format

SVG.

### Transparency

Yes.

### Motion

None.

### Responsive Notes

Optional on mobile.

---

## A25: `layer-15-foreground-plants-left`

### Purpose

Frames the lower-left foreground.

### Visual Requirements

- Rounded navy/slate leaves
- Small cream/orange accents
- Organic but simple
- Not generic grass

### Format

SVG.

### Transparency

Yes.

### Motion

None for MVP.

### Responsive Notes

Crop aggressively on mobile if needed.

---

## A26: `layer-16-foreground-plants-right`

### Purpose

Frames the lower-right foreground.

### Visual Requirements

- Related to left plants, not mirrored
- Slightly taller and airier
- Slate/navy palette
- Small warm accents

### Format

SVG.

### Transparency

Yes.

### Motion

None for MVP.

### Responsive Notes

Crop aggressively on mobile if needed.

---

## A27: `layer-17-sparkles`

### Purpose

Adds subtle wonder and ambient magic.

### Visual Requirements

- Tiny dots and four-point stars
- Gold/cream/orange palette
- Low opacity
- Placed near glow, book, Letter A, and path

### Format

SVG.

### Transparency

Yes.

### Motion

Slow shimmer with varied delays.

### Responsive Notes

Reduce quantity on tablet and mobile.

---

## A28: `readykiddo-logo`

### Purpose

Establishes brand identity and trust.

### Visual Requirements

- SVG logo treatment
- Ready in navy
- Kiddo in orange
- Soft translucent pill behind logo
- Sharp at all sizes

### Format

SVG.

### Transparency

Yes.

### Motion

Soft fade-in only.

### Responsive Notes

Safe-area aware and centered on mobile.

---

## A29: `headline-text`

### Purpose

States the product promise.

### Approved Copy

```text
Build a learning world together.
```

### Format

HTML text.

### Motion

Soft fade-in with tiny upward settle.

### Responsive Notes

Must remain readable and intentional across all breakpoints.

---

## A30: `subheadline-text`

### Purpose

Clarifies the product promise.

### Approved Copy

```text
A parent-child experience that turns early skills into a world you build together.
```

### Format

HTML text.

### Motion

Soft delayed fade-in.

### Responsive Notes

Must remain readable without crowding the hero scene.

---

## A31: `future-cta`

### Purpose

Reserved future interaction point.

### Approved Future Copy

```text
Start the journey
```

### Format

HTML button.

### MVP Status

Hidden in Phase 1.

### Future Behavior

Should be path-anchored and trigger the world-entry transition.

---

# Asset Creation Priority

## Phase 1: Critical Emotional Structure

Create first:

1. Sky base
2. Sun / horizon glow
3. Far mountains
4. Mid hills
5. Front ground
6. Main path
7. Path polish
8. Parent + child
9. Logo
10. Headline
11. Subheadline

This creates the core feeling.

## Phase 2: Learning World Cues

Create next:

1. Letter A cluster
2. Number block cluster
3. Open book
4. Shape cluster
5. Learning landmark

This adds the educational identity.

## Phase 3: Polish and Atmosphere

Create last:

1. Foreground plants left
2. Foreground plants right
3. Sparkles
4. Optional faint cloud
5. Optional additional texture marks

This completes the visual richness.

---

# Asset Quality Rules

Every asset must be checked against these standards:

- Does it feel storybook-like?
- Does it match the ReadyKiddo palette?
- Does it avoid generic clipart?
- Does it preserve the central story?
- Does it scale to mobile?
- Does it avoid unnecessary detail?
- Does it support the emotional direction?

If an asset fails one of these, it should be revised before being considered MVP-ready.

---

# Status Definitions

| Status | Meaning |
|---|---|
| Planned | Approved direction exists, asset not built yet |
| Drafted | Asset exists but needs review |
| MVP-ready | Asset is approved for the MVP build |
| Replace later | Asset works for MVP but should be upgraded later |
| Optional | Asset may be included only if it improves the scene |
| Reserved | Future feature or interaction, not active in Phase 1 |

---

# Production Notes

## Inline SVG vs External SVG

During rapid iteration, SVG groups may live inline inside `index.html`.

Once the visual system stabilizes, repeated or reusable SVGs should move into the `assets/landing/svg/` folder.

## Text Assets

Headline and subheadline should never be exported as images.

They must remain real HTML for:

- accessibility
- SEO
- responsiveness
- future editing
- localization

## Logo Asset

The logo should eventually be stored as:

```text
assets/brand/readykiddo-logo.svg
```

Until the final logo asset is prepared, an inline SVG logo treatment may be used.

## Painterly Upgrade Path

If SVG alone cannot reach the desired visual richness, selected layers may later be replaced with transparent WebP assets.

Good candidates for future WebP upgrade:

- Sky base
- Clouds
- Hills
- Foreground plants
- Parent-child figures

Layers that should likely remain SVG:

- Logo
- Text
- Sparkles
- Letter A
- Number blocks
- Path highlight controls
- Future CTA

---

# Next Documentation Step

Create:

`06-build-checklist-v1.md`

That document should turn the production spec, layer system, responsive rules, motion rules, and asset inventory into a practical build checklist.
