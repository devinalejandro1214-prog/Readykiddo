# ReadyKiddo — Build Plan: Audit → Reality

Two lists: (A) everything we can ship with assets already on disk, (B) everything
that needs new content — plus the art-direction rules for deciding SVG vs generated PNG.

## Asset inventory (verified on disk)

| Asset | Status |
|---|---|
| Characters: 6 chars × 6 costumes PNG | ✅ complete (36/36) |
| World backgrounds: 6 worlds × 5 vibes + base (png+webp) | ✅ complete (73 files) |
| Picker buttons (worlds/vibes/styles) | ✅ complete |
| Game items | ⚠️ 18 natural-color PNGs only — **no color variants exist** |
| Zoey | ✅ SVG web component, 6 animation states |
| Voice clips | ✅ teacher + character praise + letters (per audit) |
| SFX | ⚠️ space-defender only (laser/hit/destroyed) |
| Map art, sticker-book art, share-card frame | ❌ none |

---

## LIST A — Ship with existing content only (pure code/copy)

### Phase A1 — Critical fixes (~1 day)
| # | Item | What to do | Uses |
|---|---|---|---|
| 1 | Funnel dedupe (Issue #2) | auth.html stops creating the child; onboarding owns it. Write real Supabase child id into `userProfile.childId` | code only |
| 2 | Smart Play button (Issue #1) | child-home picks first uncompleted game from `completedIds` (already loaded) and passes `?game=` | code only |
| 3 | Parent gate (Issue #3) | "Hold 3 seconds" overlay on the 🔒 before dashboard.html | code only |
| 4 | Kid-friendly error screen (Issue #5) | Replace world-reveal redirect with Zoey + "Let's try a different game!" → child-home | `<zoey-avatar>` exists |
| 5 | TestPilot guard (Issue #7) | Fabricated profile only when `rk_test_mode` set; else redirect to child-home | code only |
| 6 | Phantom childId fix (Issue #6) | game-shell prefers `rk_child.id` from sessionStorage | code only |

### Phase A2 — Accessibility pass (~half day)
| # | Item | What to do |
|---|---|---|
| 7 | Caption bar (Issue #4) | game-shell renders whatever `speakInstruction()` says as a text strip — all 11 games inherit |
| 8 | Aria pass (Issue #8) | stars-row label ("4 of 11 done"), rotate-guard `role="alert"`, reduced-motion guards on pulse/charRise |

### Phase A3 — "The world follows the child" (~1 day)
| # | Item | Uses existing |
|---|---|---|
| 9 | O1: child-home background = their world×vibe | `world-backgrounds/{w}/vibes/{v}/background.webp` ✅ |
| 10 | O2: their costumed character on home screen | `characters/{char}/{style}.png` ✅ |
| 11 | O3: Zoey remembers (bubble names next game / yesterday's win) | `completedIds` already on page ✅ |
| 12 | O11: themed loading screen (world bg + Zoey + fun line) | backgrounds ✅ |
| 13 | O13: idle Zoey (encourage() after 8s, point at Play) | avatar states ✅ |
| 14 | O17: returning-child hello (character walks in, waves) | character PNGs ✅ |

### Phase A4 — Engagement loop v1 (~2 days)
| # | Item | Uses existing |
|---|---|---|
| 15 | O7: costume unlocks at 3/5/8/11 games | all 36 costume PNGs exist — pure gating logic + zoey-companion milestone hooks |
| 16 | O10: daily quest ("Today's adventure!") | code only |
| 17 | O9: story framing per game ("Zoey's rocket boxes got mixed up!") | copy + speech-synthesis fallback; real voice clips later |
| 18 | O14: kind-mistake choreography (encourage state + warm voice) | avatar states + existing "almost there" clips |
| 19 | O16: dashboard story sentence | game_sessions data exists |
| 20 | O12 (partial): `navigator.vibrate(10)` on taps | free; pop SFX comes in List B |
| 21 | O6 **v1** Adventure map: world background + 11 landmark hotspots using the 18 item PNGs as icons, CSS dotted path, completed ones lit | backgrounds + items ✅ |
| 22 | O15 **v1** share card: canvas composite of character + world bg + "Mia finished 5 adventures!" | both assets exist; logo badge in List B |
| 23 | O4/O5 (foundation): difficulty + parent-goal columns read/write | schema migration already drafted |

---

## LIST B — Must be generated/created

Priority order:

| # | Asset | For | How | Qty |
|---|---|---|---|---|
| 1 | **Color-sort item variants** | the sorting game's 6-color buckets | **SVG** (see balance rules — recolor is free) or GenAI ×6 colors | ~10 items × 6 colors |
| 2 | **Item library expansion** | sticker rewards (O8), feed games, new tiles | split by rule below: SVG for flat/recolorable, GenAI PNG (house-style prompt, `docs/item-generation-prompt.md`) for face/organic | ~80–100 |
| 3 | **SFX pack** | O12 tap pop, soft chime, unlock fanfare, kind "almost!" | source from freesound/zapsplat or generate | ~6 clips |
| 4 | **Adventure map illustrations** | O6 v2 — painterly map per world replacing the v1 overlay | GenAI, same style as world backgrounds | 6 |
| 5 | **Voice clips for new lines** | story framings (O9), unlock announcements (O7) | record/generate per character; speech-synthesis covers the gap | ~30 lines |
| 6 | **Sticker book frame/passport art** | O8 polish | GenAI or CSS v1 first | 1–2 |
| 7 | **Share-card logo badge/frame** | O15 polish | design once | 1 |

---

## ART DIRECTION — the SVG vs Generated-PNG balance

Verdict from what's on disk + what looked good so far:

| Asset class | Winner | Why |
|---|---|---|
| Characters | **Generated PNG** (current set) | Warmth and painterly charm — SVG characters read as corporate clip-art. KEEP, never replace. |
| World backgrounds | **Generated webp** (current set) | Full-screen art needs atmosphere and depth; SVG backgrounds look flat and cheap at that size. KEEP. |
| Game items — recolorable (color-sort tiles) | **SVG** | One file recolors to all 6 game colors with a CSS variable — vs 6 generated PNGs per item that may drift in shape between colors. Crisp at every size, ~2KB each. |
| Game items — "hero" items with faces (alien, gummy, starfish…) | **Generated PNG** (512 transparent, house-style prompt) | Kawaii faces, soft gradients, charm — GenAI does this better than hand-built SVG. |
| UI chrome (buttons, icons, pips, stars) | **SVG / emoji** | Must stay crisp at any DPI; no emotional weight needed. |
| Adventure maps | **Generated PNG** | It's background-class art — same rule as backgrounds. |
| Zoey | **SVG component** (current) | Animation states require vector parts. KEEP. |

**Three rules of thumb:**
1. **Bigger than ~25% of the screen, or needs emotional warmth → generated PNG/webp.**
2. **Needs recoloring, animation, or many sizes → SVG.**
3. **Has a face → generated PNG** (exception: Zoey, who must animate).

The practical payoff: color-sort needs N items × 6 colors. As PNG that's 60+
generations with consistency risk; as SVG it's 10 files + one `fill` variable.
But the alien the child feeds should absolutely be a generated PNG with a
kawaii face. Same library, two pipelines, picked per item by the rules above.

The item wishlist should be tagged accordingly: `[SVG]` for flat/recolorable
sort tiles, `[GEN]` for face/organic hero items.

---

## Suggested sequence

```
Week 1:  A1 critical fixes → A2 a11y → A3 personalization
Week 2:  A4 engagement loop (map v1, unlocks, quests, share card v1)
Parallel: generate List B #1–#3 (color variants, items, SFX) as art tasks
Week 3:  swap v1 → v2 (painterly maps, real SFX, voice lines, sticker book)
```
