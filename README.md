# ReadyKiddo

Static ReadyKiddo prototype with feedback intake and human-approved agent follow-up.

## Feedback-to-Agent Automation

Feedback flow:

1. The floating feedback widget posts to `/api/feedback`.
2. Netlify routes `/api/feedback` to `netlify/functions/feedback.js`.
3. The function validates the payload and saves it to Supabase.
4. The function creates a GitHub issue labeled `feedback` and `needs-approval`.
5. A human reviews the issue.
6. A human applies `approved-for-agent`.
7. `.github/workflows/approved-feedback-agent.yml` runs Claude Code with `CLAUDE_CODE_OAUTH_TOKEN`.
8. Claude Code creates an agent branch and PR for review.

The workflow must not auto-merge and must not auto-deploy production.

## Manual Setup Required

Complete these steps before the automation can run end to end:

1. Deploy the static site and Netlify function, or map `/api/feedback` to `netlify/functions/feedback.js` in your hosting provider.
2. Create a Supabase table named `feedback`, or set `FEEDBACK_TABLE` to your preferred table name.
3. Add these columns to the feedback table: `id`, `type`, `message`, `email`, `page`, `url`, `user_agent`, `ip_hash`, `status`, `issue_url`, `created_at`.
4. Add function environment variables: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `GITHUB_TOKEN`, `GITHUB_REPOSITORY`, and optionally `ALLOWED_ORIGIN`, `FEEDBACK_TABLE`, and `IP_HASH_SALT`.
5. Give the feedback GitHub token permission to create issues and apply labels in `devinalejandro1214-prog/Readykiddo`.
6. Create GitHub labels: `feedback`, `needs-approval`, and `approved-for-agent`.
7. Add the repository secret `CLAUDE_CODE_OAUTH_TOKEN`.
8. Ensure GitHub Actions are enabled and the workflow has `contents`, `issues`, and `pull-requests` write permissions.
9. Protect `main` and require PR review before merge.
10. Confirm production deploys are not triggered automatically from agent branches.

Example Supabase schema:

```sql
create table if not exists feedback (
  id uuid primary key default gen_random_uuid(),
  type text not null,
  message text not null,
  email text,
  page text,
  url text,
  user_agent text,
  ip_hash text,
  status text not null default 'needs-approval',
  issue_url text,
  created_at timestamptz not null default now()
);
```

## Test Commands

```bash
npm test
npm run build
```

Use `npm test` before opening or merging PRs. If UI changed, also run a browser smoke test across landing, onboarding, world reveal, and games.
