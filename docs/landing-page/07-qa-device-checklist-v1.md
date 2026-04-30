# ReadyKiddo Landing Page QA Device Checklist v1

## Document Purpose

This document defines the QA process for reviewing the ReadyKiddo landing page MVP across devices, screen sizes, browser behavior, accessibility settings, and visual quality standards.

The goal is to prevent the page from only looking good on one screen.

This document should be read with:

- `01-production-spec-v1.md`
- `02-layer-system-v1.md`
- `03-responsive-rules-v1.md`
- `04-motion-rules-v1.md`
- `05-asset-inventory-v1.md`
- `06-build-checklist-v1.md`

---

## QA Philosophy

The ReadyKiddo landing page is approved only when it works as a composed emotional experience across desktop, tablet, and mobile.

QA is not just technical testing.

QA must confirm:

- The page feels warm
- The page feels premium
- The parent-child story is clear
- The path feels meaningful
- The headline is readable
- The mobile experience is not an afterthought
- Motion feels calm and not distracting
- Decorative layers support the story instead of competing with it

The landing page should never be approved based on desktop alone.

---

## Protected Experience

Across every device and browser size, the following must remain protected:

1. ReadyKiddo logo
2. Headline
3. Subheadline
4. Main path
5. Parent + child silhouettes
6. Parent-child hand-hold
7. Horizon glow
8. Overall warm storybook feeling

If any of these are lost, the page is not MVP-ready.

---

## QA Environments

Use the following categories for review:

1. Desktop
2. Tablet portrait
3. Tablet landscape
4. Mobile portrait
5. Mobile landscape
6. Short-height screens
7. Reduced motion
8. Slow network / performance
9. Accessibility basics
10. Netlify deployment verification

---

# Desktop QA

## Target Sizes

| Size | Purpose | Required |
|---|---|---|
| 1440 x 900 | Primary design target | Yes |
| 1536 x 864 | Common laptop | Yes |
| 1920 x 1080 | Large desktop | Yes |
| 1366 x 768 | Smaller laptop | Yes |
| 1280 x 720 | Compact desktop | Recommended |

## Desktop Visual Checklist

- [ ] Logo is centered and sharp
- [ ] Logo pill feels soft, not heavy
- [ ] Headline is large and readable
- [ ] Headline line breaks feel intentional
- [ ] Subheadline is readable and not too wide
- [ ] Copy zone is clean and not crowded by clouds or sparkles
- [ ] Horizon glow feels hopeful and centered with the path
- [ ] Path begins broad and tapers naturally
- [ ] Path does not feel like a flat orange blob
- [ ] Parent + child figures are visible and emotionally readable
- [ ] Parent-child hand-hold is clear
- [ ] Figures feel grounded with contact shadow
- [ ] Learning objects are visible but secondary
- [ ] Foreground plants frame the scene without crowding center
- [ ] Sparkles feel subtle, not busy
- [ ] Overall scene feels storybook-like and premium

## Desktop Technical Checklist

- [ ] No horizontal scrollbar
- [ ] No vertical scrollbar unless intentionally allowed
- [ ] No broken images or missing assets
- [ ] No obvious font loading issue
- [ ] No visible layout shift after load
- [ ] No console errors related to missing files
- [ ] Animations loop smoothly
- [ ] Reduced motion rule works when enabled

## Desktop Approval Standard

Desktop is approved when the full landscape feels cinematic and composed while keeping the parent-child story emotionally clear.

---

# Tablet QA

## Target Sizes

| Size | Orientation | Purpose | Required |
|---|---|---|---|
| 768 x 1024 | Portrait | iPad baseline | Yes |
| 820 x 1180 | Portrait | Modern tablet | Yes |
| 1024 x 1366 | Portrait | Large tablet | Yes |
| 1024 x 768 | Landscape | Tablet landscape | Yes |
| 1180 x 820 | Landscape | Modern tablet landscape | Recommended |

## Tablet Visual Checklist

- [ ] Logo remains centered and compact
- [ ] Headline remains readable
- [ ] Subheadline line length feels comfortable
- [ ] Scene crop feels intentional, not broken
- [ ] Path remains centered
- [ ] Path still connects to horizon glow
- [ ] Parent + child remain visible
- [ ] Hand-hold remains visible
- [ ] Learning objects reduce or crop gracefully
- [ ] Foreground plants do not crowd the center
- [ ] Horizon glow remains visible
- [ ] Side crop does not remove the emotional story

## Tablet Technical Checklist

- [ ] No unintended scrollbars
- [ ] No overlap between copy and major art elements
- [ ] SVG/art scales cleanly
- [ ] Touch viewport does not distort layout
- [ ] Motion remains smooth
- [ ] Safe-area spacing remains acceptable

