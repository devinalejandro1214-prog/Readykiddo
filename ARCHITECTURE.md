# ReadyKiddo 2.0 — Architecture & Build Status

**Last Updated:** 2026-06-07
**Status:** Phase 4 Complete ✅ | Phase 5 Planned 🎯

---

## Executive Summary

ReadyKiddo 2.0 is a COPPA-compliant early learning app (ages 3–5) with 10 educational games, Supabase auth, and **Zoey** — a dual-persona AI/companion character. Zoey exists in two modes:

| Mode | Audience | Engine | Purpose |
|------|----------|--------|---------|
| **Zoey AI Advisor** | Parent (dashboard) | Gemini 2.5 Flash via Netlify Function | Answers parent questions about child's progress |
| **Zoey Companion** | Child (games) | Scripted JS — zero API calls | Encouragement overlay after each game completes |

The two modes share the same visual character but are completely separate systems. No child data ever reaches an external API.

---

## Phase Status

| Phase | Feature | Status | Notes |
|-------|---------|--------|-------|
| **1** | Supabase schema + auth | ✅ Complete | Tables: profiles, children, game_sessions; RLS enabled |
| **1** | supabase-client.js | ✅ Complete | Shared init + helper API (RK namespace) |
| **1** | auth.html | ✅ Complete | COPPA signup + login + child profile setup |
| **2** | dashboard.html | ✅ Complete | Parent progress tracker, warm design system |
| **2** | Game session hooks | ✅ Complete | All 10 games wired; test mode logs to console |
| **3** | zoey-client.js | ✅ Complete | Client wrapper for Zoey AI API |
| **3** | netlify/functions/zoey.js | ✅ Complete | Gemini 2.5 Flash proxy + COPPA name scrubbing |
| **3** | Zoey chat UI | ✅ Complete | Full Alpine.js chat in parent dashboard |
| **4A** | Landing page router | ✅ Complete | Smart session detection; Resume button removed |
| **4B** | child-home.html | ✅ Complete | Child hub: stars, greeting, play button, padlock |
| **4C** | Zoey child companion | ✅ Complete | Scripted overlay in game-loader; SVG placeholder ready |
| **4D** | Parent ↔ child handoff | ✅ Complete | "Hand to Child" on dashboard; padlock on child home |
| **5** | Item library + themes | 🎯 Planned | Themed cosmetic packs; Zoey curates recommendations |
| **5** | Admin console | 🎯 Planned | Game jump, bug reporter, analytics |

---

## Architecture Overview

```
readykiddo.com
│
├── index.html  (smart landing)
│   ├── [rk_child in sessionStorage] → button: "Play as [name] 🎮" → child-home.html
│   └── [no session]                 → button: "Start your journey" → auth.html
│                                       link:   "Parent Login"      → auth.html
│
├── auth.html          Sign up / login / child profile (COPPA)
│   └──────────────────────────────────────────────────────→ dashboard.html
│
├── dashboard.html     Parent hub
│   ├── Zoey AI chat (Gemini 2.5 Flash via /api/zoey)
│   ├── Progress tracker (game_sessions from Supabase)
│   └── "Hand to Child 🧒" ────────────────────────────────→ child-home.html
│
├── child-home.html    Child hub
│   ├── Zoey character (SVG placeholder)
│   ├── Speech bubble (scripted)
│   ├── Star progress row
│   ├── "Let's Play! 🚀" ──────────────────────────────────→ game-loader.html
│   └── 🔒 padlock ─────────────────────────────────────────→ dashboard.html
│
├── game-loader.html   Game runner
│   ├── Loads supabase-client.js  (session + hooks)
│   ├── Loads zoey-companion.js   (scripted overlay)
│   └── [game completes] → logGameSession → Zoey companion appears
│
└── Server / Data
    ├── Netlify Function: /api/zoey  (Gemini 2.5 Flash proxy)
    └── Supabase: profiles, children, game_sessions
```

---

## File Structure

### Root Pages

```
index.html          Landing — smart router (child session vs new visitor)
auth.html           Parent sign in / sign up / COPPA / child profile setup
dashboard.html      Parent hub: progress, Zoey AI chat, handoff button
child-home.html     Child hub: greeting, stars, play button, padlock
test-login.html     Dev bypass — sets sessionStorage, no Supabase needed
game-loader.html    Game runner — loads all games via URL param
zoey-demo.html      Standalone pitch demo (7 animated scenes, no auth)
ARCHITECTURE.md     This file
```

### JavaScript

