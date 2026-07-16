# ReadyKiddo Supabase and Netlify deployment checklist

This checklist is intentionally gated. No production deploy should occur until the database and auth settings are verified.

## Database

- [ ] Back up/export the target database before applying SQL.
- [ ] Confirm Supabase project is `mqzbecwyubyifbjcvttk`.
- [ ] Confirm the reviewed branch and commit are approved.
- [ ] Confirm the four tracked migrations are the only database bootstrap path.
- [ ] Verify `profiles`, `children`, and `game_sessions` exist with RLS enabled.
- [ ] Verify ownership policies for two test users.
- [ ] Merge the reviewed clean Supabase branch into the production branch only after approval.
- [ ] Let Git integration apply migrations in timestamp order: `20260714080000`, `20260714090000`, `20260714100000`, `20260715100000`.
- [ ] Verify migration history and constraints in Supabase.
- [ ] Insert a child for each supported age band (`3-4`, `4-5`, `5-6`).
- [ ] Insert session telemetry and name spelling progress for a test child.
- [ ] Confirm Parent A cannot read or update Parent B data.
- [ ] Confirm anonymous reads and writes are denied.

## Netlify

- [ ] Project: `exquisite-florentine-61c994`.
- [ ] Production variable `SUPABASE_URL` is `https://mqzbecwyubyifbjcvttk.supabase.co`.
- [ ] Add production `SUPABASE_ANON_KEY` using the supplied publishable key.
- [ ] Scope the variable to Builds, Functions, and Runtime.
- [ ] Confirm no service-role key is configured in browser or build variables.
- [ ] Trigger the Netlify deployment only after database verification.
- [ ] Monitor deploy logs and the first production auth request.

## Supabase Auth

- [ ] Site URL: `https://readykiddo.com`.
- [ ] Redirect URL: `https://readykiddo.com/**`.
- [ ] Redirect URL: `https://readykiddo.com/auth.html`.
- [ ] Redirect URL: `https://main--exquisite-florentine-61c994.netlify.app/**`.
- [ ] Add localhost redirects only when local auth testing is required.

## Smoke tests

- [ ] Sign up and confirm the profile trigger creates a profile row.
- [ ] Complete onboarding and verify the child row is persisted.
- [ ] Sign out and confirm protected screens redirect to auth.
- [ ] Play one game and verify the session row and telemetry.
- [ ] Complete My Name Adventure and verify JSON progress saves.
- [ ] Reload and confirm the active child remains scoped to the signed-in parent.

## Stop conditions

Stop and do not deploy if any migration fails, RLS permits cross-family access, Auth redirects are incomplete, or the child insert fails for a supported age band.
