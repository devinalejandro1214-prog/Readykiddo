# ReadyKiddo 2.0 — Architecture & Build Status

**Last Updated:** 2026-06-07  
**Status:** Phase 3 Complete ✅ | Phase 4 Planned 🎯

---

## Executive Summary

ReadyKiddo 2.0 is a COPPA-compliant early learning app (ages 3–5) with 10 educational games, Supabase auth, and Zoey AI advisor powered by Gemini 2.5 Flash. The app separates child and parent experiences through test mode and smart routing.

---

## Phase Status

| Phase | Feature | Status | Notes |
|-------|---------|--------|-------|
| **1** | Supabase schema + auth | ✅ Complete | Tables: profiles, children, game_sessions; RLS enabled |
| **1** | supabase-client.js | ✅ Complete | Shared init + helper API (RK namespace) |
| **1** | auth.html | ✅ Complete | COPPA signup + login + child profile setup |
| **2** | dashboard.html | ✅ Complete | Parent progress tracker, warm design system |
| **2** | Game session hooks | ✅ Complete | All 10 games wired; test mode logs to console |
| **3** | zoey-client.js | ✅ Complete | Client wrapper for Zoey API |
| **3** | netlify/functions/zoey.js | ✅ Complete | Gemini 2.5 Flash proxy with COPPA scrubbing |
| **3** | Zoey chat UI | ✅ Complete | Full Alpine.js chat component in dashboard |
| **4** | Landing page overhaul | 🎯 Planned | Remove Resume, smart routing |
| **4** | Child home (child-home.html) | 🎯 Planned | Child-friendly hub with star progress |
| **4** | Zoey child companion | 🎯 Planned | Scripted (no API), animated guide |
| **4** | Item library system | 🎯 Planned | Themed cosmetics for game personalization |
| **4** | Admin console | 🎯 Planned | Game jump, bug reporter, analytics |

---

## Architecture Overview

```
readykiddo.com
├── index.html (landing)
│   ├── [child session] → child-home.html → games
│   └── [no session] → auth.html → dashboard.html
│
├── Assets Layer
│   ├── CSS (design system, themes)
│   ├── Games (10 vanilla JS class-based)
│   └── JS helpers (Supabase, Zoey, auth)
│
├── Server Layer (Netlify Functions)
│   └── /api/zoey → Gemini 2.5 Flash proxy
│
└── Data Layer (Supabase)
    ├── auth.users (Supabase managed)
    ├── profiles (parent metadata)
    ├── children (child profiles)
    └── game_sessions (completion log)
```

---

## File Structure & Locations

### Root Pages

```
index.html                    # Landing / smart router
auth.html                     # Sign in, sign up, child setup (COPPA)
dashboard.html                # Parent dashboard + Zoey chat
test-login.html               # Dev bypass; sets sessionStorage
zoey-demo.html                # Standalone pitch demo (7 animated scenes)
child-home.html               # [PLANNED] Child hub with progress
game-loader.html              # Game selector (existing, untouched)
```

### Assets

```
assets/js/
├── supabase-client.js         # Shared Supabase init + RK API
├── zoey-client.js             # Zoey.ask() wrapper
├── games/
│   ├── color-sort-game.js     # ✅ Hook added
│   ├── number-matching-game.js # ✅ Hook added
│   ├── shape-recognition-game.js # ✅ Hook added
│   ├── abc-match-game.js      # ✅ Hook added
│   ├── space-pattern-game.js  # ✅ Hook added
│   ├── space-defender-game.js # ✅ Hook added (no await)
│   ├── feed-alien-game.js     # ✅ Hook added
│   ├── number-line-game.js    # ✅ Hook added
│   ├── feed-by-sound-game.js  # ✅ Hook added (async arrow)
│   └── draw-it-game.js        # ✅ Hook added
└── [PLANNED] theme-loader.js  # Item library CSS swapper

assets/css/
├── onboarding.css             # Warm design system (existing)
├── [PLANNED] themes/           # Per-theme CSS files
│   ├── coral-reef.css
│   ├── jungle.css
│   └── ...
```

