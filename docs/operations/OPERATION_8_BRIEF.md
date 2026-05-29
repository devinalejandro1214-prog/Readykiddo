# Op 8 — Age Range Selection: Onboarding → Game Mode Routing
> **Status: READY TO EXECUTE — Next Session**
> Written by: Antigravity (Overseer) | Date: 2026-05-25
> Approved by Devin: ✅ Yes — "I want an option for 3-4 year olds and keep 
> the draggable aspect for 4-5 year olds"

---

## Context & Goal

A 3-4 year old cannot do drag-and-drop. Drag requires fine motor control
that develops around age 4-5. We've already built a two-tap interaction
for Color Sort and Shape Recognition (Op 7, commit 2c97ed2).

This operation adds an **age range selection step** to the onboarding
flow. The child's age group is saved to `localStorage` as part of
`userProfile` and passed into the game context. Games read
`context.ageGroup` and choose tap vs. drag accordingly.

### The Two Modes

| Age Group | Interaction | Games affected |
|-----------|-------------|----------------|
| `3-4`     | Tap only    | Color Sort Round 1, Shape Recognition Round 1, Feed the Alien |
| `4-5`     | Drag-and-drop (original) | Color Sort Round 1, Shape Recognition Round 1, Feed the Alien |

Round 2 of Color Sort and Shape Recognition is always tap — unchanged.

---

## Architecture Decision

**Where the choice is stored:**
`localStorage → 'userProfile' → { ageGroup: '3-4' | '4-5', ...rest }`

**Where the choice is read:**
`game-shell.js` already reads all profile fields from localStorage and
injects them into `context`. Adding `ageGroup` follows the exact same
pattern as `worldSlug`, `characterSlug`, etc.

**How games use it:**
Each affected game reads `this.context.ageGroup`. If `'3-4'`, use the
two-tap handlers. If `'4-5'`, use the original drag handlers.
Both sets of handlers already exist in the files — we're just switching
which one gets wired.

---

## Files to Touch

- `onboarding.html`     — add age step to the step array in HTML (if step config is in HTML)
- `assets/js/onboarding.js`  — add new step `'ageGroup'` to `onboardingSteps[]`
- `assets/js/games/game-shell.js` — read `profile.ageGroup` and inject into context
- `assets/js/games/color-sort-game.js` — switch Round 1 handler based on `context.ageGroup`
- `assets/js/games/shape-recognition-game.js` — same
- `assets/js/games/feed-alien-game.js` — tap-to-feed for 3-4 (tap food item → auto-flies to alien)

## Files NOT to Touch

- `audio-manager.js`
- `game-registry.js`
- Any CSS files (the tap CSS classes we added in Op 7 stay as-is)
- Any world HTML files (game.html, game-loader.html, etc.)
- `AGENT_PROTOCOL.md`, `AGENT_COLLAB_LOG.md`

---

## Agent Brief

