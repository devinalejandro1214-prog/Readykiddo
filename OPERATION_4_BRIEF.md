# Op 4 — Path A: Mobile Audio Reliability Fix
> **Status: READY TO EXECUTE — Next Session**
> Written by: Antigravity (Overseer) | Date: 2026-05-24
> Approved by Devin: ✅ Yes — "For next session lets complete just path A"

---

## Context

Audio on mobile is unreliable across the ReadyKiddo experience. The current `audio-manager.js` handles the iOS unlock gesture correctly on the "Let's Go!" button, but has four specific gaps that cause silent failures on mobile:

1. **Visibility change** — iOS kills the audio session when the app goes to background. No re-unlock on return.
2. **First-clip lag** — On-demand mobile loading means the first clip must fetch before it can play. If game logic fires `speak()` too quickly after load, the audio window is missed.
3. **Unlock scope too narrow** — `unlock()` only fires on "Let's Go!". Any `speak()` call before that (e.g. world-reveal welcome prompt) silently fails.
4. **Long silence sessions** — Safari drops the audio context during long stretches of no audio. No keepalive mechanism exists.

---

## Agent Brief

```
=== AGENT BRIEF — OP 4 ===

Agent: Codex
Operation: Op 4 — Mobile Audio Reliability (Path A)
Date: Next session (reference 2026-05-24 plan)

PRE-TASK REQUIRED (Codex must do this first):
  1. git fetch origin
  2. git rebase origin/main
  3. Confirm on latest commit before touching any file

GOAL:
Fix four mobile audio reliability gaps in audio-manager.js so that
audio plays correctly on iOS Safari and Android Chrome in all cases:
visibility changes, first-clip lag, pre-gesture speak calls, and
long-silence session drops. No new audio files needed. No UI changes.

FILES TO TOUCH:
- assets/js/audio-manager.js — all four fixes applied here

FILES TO NOT TOUCH:
- Any game JS files (color-sort-game.js, number-matching-game.js, etc.)
- Any CSS files
- game-loader.html
- AGENT_COLLAB_LOG.md (Overseer updates this)
- AGENT_PROTOCOL.md

CONSTRAINTS:
- Do NOT change the public RKAudio API surface (speak, speakAndWait,
  speakCourtesy, playSfx, startTheme, stopTheme, isMuted, setMuted,
  injectMuteButton, createMuteButton, unlock, warmUp must all still exist)
- warmUp() stays as a no-op — do not restore old behavior
- Do NOT add new audio files or change any file paths
- Do NOT change EM_MAP or AMARA_MAP key mappings
- All fixes must be self-contained inside the IIFE in audio-manager.js
- Mobile detection uses the existing navigator.userAgent check pattern

FIXES TO IMPLEMENT:

Fix 1 — Visibility Change Re-unlock
  When the page returns from background (visibilitychange → visible),
  call unlock() again to restore the iOS audio session.
  Add inside the IIFE after the existing beforeunload listener:

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') unlock();
  });

Fix 2 — First User Tap Unlock (expand scope)
  Currently unlock() is called only by game-shell.js on "Let's Go!".
  Add a one-time pointerdown listener on document at the bottom of the
  IIFE (before preloadAll()) so unlock() fires on the very FIRST tap
  anywhere on any page — not just "Let's Go!":

  document.addEventListener('pointerdown', () => unlock(), { once: true });

  Note: unlock() already has an internal _done guard so calling it
  multiple times is safe — it only runs the silent clip once.

Fix 3 — Pre-buffer Warm Path for First Clip
  Add a new internal function primeClip(path) that creates an Audio
  element, sets preload='auto', and calls load() — but does NOT call
  play(). Call this from speak() if the path is not already cached:

  function primeClip(path) {
    if (cache[path]) return;          // already cached, skip
    const a = new Audio(path);
    a.preload = 'auto';
    a.load();
    cache[path] = a;
  }

  This means the first time speak(key) is called, if the clip is not
  cached, prime it immediately AND proceed to play — the load and play
  race, and on fast connections the clip is ready; on slow connections
  the audio.play() promise handles the buffering naturally.

  Do NOT expose primeClip on the public API.

Fix 4 — iOS Session Keepalive
  Add a keepAlive() function that plays a zero-volume, zero-duration
  silent clip every 25 seconds when audio is not muted and no voice
  is currently playing. Use the existing silent data URI already in
  unlock(). Use setInterval, cleared when the page unloads.

  Rules:
  - Only runs if !isMuted()
  - Only runs if currentVoice is null or paused/ended
  - Uses the same silent data URI as unlock()
  - Interval is 25 000ms
  - clearInterval on beforeunload

  function keepAlive() {
    if (isMuted()) return;
    const busy = currentVoice && !currentVoice.paused && !currentVoice.ended;
    if (busy) return;
    const a = new Audio();
    a.src = 'data:audio/wav;base64,UklGRiQAAABXQVZFZm10...'; // same as unlock
    a.volume = 0;
    a.play().catch(() => {});
  }

  Start the interval after the first unlock() succeeds:
  Modify unlock() to start the keepalive interval on its first (and
  only) run, after the silent clip plays.

ACCEPTANCE CRITERIA:
- [ ] visibilitychange listener added — re-calls unlock() on return to foreground
- [ ] document pointerdown one-time listener added — unlock() fires on first tap anywhere
- [ ] primeClip() implemented and called inside speak() before getAudio()
- [ ] keepAlive() interval implemented and started from unlock()
- [ ] keepAlive clearInterval registered on beforeunload
- [ ] Public RKAudio API is unchanged (same properties, same signatures)
- [ ] unlock()._done guard still works — calling unlock() twice does not double-run
- [ ] warmUp() is still a no-op
- [ ] npm test passes with no errors

REFERENCE FILES (read, do not edit):
- assets/js/audio-manager.js (the full current file — all fixes go here)
- assets/js/games/game-shell.js (understand how speak/unlock is called from games)

TOKEN LIMIT GUIDANCE:
This is a focused single-file task. All changes are in audio-manager.js.
Target under 3000 tokens. Do not expand scope.
```

