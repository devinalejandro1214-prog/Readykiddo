alter table public.children
  add column if not exists name_spelling_progress jsonb not null default '{}'::jsonb;

alter table public.children
  drop constraint if exists children_name_spelling_progress_object;

alter table public.children
  add constraint children_name_spelling_progress_object
  check (jsonb_typeof(name_spelling_progress) = 'object');
