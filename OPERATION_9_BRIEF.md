# Op 9 — Voice Realignment: "Teacher" (directions) vs "Character" (encouragement)
> **Status: DRAFT — Planning only. Awaiting Devin approval before execution.**
> Written by: Claude | Date: 2026-05-29
> Requested by Devin: "Have our generated 'teacher' speak the directions and our
> recordings give the encouragement. Ensure there is a difference."

---

## Goal

Make a child instantly able to tell two audio roles apart:

| Role | Voice source | Job | Personality |
|---|---|---|---|
| **Teacher** | Kokoro TTS (generated, `.wav`) | Directions / what to do | Neutral, clear, consistent, character-independent |
| **Character** | Recordings (`.m4a`, Em / Amara) | Encouragement / reactions | Warm, playful, per-character |

The engine and assets are ~90% ready. This is mostly **routing + a small batch of regenerated direction clips**, not a rebuild.

---

## Current state (why the split is half-done already)

Audio routes through `RKAudio` in `assets/js/audio-manager.js`, using one voice map
per character: `EM_MAP` (default chars) or `AMARA_MAP` (Aria/Trish/Amelia — inherits
all of Em's instruction clips, overrides only feedback). **One voice does both jobs today.**

File-type analysis of `assets/audio/voice/` (137 files):
- **94 `.wav`** = Kokoro TTS (generated). These are nearly all *directions* — and they ARE
  the teacher voice we want. (find a–z, where-does-*, fbs-*, num-*, feed-*, sd-*, star/rectangle/diamond.)
- **43 `.m4a`** = recordings. Nearly all *encouragement* — EXCEPT ~12 direction clips
  that are still recordings (the mixing that breaks the split, listed below).

### The Kokoro pipeline (the "teacher" generator) already exists
Per AGENT_COLLAB_LOG (2026-05-13/15): a local FastAPI **Kokoro TTS** server
(`tts_server.py` using `kokoro-onnx` + `onnxruntime`, v1.0 model) in the **LeadEngine
workspace**, driven by `generate_final_audio.py`, produced the `.wav` callouts
(letters, phonics, numbers 1–10, star/rectangle/diamond). We reuse that exact pipeline
to (re)generate the remaining direction clips.

---

## Part A — Direction clips currently in `.m4a` recordings → regenerate as teacher `.wav`

These 11 are *instructions* but still play in a recorded voice. Regenerate each with the
Kokoro pipeline and save as `teacher-*.wav`:

| Concept | Old recording (retire from direction use) | New teacher clip | Script text |
|---|---|---|---|
| color | em-find-red.m4a | teacher-find-red.wav | "Find red." |
| color | em-find-blue.m4a | teacher-find-blue.wav | "Find blue." |
| color | em-find-yellow.m4a | teacher-find-yellow.wav | "Find yellow." |
| color | em-find-green.m4a | teacher-find-green.wav | "Find green." |
| color | em-find-orange.m4a | teacher-find-orange.wav | "Find orange." |
| color | em-find-purple.m4a | teacher-find-purple.wav | "Find purple." |
| shape | em-circle.m4a | teacher-circle.wav | "Find the circle." |
| shape | em-square.m4a | teacher-square.wav | "Find the square." |
| shape | em-triangle.m4a | teacher-triangle.wav | "Find the triangle." |
| intro | em-match-colors.m4a | teacher-match-colors.wav | "Let's match the colors!" |
| intro | em-match-shapes.m4a | teacher-match-shapes.wav | "Let's match the shapes!" |

> NOTE: keep the `.m4a` files on disk (don't delete) — they're simply no longer referenced
> for directions. "ready let's go" (em-ready-lets-go.m4a) is a **start cue**, borderline
> teacher/hype — DEVIN DECISION: keep as character hype, or regenerate as teacher? Default
> recommendation: keep as character (it's a moment of energy, not an instruction).

## Part B — Directions currently falling back to ROBOTIC browser TTS → generate teacher clips

Highest-impact fixes (these sound "cheap" today):

| Surface | Spoken | Plan |
|---|---|---|
| Pattern Quest / Space Pattern | "What comes next?" | teacher-what-comes-next.wav |
| Pattern Quest / Space Pattern | hints e.g. "{A}, {B} — they take turns!" | TEMPLATED — see design note |
| Number Line | "Where does {1–10} go?" | teacher-where-does-1-go.wav … teacher-where-does-10-go.wav (10 clips) |

**Design note on hints (templated):** hint text interpolates world item names, so it can't be
one fixed clip. Two acceptable approaches — DEVIN/agent to choose at build time:
- (Preferred, consistent) Rephrase hints into a small fixed set of teacher lines that don't
  name items (e.g. "Look at the order — what repeats?"), generate those as teacher `.wav`.
- (Fallback) Route only the variable hint through runtime browser TTS but tag it so it's
  clearly secondary; keep "What comes next?" as a teacher clip.

## Part C — Confirm existing `.wav` directions stay teacher (no work, just mapping)

find a–z, where-does-a..z-go, fbs-b/s/m/f/p/d, num 1–10, feed-alien 1–10, feed-basket 1–10,
star/rectangle/diamond, sd-ready. All already Kokoro `.wav` → map into `TEACHER_MAP` as-is.

## Encouragement set — stays as recordings (`.m4a`), NO change

Per-character via EM_MAP/AMARA_MAP: you got it, you found it, great job, good job, perfect,
yay, impressive, i cant believe it, laugh, wow, try again, aww man, keep it up, almost there,
welcome (+ Amara's hi/hello variants). These remain the warm character voice.

---

## Engine changes — `assets/js/audio-manager.js`

```
1. Add TEACHER_MAP: { instructionKey -> teacher .wav filename }.
   - Include all Part A new teacher-*.wav, Part B new clips, and all Part C existing .wav.
   - TEACHER_MAP is character-INDEPENDENT (one teacher for everyone).

2. Reduce EM_MAP / AMARA_MAP to the ENCOURAGEMENT set only (remove instruction keys).
   AMARA_MAP no longer needs to inherit instruction keys from EM_MAP.

3. New public methods (keep speak() for back-compat):
   - speakInstruction(key)  -> resolves ONLY against TEACHER_MAP (uses speakAndWait-style timing).
   - speakPraise(key)       -> resolves against getVoiceMap() (character).
   - speakCourtesy(key)     -> becomes praise-only (already used that way for encouragement).
   - speak(key): for back-compat, try TEACHER_MAP first, then character map. Mark deprecated.

4. getPath(key) -> split into getTeacherPath(key) and getCharacterPath(key); keep the
   normalizeKey + longest-substring fallback logic in both.

5. Preload list (CRITICAL_CLIPS): swap the recorded direction clips for the teacher .wav
   equivalents so first-paint instructions are warm.
```

## Shell changes — `assets/js/games/game-shell.js`

```
- api.speakInstruction(text)  -> RKAudio.speakInstruction (or speakAndWait for chained intros)
- api.speakPraise(text)       -> RKAudio.speakCourtesy
- Keep api.speak/api.speakAndWait for transitional back-compat.
- randomEncouragement(): unchanged (already praise via speakCourtesy).
- playSound(): 'correct'/'celebration' -> speakPraise; instruction-y keys -> speakInstruction.
```

## Per-game call-site edits (mechanical — keys already distinguish intent)

| File | Line(s) | Change |
|---|---|---|
| color-sort-game.js | match-colors intro, `find ${color}` | speak -> **speakInstruction** |
| shape-recognition-game.js | match-shapes intro, `find ${shape}` | speak -> **speakInstruction** |
| abc-match-game.js | `find ${letter}` | speak -> **speakInstruction** |
| number-matching-game.js | count + target number callouts | speak -> **speakInstruction** |
| number-line-game.js | `Where does ${target} go?` | speak -> **speakInstruction** (+ new clips) |
| feed-alien-game.js | round prompt + `String(n)` counting | speak -> **speakInstruction** |
| feed-by-sound-game.js | `cfg.speakPrompt` | speak -> **speakInstruction** |
| pattern-next-game.js | "What comes next", `round.hint` | speak -> **speakInstruction** |
| space-pattern-game.js | "What comes next", `round.hint` | speak -> **speakInstruction** |
| space-defender-game.js | "ready for action" | speakInstruction; "great effort"/"all clear" -> speakPraise |
| (all) | 'try again', wrongPhrases | speak -> **speakPraise** |
| world-reveal.js | 'welcome' | leave as character (speakPraise) — it's a greeting |

---

## Files to touch / NOT touch

TOUCH:
- assets/js/audio-manager.js (TEACHER_MAP + method split)
- assets/js/games/game-shell.js (speakInstruction/speakPraise wrappers)
- the 10 game JS files above (call-site swaps)
- assets/audio/voice/teacher-*.wav (new generated clips)
- AGENT_COLLAB_LOG.md (entry)

DO NOT TOUCH:
- session-manager.js, game-registry.js (no audio role change)
- Existing .m4a files (keep on disk; just stop referencing for directions)
- Mute / preload / iOS-unlock / theme logic (unchanged)

---

## Clip generation checklist (Kokoro pipeline, one teacher voice)

Generate with the SAME voice for all (pick one Kokoro voice id = "the teacher"):
- [ ] Part A: 11 clips (6 colors, 3 shapes, 2 intros)
- [ ] Part B: "what comes next" (1) + "where does {1–10} go" (10) + hint lines (TBD per design note)
- [ ] Verify loudness/normalization matches existing .wav set
- [ ] Drop into assets/audio/voice/, add to TEACHER_MAP

---

## Acceptance criteria
- [ ] TEACHER_MAP added; EM_MAP/AMARA_MAP reduced to encouragement only
- [ ] speakInstruction() always uses teacher voice; speakPraise() always character
- [ ] No direction anywhere uses an .m4a recording
- [ ] No direction falls back to browser TTS (Pattern/Space-Pattern/Number-Line fixed)
- [ ] Same teacher voice across ALL games regardless of character selected
- [ ] Encouragement still per-character (Em vs Amara) and unchanged
- [ ] npm test passes; manual run of each game confirms correct voice per moment

## Manual QA (Devin, on phone, 2 characters: 1 male + 1 female)
- [ ] Pick a MALE character: directions = teacher voice, praise = Em
- [ ] Pick a FEMALE character: directions = SAME teacher voice, praise = Amara
- [ ] Every game: the "what to do" voice clearly differs from the "good job" voice
- [ ] Pattern Quest / Number Line no longer sound robotic
- [ ] Mute still silences both; theme unaffected

---

*Brief status: DRAFT. Next session: review with Devin, lock the hint approach + "ready lets go"
decision, then execute Part A/B generation first, wire TEACHER_MAP, then game call-sites.*