---

## Overseer Gate 2 Checklist (To Run After Codex Delivers)

```
REVIEW CHECKLIST — OP 4:
  ☐ visibilitychange listener present and correctly scoped
  ☐ pointerdown one-time listener added at IIFE bottom
  ☐ primeClip() exists and is called inside speak() — not exposed publicly
  ☐ keepAlive() uses silent data URI (not a real file fetch)
  ☐ keepAlive started from unlock(), cleared on beforeunload
  ☐ unlock()._done guard still present
  ☐ All 12 public RKAudio properties still exported
  ☐ warmUp is still function warmUp() {}
  ☐ npm test passes
  ☐ No changes outside audio-manager.js
```

---

## Manual QA After Deploy (Devin Does This)

```
ON iPHONE / SAFARI:
  [ ] Open readykiddo.com cold
  [ ] Tap anywhere on the world-reveal page — audio should unlock immediately
  [ ] Press "Let's Go!" — welcome voice should play
  [ ] Start Number Match — Em's voice should count on first item tap (no delay)
  [ ] Lock the phone for 30 seconds, unlock, return to app
  [ ] Tap an item — audio should still work (visibility re-unlock test)
  [ ] Play through 3 rounds without touching anything between rounds
  [ ] Audio should still work on round 4 (keepalive test)

ON ANDROID / CHROME:
  [ ] Same flow as above
  [ ] Background the app for 1 minute, return — audio still works
```

---

## What Path A Does NOT Fix

These are out of scope for Op 4 and belong to Path B or Path C planning:

- Character-specific voices (all characters still share Em or Amara)
- World ambient background audio
- Audio deserts in onboarding (character/outfit/world selection)
- Game transition clips between rounds
- Character catchphrases

---

*Brief status: APPROVED by Devin. Ready to execute next session.*
*Overseer: Start next session by saying "Read the protocol" then pull this brief from OPERATION_4_BRIEF.md*
