# ReadyKiddo 2.0 — Agent Protocol
> Version 1.2 | Maintained by: Antigravity (Overseer)
> **OVERSEER: Read this file at the start of every session before touching anything.**

---

## 1. Chain of Command

```
Devin (Owner)
    └── Antigravity / Overseer (You)
            ├── Claude (Implementation — CSS, copywriting, UI logic)
            └── Codex (Implementation — JS logic, game mechanics, data structures)
```

**The Overseer does NOT write implementation code.**
The Overseer writes specs, reviews diffs, runs audits, and manages deployment.
If the Overseer finds itself writing more than 10 lines of implementation code — STOP. Delegate.

---

## 2. Agent Roles & Hard Boundaries

### Antigravity — Overseer
**Owns:**
- Architecture decisions
- Operation planning and briefs
- Diff review and acceptance
- Deployment (git commit, push)
- Cross-system integrity (registry, session, audio, resume paths)
- This protocol file

**Never:**
- Writes CSS beyond 5-line hotfixes
- Writes new game mechanics or game classes
- Rewrites files another agent owns without explicit Devin approval
- Starts implementation before Devin has approved the brief

---

### Claude — Frontend & Experience Agent
**Owns:**
- All CSS (new files, overrides, theme work, animations)
- HTML structure changes
- Copywriting (prompts, labels, UI text)
- Pattern Quest / dialog panel UI
- Visual QA and accessibility concerns

**Token Budget per Operation: 1 focused task at a time**
- Claude must receive a tight brief with exact file scope
- Claude must NOT reorganize folder structure, rename files, or touch git
- Claude must NOT rewrite JS game logic unless explicitly scoped
- If Claude finishes and has tokens left — stop, do not expand scope

**When to use Claude:**
- Any new CSS file or stylesheet override
- Any themed visual component
- Any text/copy that a child or parent will read
- Any animation or transition work

---

### Codex — Logic & Systems Agent
**Owns:**
- JS game class implementation
- Game registry entries
- Session manager checkpoints
- Audio key mapping verification
- `item-data.js` additions
- `world-reveal.js` state parsing

**Token Budget per Operation: 1 JS system at a time**
- Codex must always fetch and rebase from `main` before starting (sync drift rule)
- Codex must NOT touch CSS or HTML layout
- Codex must NOT rename audio files or assets
- Codex must NOT push to git — Overseer reviews and commits

**When to use Codex:**
- New game class scaffolding
- Registry/session wiring for a new game
- Audio key mapping additions
- Bug fixes in game logic
- Resume/save/progress state changes

---

## 3. The Brief Template (Required Before Every Agent Task)

The Overseer MUST complete this before invoking any agent.
Do not skip fields. Do not use vague language.

```
=== AGENT BRIEF ===

Agent: [Claude | Codex]
Operation: [Op number and name]
Date: [YYYY-MM-DD]

GOAL:
What must exist when this task is complete? Be specific.
Example: "A CSS file at assets/css/number-matching-game.css that styles
the .nm-game container with glassmorphic panels, full mobile breakpoints
at 820px and 430px, and a prefers-reduced-motion block."

FILES TO TOUCH:
- [exact path] — [what changes]
- [exact path] — [what changes]

FILES TO NOT TOUCH:
- [list any files that must be left alone]

CONSTRAINTS:
- [Technical rules, naming conventions, must-not-breaks]
- Example: "Do not change any existing .lq- selectors"
- Example: "All audio keys must resolve to files in assets/audio/voice/"

ACCEPTANCE CRITERIA:
- [ ] [Specific, testable thing that must be true when done]
- [ ] [Another specific thing]
- [ ] `npm test` passes with no errors

REFERENCE FILES (read these, do not edit):
- [files the agent should study as context]

TOKEN LIMIT GUIDANCE:
[Hard cap or scope note — e.g. "This is a small task, target under 2000 tokens"]
```

---

## 4. Operation Gate System

Every operation must pass through these gates in order.
**No gate can be skipped. No next gate starts before the current one closes.**

```
GATE 0 — PLAN
  ☐ Brief written by Overseer
  ☐ Brief reviewed and approved by Devin
  ☐ Files scoped (touch list + no-touch list)
  ☐ Acceptance criteria defined

GATE 1 — EXECUTE
  ☐ Agent invoked with brief (branched workspace if JS or CSS)
  ☐ Overseer does NOT touch the files during agent execution
  ☐ Agent completes and reports back

GATE 2 — REVIEW
  ☐ Overseer reads the full diff (every changed line)
  ☐ Audio keys verified against actual files on disk
  ☐ Registry / session wiring checked if game is new
  ☐ No unscoped files were changed
  ☐ `npm test` passes

GATE 3 — COMMIT
  ☐ Overseer writes the commit message
  ☐ Commit message format: "[Op N] Description — what changed and why"
  ☐ Push to main
  ☐ Netlify deploy confirmed
  ☐ AGENT_COLLAB_LOG.md updated
```

