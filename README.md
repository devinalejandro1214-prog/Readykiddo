# ReadyKiddo

Static ReadyKiddo prototype with feedback intake and human-approved agent follow-up.

## Feedback-to-Agent Automation

Feedback flow:

1. The floating feedback widget posts to `/api/feedback`.
2. Netlify routes `/api/feedback` to `netlify/functions/feedback.js`.
3. The function validates the payload.
4. The function creates a GitHub issue with the feedback details, page URL, user agent, timestamp, and labels `feedback` and `needs-approval`.
5. A human reviews the issue.
6. A human applies `approved-for-agent`.
7. `.github/workflows/approved-feedback-agent.yml` runs Claude Code with `CLAUDE_CODE_OAUTH_TOKEN`.
8. Claude Code creates an agent branch and PR for review.

The workflow must not auto-merge and must not auto-deploy production.

## Manual Setup Required

Complete these steps before the automation can run end to end:

1. Deploy the static site and Netlify function, or map `/api/feedback` to `netlify/functions/feedback.js` in your hosting provider.
2. Add Netlify function environment variables: `GITHUB_TOKEN`, `GITHUB_REPOSITORY`, and optionally `ALLOWED_ORIGIN`.
3. Set `GITHUB_REPOSITORY` to `devinalejandro1214-prog/Readykiddo`.
4. Give the feedback GitHub token permission to create issues and apply labels in `devinalejandro1214-prog/Readykiddo`.
5. Create the GitHub label `approved-for-agent`. The feedback function creates `feedback` and `needs-approval` automatically if the token has label write access.
6. Add the repository secret `CLAUDE_CODE_OAUTH_TOKEN`.
7. Ensure GitHub Actions are enabled and the workflow has `contents`, `issues`, and `pull-requests` write permissions.
8. Protect `main` and require PR review before merge.
9. Confirm production deploys are not triggered automatically from agent branches.

Supabase is not required for the current feedback flow. GitHub Issues are the feedback log.

## Test Commands

```bash
npm test
npm run build
```

Use `npm test` before opening or merging PRs. If UI changed, also run a browser smoke test across landing, onboarding, world reveal, and games.