### Server (Netlify)

```
netlify/
├── functions/
│   └── zoey.js                # Gemini 2.5 Flash API proxy
└── netlify.toml               # Redirects /api/* → /.netlify/functions/:splat
```

### Database

```
supabase/schema.sql            # DDL: tables, RLS, trigger
```

---

## Key Implementation Details

### 1. Supabase Integration

**Tables:**
- `profiles` — parent account metadata (UUID, email, created_at)
- `children` — child profile (id, parent_id, name, age_range, avatar, theme, created_at)
- `game_sessions` — completion log (child_id, game_id, completed, attempts, time_spent_sec, score, played_at)

**RLS (Row-Level Security):**
- Users can only read/write their own children
- Game sessions are read by parent auth context

**Auto-Profile Trigger:**
- When new Supabase auth user is created, auto-insert into profiles table

**Setup Steps:**
1. Run SQL Step 1: CREATE TABLEs
2. Run SQL Step 2: RLS policies + trigger

### 2. Auth Flow (Parent)

```
index.html "Get Started"
    ↓
auth.html (Alpine.js modal carousel)
    ├── View 1: Login (email + password)
    ├── View 2: Sign up (email + password + COPPA checkbox)
    └── View 3: Child setup (name + age_range 3-4/4-5 + avatar)
    ↓
Supabase creates auth.user → profiles auto-trigger
    ↓
sessionStorage.setItem('rk_child', {...})
sessionStorage.setItem('rk_user', {...})
    ↓
dashboard.html
    ↓
window.RK.requireAuth() checks Supabase session
    ↓
dashApp loads child + game_sessions + completedIds
    ↓
Zoey available with child context
```

### 3. Auth Flow (Child — Test Mode)

```
test-login.html
    ↓
sessionStorage.setItem('rk_test_mode', 'true')
sessionStorage.setItem('rk_child', { id, name, age_range, avatar, _testMode: true })
sessionStorage.setItem('rk_user', { id, email })
    ↓
dashboard.html OR child-home.html
    ↓
window.RK.requireAuth() detects rk_test_mode flag
    ↓
Returns mock user object (no Supabase call)
    ↓
Game sessions logged to console only (skips Supabase insert)
```

**Key:** `logGameSession()` checks `child._testMode || rk_test_mode === 'true'` and logs to console instead of DB.

### 4. Game Session Logging

**Hook Pattern (in all 10 games):**
```js
// Before showCelebration() or goToNextGame():
if (window.RK?.logGameSession) {
  await window.RK.logGameSession('game-id', { attempts: ATTEMPTS_VAR });
}
```

**Special Cases:**
- `space-defender-game.js` — non-async game loop; hook is fire-and-forget (no `await`)
- `feed-by-sound-game.js` — click handler wrapped in `async () => {}`

**Attempts variables used per game:**
- `number-matching`, `number-line`: `this.performance.wrongAttempts`
- `feed-alien`: `this.currentRound`
- Others: literal `1`

### 5. Zoey AI (Parent Facing)

**Client-side (`zoey-client.js`):**
```js
window.Zoey.ask(message, completedIds)
  ↓
POST /api/zoey
  {
    message: "What activities help with numbers?",
    childContext: {
      ageRange: "4-5",
      completedGames: ["color-sort", "number-matching"],
      totalSessions: 2
    }
  }
  ↓
Returns { reply: "..." }
```

**Server-side (`netlify/functions/zoey.js`):**
- Reads `process.env.GEMINI_API_KEY` (set in Netlify env vars, NEVER in code)
- Builds system prompt with child context (name scrubbed for COPPA)
- Calls Gemini 2.5 Flash REST API
- `generationConfig: { maxOutputTokens: 256, temperature: 0.7, topP: 0.9 }`
- Safety settings: `BLOCK_MEDIUM_AND_ABOVE` for all harm categories
- Handles 429 rate limit gracefully
- Returns reply or error

**COPPA Data Scrubbing:**
- Child **name** is NOT sent to Gemini API
- System prompt refers to "your child" only
- Parent sees real name in UI (dashboard) but Google never does