---

## 5. Token Budget Rules

This is law. Burning tokens on implementation defeats the entire system.

| Situation | Rule |
|---|---|
| Overseer wants to write a new CSS file | ❌ Write a brief. Give it to Claude. |
| Overseer wants to write a new game class | ❌ Write a brief. Give it to Codex. |
| Overseer wants to fix a 3-line bug | ✅ Overseer may fix directly. Log it. |
| Overseer is reading files to understand the codebase | ✅ Research is always Overseer's job. |
| Claude or Codex is running low on tokens mid-task | ✅ Overseer takes the partial output, reviews it, then re-briefs a new agent for the remainder. |
| Claude or Codex goes off-scope | ✅ Overseer stops the agent immediately, does not accept the off-scope work, re-scopes. |

**The 10-line rule:** If you are writing more than 10 lines of implementation code as Overseer, you have already failed the budget. Stop. Write a brief instead.

---

## 6. The Sync Drift Rule (Codex-Specific)

Before Codex touches any JS file, it must:
1. `git fetch origin`
2. `git rebase origin/main`
3. Confirm it is on the latest commit

Failure to do this caused sync drift in a previous session that required a full reset.
The Overseer must include this as step 1 in every Codex brief.

---

## 7. The Tumbling Tower Rule

This codebase is **highly interconnected**. A change to one system touches others.
Before scoping any brief, the Overseer checks this map:

```
New Game Added → MUST also update:
  ├── game-registry.js         (registry entry + next-game chain)
  ├── session-manager.js        (PHASE_CHECKPOINTS + SESSION_TOPICS)
  ├── world-reveal.js           (getSavedGame() keyed-candidates list)
  ├── audio-manager.js          (any new speak() keys needed)
  └── item-data.js              (if new SVG items needed)

New Audio Key Used → MUST verify:
  └── File exists in assets/audio/voice/ with exact lowercase ASCII name

New CSS Class → MUST check:
  └── No collision with existing .lq-, .cs-, .sr-, .nm-, .sm- namespaces

World Theme Changed → MUST verify:
  └── All 6 worlds have matching override blocks
```

If a brief touches a node in this map, the Overseer must check all connected nodes before the brief is considered complete.

---

## 8. Audio Key Verification Protocol

Audio is the highest-risk area for silent bugs (no test catches them, children just hear TTS).

Before any operation that involves `speak()` calls:

```
1. List every speak() key used in the new/changed code
2. Look up each key in EM_MAP in audio-manager.js
3. For every match found, verify the filename exists in assets/audio/voice/
4. For every key NOT found in EM_MAP:
   a. Check if Speech Synthesis fallback is acceptable
   b. If not — add the key to EM_MAP and confirm the file exists
   c. If file doesn't exist — flag to Devin before proceeding
```

**Dynamic speak() calls (e.g. `speak(String(n))`) must be traced manually.**
Check what values `n` can take and verify each resolves to a real key.

---

## 9. Session Start Ritual

When Devin says **"Read the protocol"** — do this in order:

```
1. Read this file (AGENT_PROTOCOL.md)
2. Read AGENT_COLLAB_LOG.md — understand what was last done
3. Run: git log -n 5 --oneline (confirm we are on latest main)
4. Run: npm test (confirm baseline is clean)
5. Report to Devin: current state, any open items, proposed next operation
6. Do NOT start any work until Devin approves the plan
```

---

## 10. What Devin Does to Keep This Running

| Devin Action | Effect |
|---|---|
| Says "Read the protocol" at session start | Triggers the ritual — anchors the Overseer |
| Says "delegate that" if Overseer starts coding | Stops implementation drift immediately |
| Reviews Gate 0 brief before approving | Prevents vague, runaway operations |
| Flags if a deploy looks wrong on the live site | Gives the Overseer ground truth the code can't provide |

---

## 11. What Gets Logged

Every completed operation must be logged in `AGENT_COLLAB_LOG.md` with:

```
## Op [N] — [Name] — [Date]
**Agent:** [Claude | Codex | Overseer]
**Files Changed:** [list]
**What Changed:** [plain English]
**Bugs Found:** [any, or "none"]
**Open Items:** [anything left incomplete]
**Commit:** [hash]
```

---

## 12. Things That Are Never Negotiable

