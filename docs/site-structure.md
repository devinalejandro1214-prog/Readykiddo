# ReadyKiddo 2.0 — Site Structure & User Flows

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                   ENTRY POINT: index.html                   │
│           (Smart router: detects child session)              │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   NO CHILD SESSION    CHILD SESSION
   (new or logged out) (resuming play)
        │                     │
        ▼                     ▼
   auth.html          child-home.html
   (Signup +          (Play hub)
    COPPA)                  │
        │                   │ [Play button]
        │                   ▼
        │           game-loader.html
        │           (11 games)
        │                   │
        │          ┌────────┴────────┐
        │          ▼                  ▼
        │       [Game]          zoey-companion
        │          │            (celebration)
        │          └────────┬────────┘
        │                   │
        └───────────────────┴─────────────────┐
                                              │
                    ┌─────────────────────────┴─────────────┐
                    ▼                                       ▼
            [PAUSED] onboarding.html              dashboard.html
            Build-Your-World                    (Parent view:
            (5 steps + preview)                  progress, Zoey chat,
                    │                            hand-to-child button)
                    ▼
            world-reveal.html
            (World opening reveal)
                    │
                    ▼
            child-home.html ◄─────────────────────┘
```

---

## 🗂️ File Organization

### Entry & Auth
- **`index.html`** — landing page, smart router
  - Reads `sessionStorage.rk_child`
  - Routes: child session → child-home | no session → auth.html
- **`auth.html`** — email signup/login + COPPA + child profile creation
  - Creates Supabase `auth.users` + `profiles` + `children`
  - Currently routes to `onboarding.html` (Build-Your-World) after signup [PAUSED]

### Onboarding (Build-Your-World)
- **`onboarding.html`** — 5-step flow with live preview
  - Step 1: Child name + parent name + character pick (6 chars)
  - Step 2: Age group (3–4 / 4–5)
  - Step 3: World (Space, Jungle, Beach, Castle, Studio, Candy Land)
  - Step 4: Vibe (Cozy, Exciting, Magical, Silly, Brave)
  - Step 5: Costume style (Plain, Hero, Explorer, Wizard, Artist, Scientist)
  - Saves `userProfile` to localStorage
  - Confetti + toast on completion
  - Routes to `world-reveal.html`
- **`world-reveal.html`** — world opening animation + hero portrait
  - Reads `userProfile` from localStorage
  - Shows the built world with character + vibe
  - "Start" button → game-loader (or can resume saved game)

### Child Experience
- **`child-home.html`** — main play hub
  - Guards: requires `rk_child` in sessionStorage (redirects to auth if missing)
  - Shows: Zoey avatar, child greeting, progress stars, "Let's Play!" button
  - Routes: Play button → game-loader.html | Padlock → dashboard.html
  - **Fixed in audit:** now scrollable in landscape (was clipped)
- **`game-loader.html`** — game shell + rotator guard
  - Loads one of 11 games via `?game=` param (e.g., `?game=color-sort`)
  - Game runs inside the shell
  - **Fixed in audit:** shows "Turn me upright!" overlay on short landscape phones
  - Zoey companion overlay appears 800ms after game completes (confetti on milestones)
  - Routes back to child-home on completion

### Games (11 total)
All load via `game-loader.html?game=<slug>`:
1. `shape-recognition-game.js` — find shapes by color
2. `color-sort-game.js` — drag colors to buckets
3. `number-matching-game.js` — match quantities
4. `abc-match-game.js` — letter recognition
5. `space-pattern-game.js` — repeat patterns
6. `space-defender-game.js` — click/tap to shoot + dodge
7. `feed-alien-game.js` — drag items to feed alien (counting)
8. `number-line-game.js` — place numbers on a line
9. `feed-by-sound-game.js` — listen & match letter sounds
10. `draw-it-game.js` — trace/draw shapes
11. `game-candyland.html` — full candy-themed game

### Parent Experience
- **`dashboard.html`** — parent dashboard (logged in)
  - Shows child's progress (completed games + stars)
  - Zoey chat widget (calls `/api/zoey` → Gemini 2.5 Flash proxy)
  - "Hand to Child" button → sets `rk_child` session + routes to child-home
  - Parent can sign out (clears Supabase session + sessionStorage)

---

## 🔌 Backend & APIs

### Database (Supabase)
**Tables:**
- `profiles` — auth users (id, email, created_at)
- `children` — per-child account (id, parent_id, name, age_range, avatar, theme, **character, vibe, style** [to be added])
- `game_sessions` — per-game completion (id, child_id, game_id, completed, attempts, time_spent_sec, score, played_at)

**RLS:** Row-level security enforces parent_id = auth.uid()

### Netlify Functions
- **`netlify/functions/zoey.js`** — Gemini 2.5 Flash proxy
  - Receives: child_id, completed_game_ids, user_message
  - Scrubs child name (COPPA)
  - Calls Gemini API
  - Returns: text reply
  - **Env var:** `GEMINI_API_KEY` (set in Netlify Dashboard)

---

## 🎨 Assets & Config

### Character & Personalization
- **Characters:** Mica, Aria, Trish, Steven, Emmett, Amelia (6 total)
- **Worlds:** Space, Jungle, Beach, Castle, Studio, Candy Land (6 total)
- **Vibes:** Cozy, Exciting, Magical, Silly, Brave (5 total)
- **Costumes:** Plain, Hero, Explorer, Wizard, Artist, Scientist (6 total)
- **Avatar:** Em, Aria, Trish (3 default voice characters)

### Audio
- **Voice clips:** teacher directions, character praise, sound letters (character-specific)
- **SFX:** space-defender laser/hit/destroyed
- **Theme:** loop, volume 0.35, autoplay + tap fallback, iOS unlock pattern
- **Mute state:** localStorage (persistent across sessions)

### Images
```
assets/images/
├── characters/
│   ├── mica/{plain,hero,explorer,wizard,artist,scientist}.png
│   ├── aria/...
│   └── ... (6 characters × 6 costumes)
├── buttons/
│   ├── worlds/{space,jungle,beach,castle,studio,candy-land}.webp
│   ├── vibes/{cozy,exciting,magical,silly,brave}.webp
│   └── styles/{plain,hero,explorer,wizard,artist,scientist}.png
├── world-backgrounds/
│   ├── space/vibes/{cozy,exciting,magical,silly,brave}/background.webp
│   ├── jungle/vibes/...
│   └── ... (6 worlds × 5 vibes)
└── games/items/
    ├── {item-slug}-{color}.png  (color-sort tiles, e.g. star-red.png)
    └── {item-slug}.png          (natural items, e.g. leaf.png)
