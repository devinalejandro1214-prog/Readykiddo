# ReadyKiddo production migration audit

**Audit basis:** `main` at `b3559b94bf1101fce5ae48086e662f5a7e3807a4`  
**Supabase project:** `mqzbecwyubyifbjcvttk`  
**Scope:** static and repository validation only. No production database was connected to or changed.

## SQL files found and order

1. `supabase/schema.sql` — initial schema reference/baseline.
2. `supabase/migrations/20260714090000_add_session_telemetry.sql`
3. `supabase/migrations/20260714100000_expand_child_age_ranges.sql`
4. `supabase/migrations/20260715100000_add_name_spelling_progress.sql`

The migration filenames were renamed from eight-digit date prefixes to full sortable timestamps. Their order and SQL content were preserved.

## Baseline decision

`schema.sql` should remain the reviewed baseline reference and be run once before the three timestamped migrations. It is not itself in the migration directory because duplicating it as a second source of truth would make future schema drift likely. The connected database is empty, so a baseline must be applied before Git integration can apply the later migrations. This is recommendation **B**: run the baseline manually first, then let Git integration apply the later migrations after review.

The baseline uses `create table if not exists` and has an explicit two-step layout. Its policies and trigger are intentionally one-time bootstrap statements; do not repeatedly paste the whole file into an already-initialized database.

## Destructive and compatibility findings

- No `TRUNCATE`, `DELETE`, `DROP TABLE`, `DROP SCHEMA`, `service_role`, or broad `GRANT` statements were found.
- `DROP CONSTRAINT` is used only to replace the age and telemetry checks with the versioned checks.
- `DROP TRIGGER` in the baseline is scoped to the known signup trigger before recreating it.
- Telemetry columns are additive and nullable, preserving legacy session rows.
- Name progress is additive with a JSON object default, so existing children receive `{}`.
- The age migration validates existing values before replacing the check; it will stop rather than silently reinterpret invalid data.
- No generated IDs or hardcoded user IDs are present.

## Tables and ownership policies

| Table | RLS | Ownership rule |
| --- | --- | --- |
| `profiles` | Enabled | `auth.uid() = profiles.id` for select/insert/update |
| `children` | Enabled | `auth.uid() = children.parent_id` for select/insert/update/delete |
| `game_sessions` | Enabled | Session access resolves `child_id` through `children.parent_id` |

There are no separate `families`, `progress`, `milestones`, `saved_activities`, `rewards`, or `badges` tables in this schema. Progress is currently represented by `game_sessions` telemetry and the `children.name_spelling_progress` JSON field. No table is intentionally public.

The policies scope reads and writes through authenticated ownership rather than trusting a client-provided child ID. Service-role access is not used by browser SQL.

## Age contract

| Persisted value | Display label | Migration state |
| --- | --- | --- |
| `3-4` | 3–4 Years | Baseline and application |
| `4-5` | 4–5 Years | Baseline and application |
| `5-6` | 5–6 Years | Added by age migration and onboarding |
| `6-8` | 6–8 Years | Accepted by database migration; application UI should be added before exposing it |

The baseline starts with `3-4` and `4-5`; the age migration expands the check to all four values. The onboarding application fix adds the dedicated `5-6` choice and stops the flow when a signed-in child insert fails. `6-8` is database-compatible but should remain hidden until the game difficulty and copy are reviewed for that band.

## Local validation

Passed:

- JavaScript syntax/static asset validation.
- Migration naming and exact-file checks.
- RLS ownership contract checks.
- Forbidden destructive SQL pattern checks.
- Age, telemetry, and name-progress contract checks.

Runtime `supabase db reset`, RLS multi-user tests, and schema-diff tests were not run because the Supabase CLI/local database is unavailable in this workspace. They remain a pre-merge requirement.

## Recommendation

Run the baseline manually once in the empty Supabase project, verify the tables and policies, then let Supabase Git integration apply the three timestamped migrations after this branch is reviewed and merged. Do not deploy the site until the database smoke tests pass.