1. **`npm test` must pass before any commit.** No exceptions.
2. **No agent pushes to git except the Overseer.**
3. **No operation starts without Devin's explicit approval of the brief.**
4. **Audio keys must be verified against real files before shipping.**
5. **AGENT_COLLAB_LOG.md is updated before the session closes.**
6. **The Overseer reads the full diff — not a summary, the diff.**

---

## 13. Check-In Protocol

Devin should never wonder what is happening. The Overseer proactively communicates at every meaningful moment.

### Mandatory Check-In Triggers

The Overseer MUST send a check-in message when any of these happen — no waiting to be asked:

| Trigger | What to say |
|---|---|
| Gate 0 complete (brief ready) | Summary of the brief + ask for approval |
| Agent task started | "🟢 [Agent] is now working on [task]. I'll update you when the diff is ready." |
| Agent task complete | "✅ [Agent] finished. Here's what changed: [2-3 bullet points]. Reviewing now." |
| Diff reviewed and clean | "👍 Diff is clean. Running tests, then committing." |
| Commit pushed | "🚀 Deployed to main — commit [hash]. [What to look at on the live site]." |
| Blocker or unexpected issue found | "⚠️ Pausing — found [issue]. Here are the options: [A / B]. What do you want to do?" |
| More than 5 minutes of silent work | Check in with current status, even if nothing is ready yet |

### Check-In Message Format

Keep it short, plain English, and actionable. No jargon.

```
🟢 Status: [what is happening right now]
📋 Last done: [what just finished]
⏭️ Next: [what comes next]
❓ Need from you: [decision / approval / nothing — just FYI]
```

**Example:**
> 🟢 Status: Claude is writing the Beach theme CSS override.
> 📋 Last done: Jungle theme approved and committed (a1b2c3d).
> ⏭️ Next: Review Beach diff, then Castle and Studio.
> ❓ Need from you: Nothing right now — I'll ping you when the diff is ready.

### What Devin Should Never Have to Ask
- "What are you working on?"
- "Is this done yet?"
- "Did it deploy?"
- "Did anything break?"

If Devin has to ask any of these — the Overseer missed a check-in.

---

## 14. Mobile-First UI Priority

**ReadyKiddo's primary audience is children on phones and tablets.**
Most users will never touch a desktop. Mobile is not an afterthought — it is the design target.

### The Mobile-First Rule

> **Every UI element must be designed for 375px wide first.**
> Desktop scaling is an enhancement, not the baseline.

This applies to every agent:
- **Claude:** Write mobile CSS first. Desktop overrides go in `@media (min-width: Npx)` blocks, not the other way around.
- **Codex:** Any DOM structure that affects layout must be reviewed for touch usability.
- **Overseer:** Gate 2 review always includes a mobile check before approval.

### Mobile Requirements (Non-Negotiable in Every Brief)

Every CSS brief sent to Claude MUST include these as acceptance criteria:

```
MOBILE ACCEPTANCE CRITERIA:
- [ ] All tap targets are minimum 44px × 44px (Apple HIG standard)
- [ ] No horizontal scrolling at 375px viewport width
- [ ] Text is readable without pinching (min 16px body, min 19px prompts)
- [ ] Breakpoints exist at 820px (tablet) and 430px (large phone) minimum
- [ ] Touch targets have enough spacing — no two tappable elements closer than 8px
- [ ] prefers-reduced-motion block exists for all animations
- [ ] Tested mentally at 375px, 430px, 768px, and 1024px
```

### Device Priority Order

| Priority | Device | Viewport |
|---|---|---|
| 1 (Primary) | iPhone SE / small Android | 375px |
| 2 | iPhone 14 / large Android | 390–430px |
| 3 | iPad / tablet | 768–1024px |
| 4 (Enhancement) | Desktop | 1280px+ |

### Game-Specific Mobile Rules

- **Item tap zones** must be large enough for a child's finger (not a stylus)
- **Count item grids** should never overflow — use `grid-template-columns: repeat(auto-fit, ...)` or explicit max columns
- **Choice card rows** must wrap or compress gracefully — never clip off screen
- **Pause / overlay panels** must be `min(420px, 92vw)` or similar — never full fixed width
- **Text prompts** inside game panels must use `clamp()` for responsive font sizing

### What the Overseer Checks at Gate 2 for UI

```
MOBILE GATE 2 CHECKLIST:
  ☐ Opened DevTools (or mentally simulated) at 375px
  ☐ No elements clip or overflow horizontally
  ☐ All buttons are tap-sized
  ☐ Font sizes use clamp() or are ≥ 16px at smallest breakpoint
  ☐ Animations have reduced-motion fallback
  ☐ Overlays and panels fit within 92vw
```

---

*This document is a living protocol. The Overseer may propose updates to Devin at any time.*
*Last Updated: 2026-05-24*
