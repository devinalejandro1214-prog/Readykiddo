# Codex Review Instructions

Use Codex as a required review step for agent-created PRs.

Review priorities:

- Verify the PR maps to a GitHub issue that had `approved-for-agent` applied by a human.
- Confirm the PR does not merge itself and does not deploy production.
- Check frontend behavior in the touched flow, including mobile layout.
- Check `/api/feedback` changes for secret exposure, input validation, and GitHub label correctness.
- Run `npm test` and any targeted manual checks listed in the PR.
- Leave findings as PR comments and request changes for regressions, overbroad scope, unsafe automation, or missing setup docs.

Agent PRs should stay unmerged until a human has reviewed the diff and the Codex review is clean or explicitly waived.