```
=== AGENT BRIEF — OP 8 ===

Agent: Codex (JS logic) + Claude (UI step card design)
Operation: Op 8 — Age Range Onboarding + Game Mode Routing
Approved: Yes

PRE-TASK:
1. git fetch origin && git rebase origin/main
2. npm test — must pass before any changes
3. Read AGENT_PROTOCOL.md Section 14 (mobile-first)

════════════════════════════════════════════════════════
PART A — onboarding.js: Add age step
════════════════════════════════════════════════════════

The onboardingSteps array currently has 4 steps:
  setup → theme → vibe → style

Add a new step BEFORE 'theme' (so it becomes step 2 after setup):

  {
      id: 'ageGroup',
      title: 'How old is your explorer?',
      subtitle: 'We\'ll set up the perfect adventure',
      type: 'options',
      options: [
          {
              label: '3–4 Years',
              value: '3-4',
              description: 'Tap to play',
              icon: '🌱'
          },
          {
              label: '4–5 Years',
              value: '4-5',
              description: 'Tap & drag',
              icon: '⭐'
          }
      ],
      nextButtonText: 'Next'
  }

The step order after this change:
  setup → ageGroup → theme → vibe → style

When the child (or parent) selects an age option, store it like all
other steps: `userChoices['ageGroup'] = '3-4'` (or '4-5').

The existing step validation logic at the bottom of onboarding.js
checks `!userChoices[step.id]` before advancing. This new step must
be validated the same way — no advancing without a selection.

The save point at the end already does:
  localStorage.setItem('userProfile', JSON.stringify(userChoices))

So ageGroup will be saved automatically with no extra code needed.

The two option values MUST be exactly '3-4' and '4-5' (the strings
the games will check).

════════════════════════════════════════════════════════
PART B — game-shell.js: Inject ageGroup into context
════════════════════════════════════════════════════════

In initGameContext(), the profile is read from localStorage:
  const profile = JSON.parse(localStorage.getItem('userProfile') || '{}');

The context object is then built with fields like worldSlug,
characterSlug, etc. Add ageGroup to the context:

  ageGroup: profile.ageGroup || '4-5',

Default is '4-5' (drag) so existing sessions without ageGroup set
continue to work exactly as before.

Place it alongside the other profile fields (childName, world, etc.)

════════════════════════════════════════════════════════
PART C — color-sort-game.js: Switch Round 1 by age
════════════════════════════════════════════════════════

Context: Round 1 currently always wires `handleRound1ItemTap` (two-tap).
Round 2 always wires `handleTapSelect`. Both handlers exist untouched.

In renderItems(), change the Round 1 branch:

CURRENT:
  if (!isRound2) {
    item.addEventListener('pointerdown', e => this.handleRound1ItemTap(e, item));
  } else {
    item.addEventListener('pointerdown', e => this.handleTapSelect(e, item));
  }

REPLACE WITH:
  if (!isRound2) {
    const useTap = this.context.ageGroup === '3-4';
    item.addEventListener('pointerdown', useTap
      ? e => this.handleRound1ItemTap(e, item)
      : e => this.startPointerDrag(e, item));
  } else {
    item.addEventListener('pointerdown', e => this.handleTapSelect(e, item));
  }

Also in renderZones(), the zone tap listener is only relevant for 3-4:

CURRENT:
  const isRound1 = this.itemsShown < 6;
  if (isRound1) {
    zone.addEventListener('pointerdown', e => this.handleRound1ZoneTap(e, zone));
  }

REPLACE WITH:
  const isRound1 = this.itemsShown < 6;
  const useTap   = this.context.ageGroup === '3-4';
  if (isRound1 && useTap) {
    zone.addEventListener('pointerdown', e => this.handleRound1ZoneTap(e, zone));
  }

Also in beginRound(), update the Round 1 instruction text:

CURRENT:
  : 'Tap a color!'

REPLACE WITH:
  : (this.context.ageGroup === '3-4' ? 'Tap a color!' : 'Drag each color to its matching bucket!')

Also fix the initial instruction in render() HTML template:
  The default text 'Tap a color!' should become a neutral placeholder.
  Change it to: 'Get ready!'
  (beginRound() overwrites it immediately anyway.)

Also update the cursor on .color-item for 4-5 year olds: the grab
cursor is set in CSS and is always visible. No JS change needed —
the CSS cursor: grab is already there and only matters for mouse users.

════════════════════════════════════════════════════════
PART D — shape-recognition-game.js: Switch Round 1 by age
════════════════════════════════════════════════════════

Exactly parallel to Part C.

In renderChoices(), change the Round 1 branch:

CURRENT:
  if (!isRound2) {
    choice.addEventListener('pointerdown', e => this.handleRound1ChoiceTap(e, choice));
  } else {
    choice.addEventListener('pointerdown', e => this.handleTapSelect(e, choice));
  }

REPLACE WITH:
  if (!isRound2) {
    const useTap = this.context.ageGroup === '3-4';
    choice.addEventListener('pointerdown', useTap
      ? e => this.handleRound1ChoiceTap(e, choice)
      : e => this.startPointerDrag(e, choice));
  } else {
    choice.addEventListener('pointerdown', e => this.handleTapSelect(e, choice));
  }

In renderTargets(), update the target tap listener guard:

CURRENT:
  const isRound1 = this.itemsShown < 6;
  if (isRound1 && !this.matchedShapes.has(shapeName)) {
    target.addEventListener('pointerdown', e => this.handleRound1TargetTap(e, target));
  }

REPLACE WITH:
  const isRound1 = this.itemsShown < 6;
  const useTap   = this.context.ageGroup === '3-4';
  if (isRound1 && useTap && !this.matchedShapes.has(shapeName)) {
    target.addEventListener('pointerdown', e => this.handleRound1TargetTap(e, target));
  }

In beginRound(), update the instruction text:

CURRENT:
  this.updateInstruction(isRound2 ? 'Listen for the shape to match!' : 'Tap a shape!');

REPLACE WITH:
  this.updateInstruction(isRound2
    ? 'Listen for the shape to match!'
    : (this.context.ageGroup === '3-4' ? 'Tap a shape!' : 'Drag each shape to its matching outline!'));

Also fix the initial HTML instruction in render():
  Change 'Tap a shape!' to 'Get ready!'

════════════════════════════════════════════════════════
PART E — feed-alien-game.js: Tap mode for 3-4 year olds
════════════════════════════════════════════════════════

Context: Feed the Alien uses drag-to-mouth. For 3-4 year olds this
should be: tap a food item → it automatically flies to the alien's 
mouth and is counted. No drag needed.

The existing feedFood(ghostEl) method already handles everything after
a food item reaches the mouth: counting, animation, encouragement,
speakCount(), updateCounter(). We just need a new entry point for tap.

CHANGE 1 — In startGame() or the item rendering method, find where
food items get their drag listeners attached. This is in the method
that creates the food basket items (likely renderBasket() or similar).
Check the file first before writing code.

For 3-4 (ageGroup === '3-4'):
  - Remove drag listeners from food items (do NOT attach pointerdown
    for drag)
  - Instead attach: item.addEventListener('pointerdown', e => this.handleFoodTap(e, item))

CHANGE 2 — Add new method handleFoodTap(event, item):

  handleFoodTap(event, item) {
    if (this.busy || this.activeDrag) return;
    event.preventDefault();
    // Create a ghost that flies directly to the mouth — no drag needed.
    // Reuse the existing flyToMouth / feedFood pipeline.
    const ghost = this._createGhost(item);
    document.body.appendChild(ghost);
    this.feedFood(ghost);
    item.style.opacity = '0.35';
    item.style.pointerEvents = 'none';
  }

NOTE: Read feed-alien-game.js carefully before implementing Part E.
Understand how _createGhost or the ghost element is created during drag.
Match the ghost creation to whatever the existing drag pipeline does.
If _createGhost doesn't exist, look at how startDrag() creates the ghost
and replicate just that part (element creation + positioning).

Do NOT refactor feedFood(). Only add handleFoodTap() as a new entry.

════════════════════════════════════════════════════════
PART F — onboarding.html UI (Claude handles this)
════════════════════════════════════════════════════════

Claude's task: Design the age selection step card to look like the
other onboarding cards (same font, glassmorphic card style, animated
entry). Two large tap targets:

  🌱  3–4 Years         ⭐  4–5 Years
  "Tap to play"         "Tap & drag"

Cards should be big (min 120px tall) with the icon large (2rem+),
the age label bold (1.2rem), and the description in a muted subtitle.
Selected state: white border glow, scale(1.04).

This is a UI-only change inside the existing onboarding card rendering
system. Do not change the step config — Codex handles that.


ACCEPTANCE CRITERIA:
  [ ] onboarding.js: 'ageGroup' step added between 'setup' and 'theme'
  [ ] onboarding.js: cannot advance without selecting an age
  [ ] localStorage userProfile includes ageGroup after onboarding
  [ ] game-shell.js: context.ageGroup is set (defaults to '4-5')
  [ ] color-sort Round 1: 3-4 → two-tap, 4-5 → drag
  [ ] shape-recognition Round 1: 3-4 → two-tap, 4-5 → drag
  [ ] feed-alien: 3-4 → tap food → auto-feeds, 4-5 → drag (unchanged)
  [ ] Round 2 of all games: unchanged (always tap)
  [ ] Existing sessions without ageGroup default to 4-5 (no breakage)
  [ ] npm test passes

VERIFICATION STEPS (Overseer does this after Codex delivers):
  1. Open onboarding fresh (clear localStorage) — confirm age step appears
  2. Select 3-4 → complete onboarding → check localStorage.userProfile.ageGroup === '3-4'
  3. Play Color Sort: Round 1 tap works, Round 2 tap works
  4. Select 4-5 → complete onboarding → check ageGroup === '4-5'
  5. Play Color Sort: Round 1 drag works, Round 2 tap works
  6. Play Feed the Alien in both modes
  7. npm test passes
```

---

## Manual QA — Devin Does This On iPhone

```
ONBOARDING QA:
  [ ] Age step appears after character/name setup
  [ ] Both age cards are big enough to tap easily
  [ ] Cannot tap Next without selecting an age
  [ ] Selected card has clear visual feedback (glow/border)

3-4 MODE QA (select 3-4 in onboarding):
  [ ] Color Sort Round 1: tap item → glows, tap bucket → correct
  [ ] Shape Recognition Round 1: tap shape → glows, tap outline → correct
  [ ] Feed the Alien: tap food → flies to mouth automatically
  [ ] No dragging required anywhere

4-5 MODE QA (select 4-5 in onboarding):
  [ ] Color Sort Round 1: drag still works
  [ ] Shape Recognition Round 1: drag still works
  [ ] Feed the Alien: drag still works
  [ ] Everything as it was before Op 7
```

---

*Brief status: APPROVED by Devin.*
*Start next session with "Read the protocol" then pull this brief.*
*Op 4 (audio) and Op 6 (mobile layout) remain queued — do Op 8 first.*
