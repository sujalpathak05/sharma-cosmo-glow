-- Role-based access, WhatsApp message logs, and normalized clinic operations tables.

create table if not exists public.clinic_staff_roles (
  user_id uuid primary key references auth.users(id) on delete cascade,
  role text not null check (role in ('admin', 'doctor', 'staff')),
  display_name text,
  is_active boolean not null default true,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_clinic_staff_roles_updated_at on public.clinic_staff_roles;
create trigger set_clinic_staff_roles_updated_at
before update on public.clinic_staff_roles
for each row
execute function public.set_updated_at();

create or replace function public.current_clinic_role()
returns text
language sql
stable
security definer
set search_path = public
as $$
  select case
    when auth.uid() is null then null
    when not exists (select 1 from public.clinic_staff_roles where is_active = true) then 'admin'
    else coalesce(
      (
        select role
        from public.clinic_staff_roles
        where user_id = auth.uid()
          and is_active = true
        limit 1
      ),
      'staff'
    )
  end;
$$;

create or replace function public.has_clinic_role(allowed_roles text[])
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select public.current_clinic_role() = any(allowed_roles);
$$;

alter table public.clinic_staff_roles enable row level security;

drop policy if exists "Clinic users can view own role" on public.clinic_staff_roles;
create policy "Clinic users can view own role"
on public.clinic_staff_roles
for select
to authenticated
using (user_id = auth.uid() or public.current_clinic_role() = 'admin');

drop policy if exists "Admins can manage clinic roles" on public.clinic_staff_roles;
create policy "Admins can manage clinic roles"
on public.clinic_staff_roles
for all
to authenticated
using (public.current_clinic_role() = 'admin')
with check (public.current_clinic_role() = 'admin');

create table if not exists public.whatsapp_message_logs (
  id uuid primary key default gen_random_uuid(),
  appointment_id text,
  patient_name text not null,
  phone text not null,
  message_type text not null check (message_type in ('confirmation', 'reminder', 'followup', 'review_request', 'custom')),
  message_body text not null,
  delivery_mode text not null default 'wa_link',
  status text not null default 'opened' check (status in ('queued', 'opened', 'sent', 'failed')),
  sent_by uuid references auth.users(id) on delete set null,
  sent_at timestamp with time zone,
  created_at timestamp with time zone not null default now()
);

alter table public.whatsapp_message_logs enable row level security;

drop policy if exists "Clinic users can view WhatsApp logs" on public.whatsapp_message_logs;
create policy "Clinic users can view WhatsApp logs"
on public.whatsapp_message_logs
for select
to authenticated
using (public.has_clinic_role(array['admin', 'doctor', 'staff']));

drop policy if exists "Clinic users can insert WhatsApp logs" on public.whatsapp_message_logs;
create policy "Clinic users can insert WhatsApp logs"
on public.whatsapp_message_logs
for insert
to authenticated
with check (public.has_clinic_role(array['admin', 'doctor', 'staff']));

create table if not exists public.opd_bills (
  id text primary key,
  bill_no text not null unique,
  appointment_id text unique,
  patient_id text not null,
  patient_name text not null,
  phone text not null,
  age text not null default 'Adult',
  gender text not null default 'Others',
  doctor_name text not null,
  doctor_speciality text not null,
  clinic_name text not null,
  clinic_address text not null,
  bill_date timestamp with time zone not null,
  status text not null check (status in ('paid', 'due', 'refunded')),
  paid_amount numeric not null default 0,
  total_amount numeric not null default 0,
  payment_mode text not null check (payment_mode in ('online', 'offline')),
  consultation_mode text check (consultation_mode in ('online', 'offline')),
  visit_type text not null default 'Consultation',
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.opd_bill_items (
  id uuid primary key default gen_random_uuid(),
  bill_id text not null references public.opd_bills(id) on delete cascade,
  position integer not null default 0,
  label text not null,
  qty numeric not null default 1,
  rate numeric not null default 0,
  discount numeric not null default 0,
  gst numeric not null default 0,
  total numeric not null default 0
);

drop trigger if exists set_opd_bills_updated_at on public.opd_bills;
create trigger set_opd_bills_updated_at
before update on public.opd_bills
for each row
execute function public.set_updated_at();

create table if not exists public.pharmacy_medicines (
  id text primary key,
  name text not null,
  generic text not null default '-',
  group_name text not null default '-',
  manufacturer text not null default '-',
  batch text not null default '-',
  expiry_date date not null,
  stock integer not null default 0,
  location text not null default 'Main Rack',
  unit_price numeric not null default 0,
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

drop trigger if exists set_pharmacy_medicines_updated_at on public.pharmacy_medicines;
create trigger set_pharmacy_medicines_updated_at
before update on public.pharmacy_medicines
for each row
execute function public.set_updated_at();

create table if not exists public.pharmacy_sales (
  id text primary key,
  invoice_no text not null unique,
  patient_id text not null,
  patient_name text not null,
  contact_no text not null,
  sale_date date not null,
  total_amount numeric not null default 0,
  discount numeric not null default 0,
  discount_percent numeric not null default 0,
  payment_status text not null check (payment_status in ('paid', 'due')),
  sale_type text not null check (sale_type in ('OPD', 'OTC')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.pharmacy_sale_items (
  id uuid primary key default gen_random_uuid(),
  sale_id text not null references public.pharmacy_sales(id) on delete cascade,
  position integer not null default 0,
  medicine_id text,
  name text not null,
  qty integer not null default 1,
  price numeric not null default 0
);

drop trigger if exists set_pharmacy_sales_updated_at on public.pharmacy_sales;
create trigger set_pharmacy_sales_updated_at
before update on public.pharmacy_sales
for each row
execute function public.set_updated_at();

create table if not exists public.pharmacy_purchases (
  id text primary key,
  invoice_no text not null unique,
  supplier_id text not null,
  supplier_name text not null,
  contact_no text not null,
  purchase_date date not null,
  amount numeric not null default 0,
  payment_status text not null check (payment_status in ('paid', 'partial', 'due')),
  created_at timestamp with time zone not null default now(),
  updated_at timestamp with time zone not null default now()
);

create table if not exists public.pharmacy_purchase_items (
  id uuid primary key default gen_random_uuid(),
  purchase_id text not null references public.pharmacy_purchases(id) on delete cascade,
  position integer not null default 0,
  medicine_id text,
  name text not null,
  qty integer not null default 1,
  price numeric not null default 0
);

drop trigger if exists set_pharmacy_purchases_updated_at on public.pharmacy_purchases;
create trigger set_pharmacy_purchases_updated_at
before update on public.pharmacy_purchases
for each row
execute function public.set_updated_at();

alter table public.opd_bills enable row level security;
alter table public.opd_bill_items enable row level security;
alter table public.pharmacy_medicines enable row level security;
alter table public.pharmacy_sales enable row level security;
alter table public.pharmacy_sale_items enable row level security;
alter table public.pharmacy_purchases enable row level security;
alter table public.pharmacy_purchase_items enable row level security;

drop policy if exists "Clinic users can manage OPD bills" on public.opd_bills;
create policy "Clinic users can manage OPD bills"
on public.opd_bills
for all
to authenticated
using (public.has_clinic_role(array['admin', 'doctor', 'staff']))
with check (public.has_clinic_role(array['admin', 'doctor', 'staff']));

drop policy if exists "Clinic users can manage OPD bill items" on public.opd_bill_items;
create policy "Clinic users can manage OPD bill items"
on public.opd_bill_items
for all
to authenticated
using (public.has_clinic_role(array['admin', 'doctor', 'staff']))
with check (public.has_clinic_role(array['admin', 'doctor', 'staff']));

drop policy if exists "Clinic users can manage pharmacy medicines" on public.pharmacy_medicines;
create policy "Clinic users can manage pharmacy medicines"
on public.pharmacy_medicines
for all
to authenticated
using (public.has_clinic_role(array['admin', 'staff']))
with check (public.has_clinic_role(array['admin', 'staff']));

drop policy if exists "Clinic users can view pharmacy medicines" on public.pharmacy_medicines;
create policy "Clinic users can view pharmacy medicines"
on public.pharmacy_medicines
for select
to authenticated
using (public.has_clinic_role(array['admin', 'doctor', 'staff']));

drop policy if exists "Clinic users can manage pharmacy sales" on public.pharmacy_sales;
create policy "Clinic users can manage pharmacy sales"
on public.pharmacy_sales
for all
to authenticated
using (public.has_clinic_role(array['admin', 'staff']))
with check (public.has_clinic_role(array['admin', 'staff']));

drop policy if exists "Clinic users can view pharmacy sales" on public.pharmacy_sales;
create policy "Clinic users can view pharmacy sales"
on public.pharmacy_sales
for select
to authenticated
using (public.has_clinic_role(array['admin', 'doctor', 'staff']));

drop policy if exists "Clinic users can manage pharmacy sale items" on public.pharmacy_sale_items;
create policy "Clinic users can manage pharmacy sale items"
on public.pharmacy_sale_items
for all
to authenticated
using (public.has_clinic_role(array['admin', 'staff']))
with check (public.has_clinic_role(array['admin', 'staff']));

drop policy if exists "Clinic users can view pharmacy sale items" on public.pharmacy_sale_items;
create policy "Clinic users can view pharmacy sale items"
on public.pharmacy_sale_items
for select
to authenticated
using (public.has_clinic_role(array['admin', 'doctor', 'staff']));

drop policy if exists "Clinic users can manage pharmacy purchases" on public.pharmacy_purchases;
create policy "Clinic users can manage pharmacy purchases"
on public.pharmacy_purchases
for all
to authenticated
using (public.has_clinic_role(array['admin', 'staff']))
with check (public.has_clinic_role(array['admin', 'staff']));

drop policy if exists "Clinic users can view pharmacy purchases" on public.pharmacy_purchases;
create policy "Clinic users can view pharmacy purchases"
on public.pharmacy_purchases
for select
to authenticated
using (public.has_clinic_role(array['admin', 'doctor', 'staff']));

drop policy if exists "Clinic users can manage pharmacy purchase items" on public.pharmacy_purchase_items;
create policy "Clinic users can manage pharmacy purchase items"
on public.pharmacy_purchase_items
for all
to authenticated
using (public.has_clinic_role(array['admin', 'staff']))
with check (public.has_clinic_role(array['admin', 'staff']));

drop policy if exists "Clinic users can view pharmacy purchase items" on public.pharmacy_purchase_items;
create policy "Clinic users can view pharmacy purchase items"
on public.pharmacy_purchase_items
for select
to authenticated
using (public.has_clinic_role(array['admin', 'doctor', 'staff']));

insert into public.opd_bills (
  id, bill_no, appointment_id, patient_id, patient_name, phone, age, gender,
  doctor_name, doctor_speciality, clinic_name, clinic_address, bill_date,
  status, paid_amount, total_amount, payment_mode, consultation_mode, visit_type
)
values (
  'opd-seed-1', 'INV_0054', 'seed-appointment-1', 'PAT6040', 'Ms. Jay Mala', '8826054256', '26y', 'Female',
  'Dr. Vishikant Sharma', 'Aesthetic Medicine and Clinical Cosmetology', 'Sharma Cosmo Clinic',
  'T22, Sector 11, Noida, Uttar Pradesh', '2026-03-31T10:58:00.000Z',
  'paid', 800, 800, 'offline', 'offline', 'Consultation'
)
on conflict (id) do nothing;

insert into public.opd_bill_items (bill_id, position, label, qty, rate, discount, gst, total)
select 'opd-seed-1', 0, 'Consultation', 1, 800, 0, 0, 800
where not exists (select 1 from public.opd_bill_items where bill_id = 'opd-seed-1');

insert into public.pharmacy_medicines (id, name, generic, group_name, manufacturer, batch, expiry_date, stock, location, unit_price)
values
  ('med-1', 'KOJIVIT ULTRA', 'Glutathione', 'Skin Care', 'Sun Pharma', 'MKU251', '2026-09-09', 10, 'A-01', 685),
  ('med-2', 'TRANXMA GT', 'Tranexamic', 'Derma', 'Abbott', 'ST-242074', '2026-09-09', 72, 'A-02', 525),
  ('med-3', 'MONTAS L', 'Montelukast', 'Tablet', 'Cipla', 'K2402264', '2026-09-09', 100, 'B-04', 190),
  ('med-4', 'FOLVITE 5 MG', 'Folic Acid', 'Tablet', 'Pfizer', '25008E', '2026-09-09', 13283, 'B-09', 65),
  ('med-5', 'AZIDERM PULS', 'Azelaic Acid', 'Skin Care', 'Micro Labs', '040', '2026-09-01', 98, 'C-03', 410),
  ('med-6', 'SKINCAP SUNSCREEN 50', 'Sunscreen', 'Cosmeceutical', 'Canixa', '10501', '2026-09-09', 17, 'C-10', 799)
on conflict (id) do nothing;

do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    begin alter publication supabase_realtime add table public.whatsapp_message_logs; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.opd_bills; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.opd_bill_items; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.pharmacy_medicines; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.pharmacy_sales; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.pharmacy_sale_items; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.pharmacy_purchases; exception when duplicate_object then null; end;
    begin alter publication supabase_realtime add table public.pharmacy_purchase_items; exception when duplicate_object then null; end;
  end if;
end $$;
