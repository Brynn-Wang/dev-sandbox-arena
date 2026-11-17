begin;

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select, update (display_name, updated_at) on public.profiles to authenticated;
grant all on public.profiles to service_role;

create policy "profiles: read own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles: update own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create or replace function public.create_profile_for_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, display_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists create_profile_after_signup on auth.users;
create trigger create_profile_after_signup
  after insert on auth.users
  for each row execute function public.create_profile_for_user();

create table if not exists public.simulation_runs (
  id uuid primary key,
  run_id uuid not null unique,
  user_id uuid not null references auth.users (id) on delete cascade,
  course_id text not null,
  module_id text not null,
  scenario_id text not null,
  state jsonb not null,
  revision bigint not null default 1 check (revision > 0),
  status text not null check (status in ('in_progress', 'completed')),
  outcome text,
  started_at timestamptz not null,
  updated_at timestamptz not null default now(),
  unique (user_id, scenario_id)
);

create index if not exists simulation_runs_user_updated_idx
  on public.simulation_runs (user_id, updated_at desc);

create table if not exists public.simulation_events (
  id text primary key,
  run_id uuid not null references public.simulation_runs (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  sequence bigint not null check (sequence > 0),
  event_type text not null,
  event_at timestamptz not null,
  label text not null,
  tone text not null check (tone in ('info', 'success', 'error')),
  details jsonb not null default '{}'::jsonb,
  unique (run_id, sequence)
);

create index if not exists simulation_events_run_sequence_idx
  on public.simulation_events (run_id, sequence);

alter table public.simulation_runs enable row level security;
alter table public.simulation_events enable row level security;

revoke all on public.simulation_runs, public.simulation_events
  from anon, authenticated;
grant select on public.simulation_runs, public.simulation_events
  to authenticated;
grant all on public.simulation_runs, public.simulation_events
  to service_role;

create policy "runs: read own"
  on public.simulation_runs
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "events: read own"
  on public.simulation_events
  for select
  to authenticated
  using ((select auth.uid()) = user_id);

create or replace function public.apply_simulation_transition(
  p_run_id uuid,
  p_expected_revision bigint,
  p_state jsonb,
  p_status text,
  p_outcome text,
  p_events jsonb
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_revision bigint;
  next_sequence bigint;
begin
  update public.simulation_runs
  set
    state = p_state,
    status = p_status,
    outcome = p_outcome,
    revision = revision + 1,
    updated_at = now()
  where id = p_run_id and revision = p_expected_revision
  returning revision into next_revision;

  if next_revision is null then
    raise exception 'Simulation run changed in another session.'
      using errcode = '40001';
  end if;

  select coalesce(max(sequence), 0)
  into next_sequence
  from public.simulation_events
  where run_id = p_run_id;

  insert into public.simulation_events (
    id,
    run_id,
    user_id,
    sequence,
    event_type,
    event_at,
    label,
    tone,
    details
  )
  select
    event ->> 'id',
    p_run_id,
    run.user_id,
    next_sequence + ordinality,
    event ->> 'type',
    (event ->> 'at')::timestamptz,
    event ->> 'label',
    event ->> 'tone',
    event
  from jsonb_array_elements(p_events) with ordinality as item(event, ordinality)
  join public.simulation_runs run on run.id = p_run_id;

  return next_revision;
end;
$$;

revoke all on function public.apply_simulation_transition(
  uuid, bigint, jsonb, text, text, jsonb
) from public, anon, authenticated;
grant execute on function public.apply_simulation_transition(
  uuid, bigint, jsonb, text, text, jsonb
) to service_role;

create or replace function public.reset_simulation_run(
  p_run_id uuid,
  p_expected_revision bigint,
  p_state jsonb
)
returns bigint
language plpgsql
security definer
set search_path = ''
as $$
declare
  next_revision bigint;
begin
  update public.simulation_runs
  set
    state = p_state,
    status = 'in_progress',
    outcome = null,
    revision = revision + 1,
    updated_at = now()
  where id = p_run_id and revision = p_expected_revision
  returning revision into next_revision;

  if next_revision is null then
    raise exception 'Simulation run changed in another session.'
      using errcode = '40001';
  end if;

  delete from public.simulation_events where run_id = p_run_id;
  return next_revision;
end;
$$;

revoke all on function public.reset_simulation_run(uuid, bigint, jsonb)
  from public, anon, authenticated;
grant execute on function public.reset_simulation_run(uuid, bigint, jsonb)
  to service_role;

commit;
