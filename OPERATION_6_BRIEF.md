# Op 6 — Mobile Layout Fix: ABC Match + Pattern Quest
> **Status: READY TO EXECUTE — Next Session**
> Written by: Antigravity (Overseer) | Date: 2026-05-25
> Approved by Devin: ✅ Yes — "For the next session fix it"

---

## Context

Two games have mobile layout issues identified in a full audit at 375px (iPhone SE / small Android — our primary device target per AGENT_PROTOCOL.md Section 14).

### ABC Match — 3 confirmed issues
1. **Vertical overflow** — alien + bubble + 2×2 grid stacks taller than the viewport on 375px screens. Children have to scroll during a tap game.
2. **Tile size** — `.am-tile` has no explicit `min-height`. On small phones tiles are ~90px — barely passable. Gap between tiles (14px) is too tight for children's fingers.
3. **Alien/bubble proportions** — `.am-alien` is fixed `120px` wide. Combined with the speech bubble (`max-width: 220px`) and `14px` gap, the bubble gets squashed on anything narrower than 375px, and the `80px` letter chip takes up most of the bubble's internal space.

### Pattern Quest (lq-v3) — 2 confirmed issues
1. **Character overlap** — character is `position: absolute; bottom: 0; left: 10px` with `max-width: min(30vw, 170px)`. On 375px that's 112px wide sitting over the question panel's left side. No left-padding offset accounts for this — sequence items and text on the left edge are obscured.
2. **Sequence breathing room** — items at `clamp(58px, 14vw, 88px)` with `padding: 18px 16px` inside the panel leaves almost no margin at 375px. Feels visually crushed, especially with world-theme borders active.

---

## Agent Brief

```
=== AGENT BRIEF — OP 6 ===

Agent: Claude
Operation: Op 6 — Mobile Layout Fix (ABC Match + Pattern Quest)
Date: Next session

PRE-TASK:
Read AGENT_PROTOCOL.md Section 14 (Mobile-First UI Priority)
before writing a single line of CSS.

FILES TO TOUCH:
- assets/css/abc-match-game.css       — ABC Match mobile fixes
- assets/css/adventure-screen.css     — Pattern Quest lq-v3 mobile fixes

FILES TO NOT TOUCH:
- assets/js/games/abc-match-game.js
- assets/js/games/pattern-next-game.js
- Any other JS file
- game-registry.js
- session-manager.js
- AGENT_COLLAB_LOG.md
- AGENT_PROTOCOL.md

CONSTRAINTS:
- Write mobile-first: base styles target 375px, enhancements use
  min-width media queries
- Do NOT change any existing class names
- Do NOT change the .lq- prefix system or any theme class names
- Do NOT add new HTML structure — CSS fixes only
- All tap targets must be minimum 44×44px
- No horizontal scrolling at 375px
- Preserve all existing desktop/tablet behaviour above 600px


════════════════════════════════════════════════════════
PART A — abc-match-game.css fixes
════════════════════════════════════════════════════════

FIX A1 — Prevent vertical overflow / force game to fit viewport

The .am-layout currently has gap: 20px and padding: 16px 12px 24px.
On 375px screens the total height overflows.

Replace the existing .am-layout rule with:

  .am-layout {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: clamp(10px, 2vh, 20px);
    padding: clamp(10px, 2vh, 16px) 12px clamp(14px, 2vh, 24px);
    height: 100%;
    max-height: 100%;
    box-sizing: border-box;
    overflow: hidden;
  }

This keeps the layout within the game shell's height budget on all
screen sizes using clamp() so desktop gets the original spacing.

FIX A2 — Shrink alien on small screens, balance bubble

The .am-alien is fixed at 120px width. The .am-bubble has max-width
of 220px. Together on a 375px screen with a 14px gap they fill
354px — leaving almost no margin after the container's padding.

Add a new small-screen override (insert after the existing
@media (min-width: 480px) block for .am-alien):

  @media (max-width: 374px) {
    .am-alien         { width: 88px;  height: 107px; }
    .am-letter-chip   { width: 60px;  height: 60px;  }
    .am-bubble        { max-width: 180px; padding: 10px 12px; }
    .am-alien-area    { gap: 10px; }
  }

FIX A3 — Tile minimum size and spacing for children's fingers

The .am-tile has no min-height. On small phones this results in tiles
that are close to the 44px minimum but with cramped internal padding.

Update the .am-tile rule:
- Add: min-height: 80px;
- Change padding from: padding: 16px 8px;
       to:             padding: clamp(12px, 3vw, 16px) 8px;

Update the .am-grid rule:
- Change gap from: gap: 14px;
       to:         gap: clamp(10px, 3vw, 14px);

At 375px this keeps tiles comfortably tappable.
Above 480px everything stays at original values.

FIX A4 — Tile emoji and label scale on very small screens

The .am-tile-emoji is fixed at 2.6rem. Use clamp():

  .am-tile-emoji {
    font-size: clamp(2rem, 7vw, 2.6rem);
    line-height: 1;
  }

FIX A5 — Add a missing reduced-motion block

After all other rules, add:

  @media (prefers-reduced-motion: reduce) {
    .am-tile,
    .am-tile--correct,
    .am-tile--shake,
    .am-chip-ghost {
      animation: none !important;
      transition: none !important;
    }
  }


════════════════════════════════════════════════════════
PART B — adventure-screen.css fixes (lq-v3 only)
════════════════════════════════════════════════════════

Do NOT touch any lq-v1 or lq-v2 rules.
Do NOT touch any theme override blocks (.lq-theme-*).
Only touch lq-v3 layout rules and the responsive blocks
that affect lq-v3.

FIX B1 — Question panel left padding to clear the character

The character is position: absolute, bottom: 0, left: 10px,
max-width: min(30vw, 170px). On 375px that's 112px wide.
The question panel has no left offset, so the character overlaps
the panel's left content.

In the existing .lq-v3 .lq-question-panel rule, add:
  padding-left: clamp(16px, 8vw, 24px);

This ensures the prompt text and sequence items start with enough
clearance from the left edge that the character doesn't obscure them.

At 375px: 8vw = 30px — enough to clear any overflow from the character
At 600px+: resolves to max 24px — no visible change on desktop

FIX B2 — Sequence item breathing room inside the panel

The sequence strip (.lq-sequence) uses gap: clamp(8px, 2vw, 14px).
At 375px that's 7.5px — too tight.

Inside the existing @media (max-width: 400px) block, add:

  .lq-v3 .lq-question-panel {
    padding: 14px 14px 12px;
  }
  .lq-v3 .lq-sequence {
    gap: 6px;
  }
  .lq-v3 .lq-seq-item {
    width:  clamp(52px, 13vw, 58px);
    height: clamp(52px, 13vw, 58px);
  }

This slightly shrinks sequence items in v3 at narrow widths to give
the strip more breathing room within the panel.

FIX B3 — Answers panel clearance from character

The answers panel (.lq-v3 .lq-answers-panel) sits below the question
panel. At 375px with a tall character peeking in from the left,
the bottom-left of the answers panel can be obscured.

In the existing @media (max-width: 400px) block, also add:

  .lq-v3 .lq-answers-panel {
    padding-left: clamp(14px, 7vw, 20px);
  }

FIX B4 — Character size cap on very small screens

The character image in lq-v3 has max-width: min(30vw, 170px).
At 375px that's 112px — fine. But at 320px (older iPhones, Galaxy A
series) that's 96px which still overlaps.

In the existing @media (max-width: 400px) block, also add:

  .lq-v3 > .lq-char img {
    max-width: min(26vw, 130px);
    max-height: min(40vh, 220px);
  }


ACCEPTANCE CRITERIA:
  [ ] abc-match-game.css: .am-layout uses clamp() for gap and padding
  [ ] abc-match-game.css: .am-tile has min-height: 80px
  [ ] abc-match-game.css: .am-tile-emoji uses clamp()
  [ ] abc-match-game.css: reduced-motion block added
  [ ] abc-match-game.css: @media (max-width: 374px) override block added
  [ ] adventure-screen.css: .lq-v3 .lq-question-panel has padding-left clamp
  [ ] adventure-screen.css: lq-v3 overrides added inside @media (max-width: 400px)
  [ ] No lq-v1, lq-v2, or lq-theme-* rules changed
  [ ] No JS files changed
  [ ] No class names added or removed
  [ ] npm test passes

REFERENCE FILES (read, do not edit):
- assets/css/abc-match-game.css       (full file)
- assets/css/adventure-screen.css     (full file — only touch lq-v3 sections)
- AGENT_PROTOCOL.md Section 14        (mobile-first rules)

TOKEN LIMIT GUIDANCE:
Two CSS files, surgical additions only. No rewrites.
Target under 3000 tokens total. Do not expand scope beyond
the fixes listed above.
```