```
assets/js/
├── supabase-client.js      Supabase init + window.RK helper API
├── zoey-client.js          window.Zoey.ask() — calls /api/zoey
├── zoey-companion.js       Scripted child companion overlay (no API)
├── main.js                 Landing smart router
├── audio-manager.js        Background music + SFX
├── feedback-widget.js      In-app feedback form
└── games/
    ├── color-sort-game.js          ✅ logGameSession hook
    ├── number-matching-game.js     ✅ logGameSession hook
    ├── shape-recognition-game.js   ✅ logGameSession hook
    ├── abc-match-game.js           ✅ logGameSession hook
    ├── space-pattern-game.js       ✅ logGameSession hook
    ├── space-defender-game.js      ✅ logGameSession hook (fire-and-forget)
    ├── feed-alien-game.js          ✅ logGameSession hook
    ├── number-line-game.js         ✅ logGameSession hook
    ├── feed-by-sound-game.js       ✅ logGameSession hook (async arrow)
    ├── draw-it-game.js             ✅ logGameSession hook
    ├── game-shell.js               GameShell context API
    ├── game-registry.js            Game routing
    ├── session-manager.js          Session tracking
    ├── item-data.js                Game item definitions
    └── shape-definitions.js        Shape data
```

### CSS

```
assets/css/
├── style.css               Landing page styles + parent-login-link
├── onboarding.css          Warm design system (shared tokens)
├── audio.css               Mute button
├── feedback.css            Feedback widget
├── session-manager.css     Session UI
├── [PLANNED] themes/       Per-theme CSS files (Phase 5)
│   ├── coral-reef.css
│   ├── jungle.css
│   └── ...
└── [game-specific].css     One per game
```

### Server

```
netlify/
├── functions/
│   └── zoey.js             Gemini 2.5 Flash API proxy (COPPA-safe)
└── netlify.toml            Redirects: /api/* → /.netlify/functions/:splat
```

### Database

```
supabase/schema.sql         DDL: CREATE TABLEs, RLS policies, auto-profile trigger
```

---

## Zoey — Full Character Spec

Zoey is ReadyKiddo's mascot and AI advisor. She appears in two completely separate contexts.

---

### Zoey Persona 1: Parent AI Advisor (dashboard.html)

**What she does:**
Answers parent questions about their child's learning progress, suggests offline activities, explains developmental milestones, and recommends next games — all grounded in the child's actual completion data.

**Technology:**
- Client: `window.Zoey.ask(message, completedIds)` → `POST /api/zoey`
- Server: `netlify/functions/zoey.js` → Gemini 2.5 Flash REST API
- Model string: `gemini-2.5-flash`
- Response length: `maxOutputTokens: 256` (2–4 sentences, parent-friendly)

**System prompt context sent to Gemini:**
```
- Age range: [child age_range from Supabase]
- Games completed (N of 11): [list of game IDs]
```

**What is NOT sent to Gemini (COPPA):**
- Child's name — system prompt says "your child" only
- Any parent email or identifying info
- Session timestamps or behavioral data

**Behavior rules baked into system prompt:**
- Keep responses to 2–4 sentences (parents are busy)
- Never suggest increasing screen time
- Refer medical/clinical concerns to pediatrician
- Reference specific completed games when relevant

**COPPA compliance note:**
Free tier of Gemini uses data to improve Google products. Child name is scrubbed before any API call. When you move to paid tier, set billing in Google AI Studio — the `GEMINI_API_KEY` env var in Netlify stays the same, just billing is activated.

**Dashboard chat UI (Alpine.js `zoeyChat()` component):**
- 4 starter prompts shown before first message
- Typing indicator (3 animated dots) while Gemini responds
- Auto-scrolling message history
- Auto-resizing textarea (max 120px height)
- Enter = send, Shift+Enter = new line
- Error messages displayed inline if API fails

---

### Zoey Persona 2: Child Companion (game-loader.html)

**What she does:**
Appears as an animated overlay after each game completes with a scripted encouraging message. Celebrates milestones with confetti. Prompts the child to keep playing.

**Technology:**
- `assets/js/zoey-companion.js` — pure vanilla JS, zero API calls
- Hooks into `window.RK.logGameSession` by wrapping it after page load
- All messages are pre-written strings, chosen by a simple counter rule
- Fully COPPA-safe: nothing leaves the device

