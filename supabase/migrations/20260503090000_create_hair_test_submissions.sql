-- Hair test leads, optional photo storage, and clinic-only read access.

create table if not exists public.hair_test_submissions (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(name) between 2 and 100),
  phone text not null check (phone ~ '^\+91[6-9][0-9]{9}$'),
  age integer not null check (age between 1 and 120),
  gender text not null check (gender in ('Female', 'Male', 'Non-binary', 'Prefer not to say')),
  hair_concerns text[] not null default '{}',
  loss_pattern text not null,
  issue_duration text not null,
  family_history text not null check (family_history in ('Yes', 'No')),
  family_history_side text not null default 'No known family history',
  scalp_condition text not null default 'Healthy scalp',
  stress_level text not null,
  sleep_quality text not null,
  diet_type text not null,
  personal_habits text[] not null default '{}',
  gastric_issue text not null default 'No gastric issue',
  lifestyle_diseases text[] not null default '{}',
  current_medicine_use text not null default 'No' check (current_medicine_use in ('Yes', 'No')),
  current_medicines text,
  medical_condition text,
  likely_condition text not null default 'General hair loss',
  assessment_summary text not null default '',
  medicine_recommendation text[] not null default '{}',
  photo_path text,
  photo_name text,
  photo_size integer,
  photo_type text,
  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

drop trigger if exists set_hair_test_submissions_updated_at on public.hair_test_submissions;
create trigger set_hair_test_submissions_updated_at
before update on public.hair_test_submissions
for each row
execute function public.set_updated_at();

alter table public.hair_test_submissions enable row level security;

drop policy if exists "Anyone can submit hair tests" on public.hair_test_submissions;
create policy "Anyone can submit hair tests"
on public.hair_test_submissions
for insert
to anon, authenticated
with check (true);

drop policy if exists "Clinic users can view hair tests" on public.hair_test_submissions;
create policy "Clinic users can view hair tests"
on public.hair_test_submissions
for select
to authenticated
using (public.has_clinic_role(array['admin', 'doctor', 'staff']));

drop policy if exists "Clinic users can update hair test status" on public.hair_test_submissions;
create policy "Clinic users can update hair test status"
on public.hair_test_submissions
for update
to authenticated
using (public.has_clinic_role(array['admin', 'doctor', 'staff']))
with check (public.has_clinic_role(array['admin', 'doctor', 'staff']));

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'hair-test-photos',
  'hair-test-photos',
  false,
  8388608,
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic', 'image/heif']
)
on conflict (id) do update
set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Anyone can upload hair test photos" on storage.objects;
create policy "Anyone can upload hair test photos"
on storage.objects
for insert
to anon, authenticated
with check (bucket_id = 'hair-test-photos');

drop policy if exists "Clinic users can view hair test photos" on storage.objects;
create policy "Clinic users can view hair test photos"
on storage.objects
for select
to authenticated
using (bucket_id = 'hair-test-photos' and public.has_clinic_role(array['admin', 'doctor', 'staff']));

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.hair_test_submissions; exception when duplicate_object then null; end;
  end if;
end $$;
