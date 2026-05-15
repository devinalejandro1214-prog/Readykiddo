# Anti & Codex: Joint Operations Alignment Protocol

This document establishes the single source of truth for repository state, folder paths, and operational protocol to ensure absolute alignment between Anti (Manager/Executor) and Codex (Reviewer/Architect).

## 1. Operating Directories
- **Anti's Active Directory:** `C:\Users\Devin\OneDrive - SNHU\Desktop\ReadyKiddo2.0\`
- **Codex's Audit Directory:** `C:\Users\Devin\Documents\Codex\2026-05-09\are-you-able-to-build-a\readykiddo-main-sync-20260511-191951\`

**Resolution for Sync:** 
Codex must perform the following sequence within their specific local directory prior to conducting any code audit:
1. `git fetch origin`
2. Confirm `HEAD` vs `origin/main`
3. Reconcile any local changes (e.g., local modifications to `AGENT_COLLAB_LOG.md`) and then fast-forward / rebase / refresh the audit copy cleanly. 

A failure to sync properly will result in false-positive "missing file" reports because Anti pushes directly to the `Readykiddo.git` origin `main` branch.

## 2. Single Source of Truth
- **The Git Repository is Absolute:** Remote `main` is the single source of truth. A docs/log commit does not by itself count as product verification; code/assets must also exist on `origin/main`.
- **Local Logs (`AGENT_COLLAB_LOG.md`):** Anti will only log features as completed *after* a successful `git push`.
- **Memory (`mission.json`):** Used to track the highest-level operational state. 

## 3. Execution & Verification Protocol
Every time Anti completes a task, the following strict sequence occurs before handoff:
1. **Self-Audit (Code Level):** Run `node -c` on all modified JavaScript files to guarantee zero syntax errors.
2. **Platform Checks (Manual):** Verify the flex layout/responsiveness for Mobile and Web bounds. Ensure audio bindings point to valid references.
3. **Log Synchronization:** Document the exact paths taken, actions performed, and audit results in `AGENT_COLLAB_LOG.md`. Update `mission.json` with the current milestone.
4. **Git Sync:** Commit and `git push origin main`.
5. **Known Verification Risk:** Anti acknowledges that manual checks carry residual risk. Until automated End-to-End tests (Cypress/Playwright) are implemented, "Stable" means code-level stability and logic flow integrity.

## 4. Known Audio Dependencies (As of 2026-05-12)
- The `RKAudio` stack routes `star`, `rectangle`, and `diamond` to generic celebration clips. This is an **intentional fallback**, not a routing failure. The system is wired, but the specific `em-find-star.m4a` files do not exist yet. 

---
**Alignment Status:** Protocol established and agreed upon. Both agents must adhere to this document to prevent audit drift.
