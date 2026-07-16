-- Add versioned evidence without rewriting or upgrading legacy session claims.
begin;
alter table public.game_sessions
  add column if not exists telemetry_version integer,
  add column if not exists telemetry_support_level text,
  add column if not exists telemetry jsonb;
alter table public.game_sessions
  drop constraint if exists game_sessions_telemetry_support_level_check;
alter table public.game_sessions
  add constraint game_sessions_telemetry_support_level_check
  check (telemetry_support_level is null or telemetry_support_level in ('full', 'partial', 'legacy')) not valid;
alter table public.game_sessions
  validate constraint game_sessions_telemetry_support_level_check;
commit;