```

---

## 📱 Client-Side Libraries & State

### Scripts (loaded in order)
- **`supabase-client.js`** — Supabase auth + DB queries, RK.* public API
- **`audio-manager.js`** — RKAudio.* (play, mute, unlock for iOS)
- **`zoey-client.js`** — window.Zoey.ask() wrapper (calls /api/zoey)
- **`zoey-avatar.js`** — `<zoey-avatar>` Web Component (6 states: idle, wave, think, talk, celebrate, encourage)
- **`zoey-companion.js`** — game completion overlay (wraps RK.logGameSession)
- **Game-specific JS:** game-shell.js, game-registry.js, item-data.js, session-manager.js, shape-definitions.js, + one per game

### Session State (sessionStorage)
- **`rk_child`** — active child object (id, name, age_range, avatar, parent_id, _testMode)
- **`rk_test_mode`** — bypass Supabase (dev/testing)
- **`rk_theme_pos`** — theme song playback position

### Persistent State (localStorage)
- **`userProfile`** — onboarding choices (childName, parentName, character, ageGroup, theme, vibe, style)
- **`gameProfile`** — same, but set when starting a game
- **`rk_muted`** — mute state (0 or 1)
- **`{gameId}_progress`** — mid-game save state (varies per game)

---

## 🚦 Current User Flows

### Flow 1: New Parent → Child Play Session
```
1. Parent lands on index.html (no session)
2. Router detects no rk_child → redirects to auth.html
3. Parent signs up (email + password + COPPA checkbox)
4. auth.html creates Supabase account + child profile (name, age, avatar)
5. ✋ PAUSED: should route to onboarding.html here
   Currently: routes to dashboard.html (missing Build-Your-World flow)
