-- ============================================================
--  ReadyKiddo 2.0 — Supabase Schema
--  Dashboard → SQL Editor → New Query → paste → Run
--
--  Run this in TWO steps:
--  Step 1: Run the block below labeled STEP 1 first
--  Step 2: Run the block below labeled STEP 2
-- ============================================================


-- ════════════════════════════════════════════════════════════
--  STEP 1 — Run this block first (own separate query)
-- ════════════════════════════════════════════════════════════

create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  created_at timestamptz default now()
);

create table if not exists public.children (
  id         uuid primary key default gen_random_uuid(),
  parent_id  uuid not null references public.profiles(id) on delete cascade,
  name       text not null,
  age_range  text not null check (age_range in ('3-4', '4-5')),
  avatar     text default 'Em',
  theme      text default 'default',
  created_at timestamptz default now()
);

create table if not exists public.game_sessions (
  id             uuid primary key default gen_random_uuid(),
  child_id       uuid not null references public.children(id) on delete cascade,
  game_id        text not null,
  completed      boolean default true,
  attempts       integer default 1,
  time_spent_sec integer default 0,
  score          integer default null,
  played_at      timestamptz default now()
);


-- ════════════════════════════════════════════════════════════
--  STEP 2 — Run this block second (new query)
-- ════════════════════════════════════════════════════════════

-- Enable RLS
alter table public.profiles      enable row level security;
alter table public.children      enable row level security;
alter table public.game_sessions enable row level security;

-- profiles policies
create policy "profiles_select" on public.profiles
  for select using (auth.uid() = id);

create policy "profiles_insert" on public.profiles
  for insert with check (auth.uid() = id);

create policy "profiles_update" on public.profiles
  for update using (auth.uid() = id);

-- children policies
create policy "children_select" on public.children
  for select using (auth.uid() = parent_id);

create policy "children_insert" on public.children
  for insert with check (auth.uid() = parent_id);

create policy "children_update" on public.children
  for update using (auth.uid() = parent_id);

create policy "children_delete" on public.children
  for delete using (auth.uid() = parent_id);

-- game_sessions policies
create policy "sessions_select" on public.game_sessions
  for select using (
    auth.uid() = (select parent_id from public.children where id = child_id)
  );

create policy "sessions_insert" on public.game_sessions
  for insert with check (
    auth.uid() = (select parent_id from public.children where id = child_id)
  );

-- Auto-create profile on signup trigger
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer
set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