**Cost (Free Tier):**
- Gemini 2.5 Flash free tier = ~$0 per month at typical usage (tens of requests)
- When paid: $0.075 per 1M input tokens

### 6. Dashboard (`dashboard.html`)

**Alpine.js Components:**
- `dashApp()` — auth guard, child load, progress tracker
- `zoeyChat()` — message history, typing indicator, auto-scroll

**Features:**
- Child hero card with avatar + age stamp
- Progress pills (game list with ✓ Done / Not yet badges)
- Zoey chat section with 4 starter prompts
- Sign out button

**Warm Design System:**
- Background: paper gradient (warm orange + cool blue radials)
- Fredoka font (bodies) + Caveat font (display)
- Brand mark: rotated orange star
- Button primary: orange gradient
- Selected states: `#fff4d8` background + orange border

### 7. Test Mode Architecture

**Bypass without Supabase:**
- `test-login.html` sets sessionStorage flags
- `requireAuth()` detects `rk_test_mode === 'true'` and returns mock user
- `logGameSession()` detects `_testMode` flag and logs to console only
- Game hooks execute but DB writes are skipped
- Perfect for local dev + testing without Supabase writes

**Console Output Example:**
```
[ReadyKiddo TEST] logGameSession → game:color-sort
{ child: 'Test Kid', completed: true, attempts: 1, timeSec: 0 }
```

---

## Deployment & Environment

### Netlify Setup

- **Site:** readykiddo.com
- **Site ID:** d2a1a8ee-a5ba-4c40-9cbb-6963b835897d
- **Build:** Automatic git sync (main branch)
- **Redirects:** `/api/*` → `/.netlify/functions/:splat`

### Environment Variables (Netlify Dashboard)

```
GEMINI_API_KEY = <your Google AI Studio API key>
```

**To get the key:**
1. Go to aistudio.google.com
2. Click "Get API key"
3. Create new key in any project
4. Copy + paste into Netlify Dashboard → Site → Environment variables

### Git Workflow

```
# Commit locally
git add files...
git commit -m "..."

# Push (using PAT for multi-account):
git push https://devinalejandro1214-prog:YOUR_PAT@github.com/devinalejandro1214-prog/Readykiddo.git main

# Deploy (manual trigger in Netlify)
Netlify Dashboard → Deploys → Trigger deploy
```

**No auto-deploy on git push** — must manually trigger in Netlify UI.

---

## Design System

### Colors

```css
--ready-blue:     #09395f
--ready-blue-2:   #0b5f95
--ready-orange:   #f28c18
--ready-orange-2: #ffb23e
--paper:          #fff7e8
--ink:            #102338
--muted:          #45596b
--green:          #22c55e
```

### Fonts

- **Body:** Fredoka (400, 500, 600, 700)
- **Display:** Caveat (600, 700)
- **Source:** Google Fonts CDN

### Backgrounds

```css
radial-gradient(120% 80% at 50% -10%, rgba(255,178,62,0.22), transparent 60%),
radial-gradient(80% 60% at 100% 110%, rgba(11,95,149,0.18), transparent 60%),
linear-gradient(180deg, #f6e9c8 0%, #f1d9a2 100%)
```

### Components

- Cards: white, rounded, subtle shadow, warm padding
- Buttons: orange gradient primary, blue secondary
- Selected states: warm highlight (`#fff4d8`) + orange border
- Pips (progress indicators): `30px wide, 6px border-radius` (rectangles, not circles)

---

## Current Live Testing

### Happy Path (Test Mode)

1. Navigate to `https://readykiddo.com/test-login.html`
2. Set child name, age, avatar
3. Select destination: "Dashboard" or "Home" or game name
4. Click "Enter Test Session →"
5. Lands in target page with session set
6. Game hooks log to browser console (no Supabase writes)
7. Dashboard loads with mock completedIds (empty on first test)

### Parent Flow (Real Auth)

1. Navigate to `https://readykiddo.com`
2. Click "Get Started"
3. Sign up (COPPA consent required)
4. Set child profile
5. Redirected to dashboard
6. Chat with Zoey; ask about child's progress
7. Zoey responds with real Gemini advice