6. [After fix] Parent goes through onboarding (picks character, world, vibe, costume)
7. world-reveal.html shows the built world
8. "Start" button routes to game-loader.html?game=color-sort
9. Child plays game
10. zoey-companion overlay celebrates completion
11. Back to child-home.html
```

### Flow 2: Parent Viewing Progress
```
1. Parent logged in → dashboard.html
2. Sees child's progress: games completed, stars, attempt counts
3. Can chat with Zoey (Gemini AI) about child's learning
4. "Hand to Child" button sets session + routes to child-home.html
```

### Flow 3: Child Resuming (from Child Hub)
```
1. Child is in child-home.html
2. Zoey avatar waves hello
3. Child sees progress (lit/dim stars) + "Let's Play!" button
4. Click Play → game-loader.html (picks a game or resumes saved)
5. Game runs, logs session on completion
6. Back to child-home
```

---

## ⚡ Key Decisions & Constraints

| Constraint | Reason |
|---|---|
| No npm/build step | Assets ~306MB; git-based deploy only |
| Vanilla JS + CDN libs | Fast, offline-capable for kids |
| Supabase (not custom backend) | Faster onboarding, RLS for security |
| SVG item generators | Consistent style, color-swappable tiles |
| Netlify Functions for Gemini | Keep API key server-side (COPPA safe) |
| localStorage for onboarding choices | Simple persistence, games read directly |
| sessionStorage for child session | Automatic logout on browser close (parental control) |
| `<zoey-avatar>` Web Component | Single dependency-free implementation across all pages |

---

## 🐛 Known Issues & In-Progress

### Fixed (Mobile Audit)
- ✅ child-home.html Play button unreachable in landscape → added scroll
- ✅ game-loader.html answer tiles clipped in short landscape → added rotate guard

### Paused (User Feedback)
- ⏸️ Build-Your-World onboarding missing from signup flow
  - auth.html signup currently routes to dashboard (should route to onboarding)
  - After onboarding flow, should route to world-reveal, then child-home

### To Do (Phase 5+)
- [ ] Add character/vibe/style columns to children table (schema migration ready)
- [ ] Wire onboarding to save choices to DB (currently localStorage only)
- [ ] Item library full generation (currently SVG stubs + wishlist)
- [ ] Admin console (game jump, analytics, bug reporter)
- [ ] Game personalization (e.g., backgrounds themed to world/vibe choice)

---

## 🎯 How It Maps: The Big Picture

```
PARENT                          CHILD
┌──────────────────┐           ┌──────────────────┐
│  Signup + COPPA  │ ──────→   │ Build Your World │
│   auth.html      │           │  onboarding.html │
└──────────────────┘           └────────┬─────────┘
         │                               │
         │                      [Confetti!]
         │                               │
         ▼                      ┌────────▼─────────┐
┌──────────────────┐           │ World Reveal     │
│  Dashboard       │           │ world-reveal.html│
│  dashboard.html  │           └────────┬─────────┘
│  • Progress      │                    │
│  • Zoey chat     │           ┌────────▼──────────┐
│  • Hand to Child │           │ Child Home        │
│                  │    ←──    │ child-home.html   │
│ "Hand to Child"  │  ──────→  │ • Stars           │
│ button           │           │ • Zoey avatar     │
└──────────────────┘           │ • Play button     │
                               └────────┬──────────┘
                                        │
                        ┌───────────────┴───────────────┐
                        │                               │
                 Play Game                      Padlock→
                 game-loader.html              Dashboard
                 (11 games)
                        │
                        ├─→ [Game running]
                        │
                        └─→ Zoey celebration
                        │
                        └─→ Back to Child Home
```

**Flow summary:**
- Parents own the account (Supabase auth + dashboard)
- Parents onboard a child (Build-Your-World steps)
- Parents "hand" the session to the child (sets sessionStorage, routes to child-home)
- Child plays games, earns stars, Zoey celebrates
- Parents see progress + can chat with Zoey (Gemini) about learning

---

## 📂 Quick File Reference

| Purpose | File |
|---|---|
| Entry | `index.html` |
| Parent auth | `auth.html` |
| Build world | `onboarding.html` |
| World reveal | `world-reveal.html` |
| Child hub | `child-home.html` |
| Game runner | `game-loader.html` |
| Parent view | `dashboard.html` |
| Games | `assets/js/games/{11 files}.js` |
| Supabase | `assets/js/supabase-client.js` |
| Zoey AI | `assets/js/zoey-client.js` + `netlify/functions/zoey.js` |
| Zoey avatar | `assets/js/zoey-avatar.js` |
| Celebration | `assets/js/zoey-companion.js` |
| Audio | `assets/js/audio-manager.js` |
| Styles | `assets/css/style.css` + per-game `.css` |
| DB schema | `supabase/schema.sql` |
