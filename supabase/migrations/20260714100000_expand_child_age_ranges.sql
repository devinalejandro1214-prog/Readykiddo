-- Expand the already-public onboarding age contract without rewriting child rows.
-- Apply this migration before deploying code that writes 5-6 or 6-8.
begin;

do $$
begin
  if exists (
    select 1 from public.children
    where age_range is null or age_range not in ('3-4', '4-5', '5-6', '6-8')
  ) then
    raise exception 'children.age_range has values outside the supported contract';
  end if;
end $$;

alter table public.children
  drop constraint if exists children_age_range_check;

alter table public.children
  add constraint children_age_range_check
  check (age_range in ('3-4', '4-5', '5-6', '6-8')) not valid;

alter table public.children
  validate constraint children_age_range_check;

commit;