### Zoey API Direct Test

```javascript
const res = await fetch('https://readykiddo.com/api/zoey', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: 'What activities help with number recognition?',
    childContext: { ageRange: '4-5', completedGames: ['color-sort'], totalSessions: 1 }
  })
});
const data = await res.json();
console.log(data.reply); // Gemini response
```

**Status:** ✅ 200 OK, Gemini 2.5 responding live

---

## Phase 4 — Next Steps

### 4A: Landing Page Overhaul

**Changes:**
- Remove "Resume Jungle" button (auth flow owns navigation now)
- Smart router: if `rk_child` exists → show "Welcome back [name]! Play now →"
- If no session → two buttons: "Get Started" (auth) + "Parent Login" (auth)
- Onboarding animation plays on first visit only (check sessionStorage flag)

**Files to update:**
- `index.html` — router logic + conditional rendering
- Update onboarding so it chains into auth instead of dead-ending

### 4B: Child Home (`child-home.html`)

**New file:** Child-friendly hub (full-screen, no text except names)

**Features:**
- Large avatar (tap to... stay? no interaction)
- "Hi Maya! Ready to play? 🚀" (Caveat font, big)
- Star progress (visual stars for completed games, not numbers)
- "Play Games" button → game-loader
- Small padlock icon (corner) → "View Parent Dashboard" (tap to open parent dashboard, optional PIN)

**Design:**
- Inherit warm paper gradient + brand mark
- Large colorful buttons
- Animated Zoey mascot (waves, blinks) — scripted messages only, no API

### 4C: Zoey Child Companion

**Scope:** Animated character in game-loader, between games

**Behavior (scripted, no API):**
- After game completes: Zoey appears with pre-written message
- Rules (hardcoded):
  - "You're on fire! 🔥" if 3+ games done today
  - "Want to try something harder?" if same difficulty 5+ times
  - "Great job! Take a break?" if 30+ min played
  - "Let's try colors next?" based on completion order

**No child data leaves device** — all logic local, all text pre-written

**Implementation:**
- `assets/js/zoey-companion.js` — script only, CSS animations
- Insert into game-loader.html as optional modal/overlay

### 4D: Parent ↔ Child Handoff

**Parent dashboard:**
- Add "Hand to Child →" button
- Opens child-home.html in same session
- Parent can tap padlock to come back to dashboard

**Child home:**
- Padlock icon (top right corner) tappable
- Confirmation: "Hand back to parent? Tap padlock again to confirm."
- Returns to dashboard.html

**Optional enhancement:**
- 4-digit PIN to prevent kids from accessing parent dashboard
- Parent sets PIN during child setup
- PIN entry on second padlock tap

---

## Phase 4 — Item Library System

### Concept

**Goal:** Personalize game visuals without changing mechanics. Children unlock themed cosmetics based on progress.

**Components:**
1. **Item Library** (JSON) — 5–8 themed packs, each with 10–15 cosmetic items
2. **CSS Themes** — Per-pack stylesheets (colors, gradients, fonts)
3. **Zoey Curation** — AI recommends packs based on child progress
4. **Theme Switcher** — One-line CSS class change applies entire theme to all games

### Sample Themes

```
🌊 Coral Reef   (blues, teals, fish, calm)
🌳 Jungle       (greens, oranges, vines, vibrant)
🍭 Candy Land   (pinks, purples, sweets, playful)
🌙 Night Sky    (deep purples, stars, midnight mode)
🦕 Dinosaur     (browns, greens, prehistoric, adventure)
```

### Per-Pack Items

Example: Coral Reef pack
```json
{
  "id": "coral-reef",
  "name": "🌊 Coral Reef",
  "colors": {
    "--primary": "#1B8A96",
    "--accent": "#FF6B6B",
    "--bg": "#E8F4F8"
  },
  "items": [
    { "id": "bubbles-bg", "name": "Bubbles", "type": "background-animation" },
    { "id": "fish-mascot", "name": "Fish Friend", "type": "character" },
    { "id": "sea-sound", "name": "Ocean Waves", "type": "audio-theme" }
  ],
  "unlockAt": "5 games completed",
  "recommendedFor": "visual learners, color explorers"
}
```

