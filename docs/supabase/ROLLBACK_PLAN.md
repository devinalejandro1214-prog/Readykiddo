# ReadyKiddo Supabase rollback plan

## Safe rollback boundaries

The three timestamped migrations are additive or constraint replacements. The safest rollback is a database restore or a forward corrective migration, not an ad-hoc destructive edit in production.

## Migration-specific notes

- `20260714090000_add_session_telemetry.sql`: telemetry columns can be left in place safely. If rollback is required, remove only the telemetry constraint/columns after confirming no deployed code depends on them and after taking a backup.
- `20260714100000_expand_child_age_ranges.sql`: do not narrow the age check while any child has `5-6` or `6-8`. First migrate those rows to a supported replacement or restore the backup.
- `20260715100000_add_name_spelling_progress.sql`: the JSON column can remain safely. A rollback may drop the constraint and column only after confirming no name-progress data must be retained.

Example rollback SQL should be generated and reviewed against the live migration history; do not run these examples blindly:

```sql
-- Only after a backup and dependency check:
alter table public.children drop constraint if exists children_name_spelling_progress_object;
-- Keep the column unless data retention and deployed code have been explicitly reviewed.
```

## Restore procedure

1. Stop the Netlify deployment and disable further releases.
2. Capture Supabase logs, migration history, and the failing request.
3. Take a fresh backup of the current state.
4. Restore the last known-good database backup through Supabase's managed restore process.
5. Reapply only the verified baseline/migrations required by the restored application commit.
6. Run the two-parent RLS smoke test and auth flow before reopening traffic.

## Stop conditions

Rollback or pause immediately if a migration rejects existing rows, a parent can read another parent's child/session data, authentication redirects loop, or child creation succeeds locally but fails against the production schema.