---

## Overseer Gate 2 Checklist

```
REVIEW CHECKLIST — OP 6:
  ☐ abc-match-game.css: .am-layout updated with clamp() values
  ☐ abc-match-game.css: .am-tile min-height: 80px present
  ☐ abc-match-game.css: .am-tile-emoji uses clamp(2rem, 7vw, 2.6rem)
  ☐ abc-match-game.css: @media (max-width: 374px) block exists
  ☐ abc-match-game.css: prefers-reduced-motion block added at end
  ☐ adventure-screen.css: padding-left clamp added to lq-question-panel
  ☐ adventure-screen.css: @media (max-width: 400px) lq-v3 blocks added
  ☐ adventure-screen.css: NO lq-v1 / lq-v2 / lq-theme rules changed
  ☐ No JS files touched
  ☐ npm test passes
  ☐ Mentally traced layout at 375px for both games — no overflow
```

---

## Manual QA After Deploy (Devin Does This On iPhone)

```
ABC MATCH — on iPhone Safari at 375px:
  [ ] Alien + bubble + grid + round label all visible without scrolling
  [ ] All 4 tiles fully visible and tappable with a finger
  [ ] Letter chip is readable inside the bubble
  [ ] Tapping a wrong tile shows red shake — no layout jump
  [ ] Tapping a correct tile shows green + chip flies smoothly

PATTERN QUEST — on iPhone Safari at 375px:
  [ ] Sequence items are not obscured by the character on the left
  [ ] All 3 answer cards are fully visible and tappable
  [ ] Question panel text is readable (not hidden behind character)
  [ ] Progress dots visible at bottom
  [ ] Test on at least 2 worlds (Space + Candy Land)
```

---

*Brief status: APPROVED by Devin. Ready to execute next session.*
*Overseer: Start next session by saying "Read the protocol" then pull this brief.*