### Zoey Curation Rules

```json
{
  "condition": "completedCount >= 5 && !hasUnlockedCoral",
  "action": "recommend",
  "pack": "coral-reef",
  "message": "I noticed you've completed 5 games! 🎉 Want to try the Coral Reef theme? It's calming and beautiful. 🌊"
}
```

### Implementation Steps

1. **Generate item library** (GenAI task) — 5–8 packs, ~100 items total
2. **Build CSS theme files** — One CSS file per pack with CSS custom properties
3. **Create theme-loader.js** — Swaps CSS classes to apply theme globally
4. **Wire to dashboard** — Show theme selector; store choice in children.theme column
5. **Wire to game-loader** — Load active theme on page init

---

## Tasks for Delegation

### To Codex / Anti-Gravity / Another LLM

**Task 1: Item Library Generator**
- **Input:** Framework brief (in ARCHITECTURE.md Phase 4 section)
- **Output:** JSON file with 5–8 themed packs, 50–120 items, Zoey curation rules
- **Files to create:** `assets/data/item-library.json`

**Task 2: CSS Themes from Library**
- **Input:** item-library.json
- **Output:** One CSS file per theme with CSS custom properties (--primary, --accent, etc.)
- **Files to create:** `assets/css/themes/*.css`

**Task 3: Landing Page Router**
- **Input:** Current index.html + logic specs (Phase 4A)
- **Output:** Updated index.html with smart sessionStorage detection + conditional rendering
- **Files to update:** `index.html`

**Task 4: Child Home Page**
- **Input:** Design system (warm, Fredoka + Caveat, brand mark) + features list (Phase 4B)
- **Output:** New HTML page (Alpine.js for progress stars + button states)
- **Files to create:** `child-home.html`

**Task 5: Zoey Child Companion**
- **Input:** Scripted message rules (Phase 4C) + CSS animation specs
- **Output:** JS script + CSS for modal overlay
- **Files to create:** `assets/js/zoey-companion.js` + styles in dashboard.html

---

## Known Constraints

- **No npm/build step** — all vanilla JS, CDN-loaded libraries only
- **COPPA compliance** — no child data to external APIs, parental consent required
- **Test mode** — sessionStorage-based bypass for local dev, no Supabase writes
- **Deploy manual** — Netlify requires manual "Trigger deploy" click; git push alone won't deploy
- **No auth header in games** — games are standalone classes; they don't know about login
- **Assets large** — ~306MB; zip-and-build not viable

---

## Support Resources

- **Supabase Docs:** https://supabase.com/docs
- **Alpine.js:** https://alpinejs.dev
- **Gemini API:** https://ai.google.dev/gemini-api
- **Netlify Functions:** https://docs.netlify.com/functions/overview

---

## Quick Reference: Common Commands

```bash
# Test mode (no Supabase needed)
# 1. Open test-login.html
# 2. Set child, pick destination
# 3. Check console for game logs

# Check game hooks
# In browser console while playing:
document.body.textContent.includes('logGameSession') ? 'Found' : 'Not found'

# Direct Zoey API test
curl -X POST https://readykiddo.com/api/zoey \
  -H "Content-Type: application/json" \
  -d '{"message":"Help with colors?","childContext":{"ageRange":"4-5","completedGames":[],"totalSessions":0}}'

# Git push (with PAT)
git push https://devinalejandro1214-prog:TOKEN@github.com/devinalejandro1214-prog/Readykiddo.git main

# Deploy (manual, in Netlify UI)
# Netlify Dashboard → Deploys → Trigger deploy
```

---

## Summary

ReadyKiddo 2.0 is **production-ready for Phase 3** (Supabase auth + Zoey chat working live). Phase 4 (landing, child home, item library, child companion) can be built in parallel by handing off tasks to external LLMs using this document as the source of truth.

All code is vanilla, COPPA-compliant, and requires only a Netlify deployment + Supabase account + Gemini API key.