## Tablet Approval Standard

Tablet is approved when it feels like a carefully cropped storybook scene, not a squeezed desktop design.

---

# Mobile Portrait QA

## Target Sizes

| Size | Purpose | Required |
|---|---|---|
| 390 x 844 | Common iPhone target | Yes |
| 393 x 852 | Common modern phone target | Yes |
| 430 x 932 | Large phone | Yes |
| 360 x 800 | Narrow Android target | Yes |
| 375 x 667 | Short older iPhone | Yes |
| 414 x 896 | Large iPhone variant | Recommended |

## Mobile Visual Checklist

- [ ] Logo is visible, sharp, and centered
- [ ] Logo does not crowd the headline
- [ ] Headline is readable without feeling tiny
- [ ] Headline line breaks feel intentional
- [ ] Subheadline is readable and not cramped
- [ ] Text does not overlap busy artwork
- [ ] Main path is centered
- [ ] Path is emotionally readable
- [ ] Horizon glow is visible
- [ ] Parent + child figures are visible
- [ ] Hand-hold is visible
- [ ] Figures are not cut off by bottom browser UI
- [ ] Contact shadow remains visible or implied
- [ ] Side learning objects do not clutter the center
- [ ] Foreground plants are cropped/reduced if needed
- [ ] Sparkles are reduced and not distracting
- [ ] Overall page still feels warm and premium

## Mobile Technical Checklist

- [ ] Uses stable mobile viewport behavior
- [ ] Uses `100svh` or equivalent mobile-safe height handling
- [ ] Uses safe-area-aware top spacing
- [ ] No horizontal scrolling
- [ ] No accidental zoomed-out layout
- [ ] No content hidden behind browser chrome
- [ ] No tap targets are present in Phase 1 unless intentionally added
- [ ] Animations remain smooth
- [ ] Reduced motion works

## Mobile Approval Standard

Mobile is approved when the emotional story survives the crop: parent, child, path, horizon, and message are all clear.

---

# Mobile Landscape QA

## Target Sizes

| Size | Purpose | Required |
|---|---|---|
| 844 x 390 | iPhone landscape | Recommended |
| 852 x 393 | modern phone landscape | Recommended |
| 932 x 430 | large phone landscape | Recommended |
| 800 x 360 | narrow Android landscape | Recommended |

## Mobile Landscape Checklist

- [ ] Logo remains compact
- [ ] Headline is readable
- [ ] Subheadline does not crowd the scene
- [ ] Path and figures remain visible if possible
- [ ] Decorative layers reduce heavily
- [ ] No major art overlaps text
- [ ] Page does not feel broken if vertical space is limited

## Mobile Landscape Approval Standard

Landscape mobile does not need the fullest composition, but it must not look broken or careless.

---

# Short-Height Screen QA

## Target Conditions

Test screens under 700px height, especially:

- 1366 x 768
- 1280 x 720
- 375 x 667
- Mobile landscape sizes

## Checklist

- [ ] Logo does not consume too much height
- [ ] Headline remains readable
- [ ] Subheadline remains visible unless intentionally reduced
- [ ] Parent + child are not cut off
- [ ] Path remains connected to horizon glow
- [ ] Scene does not feel vertically crushed
- [ ] Decorative layers reduce before protected layers are harmed

## Approval Standard

Short screens are approved when the page feels compact but still intentional.

---

# Motion QA

## Motion Checklist

- [ ] Cloud drift is slow
- [ ] Horizon glow pulse is subtle
- [ ] Letter A float is gentle
- [ ] Number block float feels heavier and slower
- [ ] Book float/glow is restrained
- [ ] Sparkles shimmer slowly
- [ ] Logo fade-in is calm
- [ ] Headline fade-in is calm
- [ ] Subheadline fade-in is calm
- [ ] Parent-child idle motion is barely perceptible or disabled
- [ ] No animation feels bouncy
- [ ] No animation feels like confetti
- [ ] No animation distracts from the headline
- [ ] No animation distracts from the figures
- [ ] Animation loops do not visibly jump

## Reduced Motion Checklist

With reduced motion enabled:

- [ ] Cloud drift stops
- [ ] Glow pulse stops
- [ ] Floating objects stop
- [ ] Sparkles stop animating
- [ ] Text appears without movement
- [ ] Layout remains visually complete
- [ ] No important element disappears

## Approval Standard

Motion is approved when the world feels alive but calm.

---

# Accessibility QA

## Content Checklist

- [ ] Page has meaningful `<title>`
- [ ] Page has useful meta description
- [ ] Main content is inside `<main>`
- [ ] Headline is real HTML text
- [ ] Subheadline is real HTML text
- [ ] Decorative artwork is hidden from screen readers when appropriate
- [ ] Important visible text is not baked into images
- [ ] Logo has appropriate accessible text or label

