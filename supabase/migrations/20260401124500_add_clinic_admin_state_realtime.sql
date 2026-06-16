create table if not exists public.clinic_admin_state (
  id text primary key,
  payload jsonb not null default '{}'::jsonb,
  updated_at timestamp with time zone not null default now()
);

create or replace function public.set_clinic_admin_state_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_clinic_admin_state_updated_at on public.clinic_admin_state;

create trigger set_clinic_admin_state_updated_at
before update on public.clinic_admin_state
for each row
execute function public.set_clinic_admin_state_updated_at();

insert into public.clinic_admin_state (id, payload)
values ('primary', '{}'::jsonb)
on conflict (id) do nothing;

alter table public.clinic_admin_state enable row level security;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'clinic_admin_state'
      and policyname = 'Authenticated users can view clinic admin state'
  ) then
    create policy "Authenticated users can view clinic admin state"
    on public.clinic_admin_state
    for select
    to authenticated
    using (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'clinic_admin_state'
      and policyname = 'Authenticated users can insert clinic admin state'
  ) then
    create policy "Authenticated users can insert clinic admin state"
    on public.clinic_admin_state
    for insert
    to authenticated
    with check (true);
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_policies
    where schemaname = 'public'
      and tablename = 'clinic_admin_state'
      and policyname = 'Authenticated users can update clinic admin state'
  ) then
    create policy "Authenticated users can update clinic admin state"
    on public.clinic_admin_state
    for update
    to authenticated
    using (true)
    with check (true);
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'clinic_admin_state'
  ) then
    alter publication supabase_realtime add table public.clinic_admin_state;
  end if;
end $$;

do $$
begin
  if exists (
    select 1
    from pg_publication
    where pubname = 'supabase_realtime'
  ) and not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'appointments'
  ) then
    alter publication supabase_realtime add table public.appointments;
  end if;
end $$;