**Trigger flow:**
```
Child completes game
    ↓
Game calls window.RK.logGameSession('game-id', {...})
    ↓
zoey-companion.js intercepts after the original call
    ↓
Counts total completed games (from window._rkCompletedIds)
    ↓
Picks scripted message based on count
    ↓
800ms delay (lets game celebration finish first)
    ↓
Companion overlay slides up from bottom
    ↓
Child taps "Keep Playing 🚀" → overlay dismisses
```

**Message rules:**
| Trigger | Message bank |
|---------|-------------|
| `completedCount === 1` | First game messages (extra celebratory) |
| `completedCount === 3` | Milestone 3 messages |
| `completedCount === 5` | Milestone 5 messages |
| `completedCount >= 10` | All done messages |
| All others | General encouragement pool (7 messages) |

**Confetti burst:** fires automatically at counts 1, 3, 5, and 10.

---

### Zoey SVG Character — Integration Guide

Zoey appears in **3 locations**. Each has a clearly marked placeholder.

#### Location 1: `child-home.html` — main character stage

```html
<!-- Find this block in child-home.html (~line 115) -->
<div class="zoey-stage">
  <!--
    ZOEY_SVG_PLACEHOLDER
    Replace this div with your animated SVG file, e.g.:
    <img src="assets/images/zoey.svg" alt="Zoey" style="width:100%;height:100%">
  -->
  <div class="zoey-placeholder">✨</div>
</div>
```

**Container specs:**
- `.zoey-stage`: 200×200px, flex-centered
- `.zoey-placeholder`: 160px circle, floats up/down (CSS `float` keyframe, 3s loop)
- Swap the inner div with your SVG — the float animation applies to whatever is inside

#### Location 2: `assets/js/zoey-companion.js` — in-game overlay

```html
<!-- Find this block in zoey-companion.js (~line 100, inside the overlay innerHTML) -->
<div class="zc-character">
  <!--
    ZOEY_SVG_PLACEHOLDER
    Replace this div with your animated SVG, e.g.:
    <img src="assets/images/zoey.svg" alt="Zoey">
  -->
  <div class="zc-char-placeholder">✨</div>
</div>
```

**Container specs:**
- `.zc-character`: 130×130px, flex-centered
- `.zc-char-placeholder`: 100px circle placeholder with orange gradient
- SVG will animate with `.zcFloat` keyframe (float + sway, 2.5s loop)

#### Location 3: `dashboard.html` — Zoey chat header

The parent dashboard shows a text-only Zoey header (✨ emoji + name). If you want the SVG here too, find the `.zoey-header` block (~line 477):

```html
<div class="zoey-header">
  <div class="zoey-icon">✨</div>  <!-- replace with small SVG (32×32px) -->
  <div>
    <div class="zoey-name">Zoey</div>
    <div class="zoey-tagline">AI Learning Advisor · powered by Gemini 2.5</div>
  </div>
</div>
```

#### SVG recommendations

- **Format:** Inline SVG or `<img src="assets/images/zoey.svg">` both work
- **Recommended size:** 200×200px viewport (scales via CSS container)
- **Animation:** Use SMIL `<animate>` or CSS keyframes inside the SVG
- **File location:** `assets/images/zoey.svg` (conventional, referenced in placeholders above)
- **Accessibility:** Add `alt="Zoey"` or `aria-label="Zoey"` to the image/SVG

---

## Key Implementation Details

### 1. Supabase Integration

**Tables:**
```sql
profiles      (id uuid PK → auth.users, email, created_at)
children      (id uuid PK, parent_id → profiles, name, age_range, avatar, theme, created_at)
game_sessions (id uuid PK, child_id → children, game_id, completed, attempts, time_spent_sec, score, played_at)
```

**RLS:** Users can only access their own rows. Game sessions are read by parent auth context.

**Auto-Profile Trigger:** On new `auth.users` insert → auto-insert into `profiles`.

**Setup:** Run `supabase/schema.sql` in two steps in the Supabase SQL Editor (Step 1: CREATE TABLEs, Step 2: RLS + trigger).

---

### 2. Auth Flows

#### Parent (real auth)
```
index.html → auth.html
    ├── Login  → Supabase session → dashboard.html
    └── Signup → email + COPPA checkbox → child profile setup → dashboard.html
```

#### Child (session-based, no login)
```
dashboard.html "Hand to Child" → child-home.html
    → game-loader.html → games
    → 🔒 padlock → dashboard.html
```

#### Test mode (dev bypass)
```
test-login.html → sets sessionStorage flags → any page
    ├── rk_test_mode = 'true'
    ├── rk_child = { id, name, age_range, avatar, _testMode: true }
    └── rk_user  = { id, email }
```
`requireAuth()` detects `rk_test_mode` and skips Supabase entirely.
`logGameSession()` detects `_testMode` and logs to console only.