## Visual Accessibility Checklist

- [ ] Headline contrast is readable
- [ ] Subheadline contrast is readable
- [ ] Text is readable on mobile
- [ ] Text is not placed over busy artwork
- [ ] Motion can be disabled

## Future CTA Accessibility Checklist

When CTA is added later:

- [ ] CTA is a real `<button>` or link
- [ ] CTA is keyboard accessible
- [ ] CTA has visible focus state
- [ ] CTA copy is clear
- [ ] CTA does not rely only on color/glow

## Approval Standard

Accessibility is approved when the page remains understandable, readable, and motion-safe.

---

# Performance QA

## Performance Checklist

- [ ] SVG is not unnecessarily bloated
- [ ] No oversized raster image is used for the full scene unless optimized
- [ ] Fonts load without major layout shift
- [ ] Animations use `transform` and `opacity` when possible
- [ ] Heavy filters are limited
- [ ] Mobile remains smooth
- [ ] No excessive DOM complexity from decorative assets
- [ ] No console errors
- [ ] Netlify deploy loads successfully

## Asset Checklist

- [ ] Logo is sharp
- [ ] No missing asset paths
- [ ] No broken external files
- [ ] Decorative assets load quickly
- [ ] Future WebP assets are compressed before production use

## Approval Standard

Performance is approved when the page feels smooth and loads reliably on mobile and desktop.

---

# Browser QA

## Minimum Browser Review

| Browser | Device Type | Required |
|---|---|---|
| Chrome | Desktop | Yes |
| Safari | Desktop or iOS | Yes |
| Edge | Desktop | Recommended |
| Firefox | Desktop | Recommended |
| Chrome | Android | Recommended |
| Safari | iPhone | Yes |

## Browser Checklist

- [ ] CSS viewport units behave correctly
- [ ] SVG scales correctly
- [ ] Fonts render acceptably
- [ ] Motion performs smoothly
- [ ] No browser-specific clipping issue
- [ ] No unexpected scroll behavior

## Approval Standard

Browser QA is approved when the experience is consistent enough that no supported browser feels broken.

---

# Netlify Deployment QA

## Deployment Checklist

- [ ] GitHub commit completes
- [ ] Netlify build/deploy starts
- [ ] Netlify deploy succeeds
- [ ] Live site reflects latest commit
- [ ] No 404 for CSS or assets
- [ ] No broken asset paths from folder changes
- [ ] Page loads from the Netlify URL
- [ ] Mobile browser can open the Netlify URL cleanly

## Approval Standard

Deployment is approved when the live Netlify site matches the reviewed local/repo version.

---

# Emotional QA

The page must be judged emotionally, not only technically.

## Emotional Checklist

- [ ] Does it feel warm?
- [ ] Does it feel safe?
- [ ] Does it feel premium?
- [ ] Does it feel storybook-like?
- [ ] Does it feel parent-child centered?
- [ ] Does it suggest learning without feeling like homework?
- [ ] Does the path make me want to move forward?
- [ ] Does the horizon feel hopeful?
- [ ] Do the figures feel human enough to matter?
- [ ] Does the page avoid feeling like generic edtech?

## Failure Signals

The page needs revision if it feels:

- Blocky
- Cheap
- Too empty
- Too busy
- Too childish
- Too corporate
- Like a dashboard
- Like a worksheet
- Like a stock illustration page
- Like an ordinary SaaS landing page

---

# Final MVP QA Sign-Off

The landing page MVP is approved only when all core categories pass:

- [ ] Desktop QA passed
- [ ] Tablet QA passed
- [ ] Mobile portrait QA passed
- [ ] Short-height QA passed
- [ ] Motion QA passed
- [ ] Reduced motion QA passed
- [ ] Accessibility QA passed
- [ ] Performance QA passed
- [ ] Browser QA passed
- [ ] Netlify deployment QA passed
- [ ] Emotional QA passed

---

# Final Definition of Done

The ReadyKiddo landing page MVP is done when:

- It feels warm, premium, and storybook-like
- The parent-child journey is instantly understood
- The path leads the eye toward the horizon
- The page works cleanly on desktop, tablet, and mobile
- The artwork feels intentional, not blocky or generic
- The logo, headline, and subheadline are sharp and readable
- The page does not feel like a dashboard, worksheet, or generic app
- The motion is subtle and not distracting
- The mobile layout preserves the central emotional story
- The live Netlify deploy matches the approved build

---

# Next Step After Documentation

After this QA document is created, the documentation packet is complete for the first landing page rebuild.

Next production step:

1. Review the seven documentation files
2. Confirm build order
3. Rebuild the hero scene according to the spec
4. Test against this QA checklist
5. Iterate until the MVP hero passes