---

### 3. Game Session Logging

**Hook pattern (all 10 games):**
```js
if (window.RK?.logGameSession) {
  await window.RK.logGameSession('game-id', { attempts: N });
}
```

**Special cases:**
- `space-defender-game.js` — non-async game loop; no `await` (fire-and-forget)
- `feed-by-sound-game.js` — click handler changed to `async () => {}`

**Test mode output:**
```
[ReadyKiddo TEST] logGameSession → game:color-sort
{ child: 'Test Kid', completed: true, attempts: 1, timeSec: 0 }
```

---

### 4. Landing Smart Router (`index.html` + `main.js`)

```
Page loads
    ↓
main.js reads sessionStorage.rk_child
    │
    ├── child exists → button text: "Play as [name] 🎮"
    │                  button href: child-home.html
    │                  parent link: "🔒 Parent Dashboard" → dashboard.html
    │
    └── no child    → button text: "Start your journey"
                       button href: auth.html
                       parent link: "Parent Login" → auth.html
```

Resume World button is permanently hidden (auth flow owns navigation).

---

### 5. Netlify Function — Zoey AI

**Endpoint:** `POST /api/zoey`

**Request body:**
```json
{
  "message": "What activities help with number recognition?",
  "childContext": {
    "ageRange": "4-5",
    "completedGames": ["color-sort", "number-matching"],
    "totalSessions": 2
  }
}
```

**Response:**
```json
{ "reply": "Counting everyday objects together is a great way..." }
```

**Error responses:**
- `400` — message missing or too long (>500 chars)
- `429` — Gemini rate limit hit
- `500` — `GEMINI_API_KEY` env var not set
- `502` — Gemini API unreachable

**Gemini config:**
```js
generationConfig: { maxOutputTokens: 256, temperature: 0.7, topP: 0.9 }
safetySettings:   BLOCK_MEDIUM_AND_ABOVE for all 4 harm categories
```

---

## Deployment & Environment

### Netlify

- **Site:** readykiddo.com
- **Site ID:** d2a1a8ee-a5ba-4c40-9cbb-6963b835897d
- **Redirects:** `/api/*` → `/.netlify/functions/:splat` (in netlify.toml)
- **Deploy:** MANUAL — git push does NOT auto-deploy. Must click "Trigger deploy" in Netlify UI.

### Required Environment Variables

| Key | Value | Where |
|-----|-------|--------|
| `GEMINI_API_KEY` | Google AI Studio key | Netlify → Site → Environment variables |

### Git Workflow

```bash
# Stage and commit
git add <files>
git commit -m "description"

# Push (multi-account PAT required)
git push https://devinalejandro1214-prog:YOUR_PAT@github.com/devinalejandro1214-prog/Readykiddo.git main

# Deploy
Netlify Dashboard → Deploys → Trigger deploy → Deploy site
```

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

- **Body/UI:** Fredoka (400, 500, 600, 700) — Google Fonts CDN
- **Display/Handwriting:** Caveat (600, 700) — Google Fonts CDN

### Warm Background (shared across all pages)

```css
background:
  radial-gradient(120% 80% at 50% -10%, rgba(255,178,62,0.22), transparent 60%),
  radial-gradient(80% 60% at 100% 110%, rgba(11,95,149,0.18), transparent 60%),
  linear-gradient(180deg, #f6e9c8 0%, #f1d9a2 100%);
```

### Components

- **Cards:** white, 20px radius, `0 4px 20px rgba(0,0,0,0.07)` shadow
- **Buttons (primary):** orange gradient `#f28c18 → #ffb23e`, white text, 50px radius
- **Selected states:** `#fff4d8` background + `#f28c18` border + `rgba(242,140,24,0.18)` shadow
- **Progress pips:** 30px wide, 6px radius (rectangles, not circles)
- **Brand mark:** rotated orange star SVG in 34×34px rounded square

---

## Testing Guide

### Test Mode (no Supabase, no real auth)

1. Open `https://readykiddo.com/test-login.html`
2. Set child name + age range
3. Pick destination: Dashboard, Home, or a specific game
4. Click "Enter Test Session →"
5. Session is set in `sessionStorage`, no DB writes occur
6. Open browser console — game completions log as `[ReadyKiddo TEST]`
7. Zoey companion overlay fires 800ms after any game completion

### Child Home Test

1. Set test session (test-login → Dashboard)
2. Navigate manually to `readykiddo.com/child-home.html`
3. Should show child name, star row (empty on first test), "Let's Play!" button
4. Padlock → dashboard.html

### Zoey AI Test (direct API call)

```js
// Paste in browser console on any readykiddo.com page
(async () => {
  const res = await fetch('/api/zoey', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: 'What activities help with number recognition?',
      childContext: { ageRange: '4-5', completedGames: ['color-sort'], totalSessions: 1 }
    })
  });
  console.log(await res.json());
})()
```

### Zoey Companion Test

```js
// Trigger manually from browser console while on game-loader.html
ZoeyCompanion.show(3, true) // shows milestone 3 with confetti
ZoeyCompanion.show(1, true) // shows first-game message with confetti
ZoeyCompanion.hide()        // dismisses
```

---

## Phase 5 — Next Steps

### 5A: Item Library + Theme System

**Goal:** Children unlock themed cosmetic packs (backgrounds, UI colors) based on progress. Zoey AI recommends packs to parents.

**Components to build:**
1. `assets/data/item-library.json` — 5–8 themed packs, ~100 items (GenAI task)
2. `assets/css/themes/*.css` — one file per theme, CSS custom properties
3. `assets/js/theme-loader.js` — reads `children.theme` from Supabase, swaps CSS class
4. Dashboard: theme selector UI (Zoey recommends based on completedGames)
5. game-loader.html: load active theme on init

**Sample themes:** 🌊 Coral Reef · 🌳 Jungle · 🍭 Candy Land · 🌙 Night Sky · 🦕 Dinosaur

### 5B: Admin Console (`admin.html`)

- Log in as admin (separate Supabase role or env-var PIN)
- Jump to any game directly
- View all bug reports (from feedback widget)
- See aggregate game completion stats across all users
- Trigger test notifications

### 5C: Zoey Curation in Dashboard

- After chat, if child has unlocked a milestone → Zoey proactively suggests a theme pack
- "Your child just hit 5 games! 🎉 Want to unlock the Coral Reef theme for them?"
- Parent taps → `children.theme` updated in Supabase → child sees new theme on next play

---

## Tasks for Delegation (Codex / Anti-Gravity)

| # | Task | Input | Output | Files |
|---|------|-------|--------|-------|
| 1 | Item Library JSON | Phase 5A spec (this doc) | 5–8 packs, ~100 items, Zoey rules | `assets/data/item-library.json` |
| 2 | CSS Theme Files | item-library.json | CSS custom properties per theme | `assets/css/themes/*.css` |
| 3 | Theme Loader JS | item-library.json + children.theme in Supabase | Reads theme, swaps CSS class | `assets/js/theme-loader.js` |
| 4 | Admin Console | Phase 5B spec | New HTML page with game jump + stats | `admin.html` |
| 5 | Zoey SVG Integration | SVG file at `assets/images/zoey.svg` | Replace placeholders in 3 locations | `child-home.html`, `zoey-companion.js`, `dashboard.html` |

**For Task 5 (SVG swap), the exact 3 locations are documented in the Zoey SVG Character section above.**

---

## Known Constraints

- **No npm / no build step** — all vanilla JS, CDN-loaded libraries only
- **COPPA** — no child PII to external APIs; name scrubbed before Gemini; parental consent at signup
- **Test mode** — sessionStorage bypass; no Supabase writes; game hooks log to console
- **Manual deploy** — Netlify requires "Trigger deploy" click after each push
- **Games are standalone** — class-based, loaded by game-shell.js; they don't know about auth
- **Assets ~306MB** — zip-and-build not viable; Netlify git-based deploy only
- **Multi-account GitHub** — push requires PAT embedded in URL (see Git Workflow above)

---

## Quick Reference

```bash
# Live URLs
https://readykiddo.com                  Landing
https://readykiddo.com/auth.html        Parent login / signup
https://readykiddo.com/dashboard.html   Parent dashboard + Zoey AI
https://readykiddo.com/child-home.html  Child hub
https://readykiddo.com/test-login.html  Dev test bypass
https://readykiddo.com/game-loader.html?game=color-sort   Launch a game

# Zoey companion manual test (paste in browser console on game-loader.html)
ZoeyCompanion.show(5, true)

# Zoey AI direct test (paste in browser console on any readykiddo.com page)
(async()=>{const r=await fetch('/api/zoey',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({message:'Help with colors?',childContext:{ageRange:'4-5',completedGames:[],totalSessions:0}})});console.log(await r.json())})()
```
