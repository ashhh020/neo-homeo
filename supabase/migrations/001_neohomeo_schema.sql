-- NeoHomeo — run in Supabase SQL Editor or via CLI migrations
-- Enable UUID extension (usually already on)
create extension if not exists "pgcrypto";

-- Profiles (1:1 with auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'patient' check (role in ('patient', 'doctor', 'admin')),
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.patient_details (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  phone text,
  date_of_birth date,
  gender text,
  city text,
  language_preference text default 'English',
  height_cm int,
  weight_kg numeric,
  blood_group text,
  occupation text,
  lifestyle_notes text,
  sleep_hours numeric,
  diet_type text,
  past_diseases text,
  current_medicines text,
  allergies text,
  family_history text,
  surgeries text,
  stress_level text,
  anxiety_notes text,
  mood_pattern text,
  energy_level text,
  emotional_triggers text,
  updated_at timestamptz not null default now()
);

-- Single table for directory + applications (pending) + approved doctors
create table if not exists public.doctors (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.profiles (id) on delete set null,
  full_name text not null,
  email text,
  phone text,
  qualification text,
  specialization text not null default '',
  experience_years int not null default 0,
  clinic_name text,
  clinic_address text,
  consultation_fee numeric not null default 0,
  languages text[] not null default '{}',
  bio text,
  photo_url text,
  calendly_url text,
  match_keywords text,
  rating numeric not null default 4.8,
  review_count int not null default 0,
  status text not null default 'pending' check (status in ('pending', 'approved', 'rejected')),
  admin_note text,
  degree_url text,
  license_url text,
  gov_id_url text,
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

create table if not exists public.assessments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid not null references public.profiles (id) on delete cascade,
  language text,
  summary text not null,
  raw_json text,
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  patient_id uuid references public.profiles (id) on delete set null,
  doctor_id uuid references public.doctors (id) on delete set null,
  calendly_event_uri text,
  status text not null default 'pending',
  created_at timestamptz not null default now()
);

-- Auto-create profile row for new auth users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role, onboarding_completed)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'patient',
    false
  )
  on conflict (id) do nothing;
  return NEW;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

-- RLS
alter table public.profiles enable row level security;
alter table public.patient_details enable row level security;
alter table public.doctors enable row level security;
alter table public.assessments enable row level security;
alter table public.appointments enable row level security;

-- Profiles: own row
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

-- Allow insert for trigger path (service) — profile created by trigger; optional manual insert:
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Patient details
create policy "patient_details_all_own" on public.patient_details
for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Doctors: public read approved (for marketing + matching)
create policy "doctors_select_approved_public" on public.doctors
for select using (status = 'approved');

-- Logged-in users can read pending for their email (optional) — skip for simplicity

-- Anyone can submit a pending application (public form)
create policy "doctors_insert_pending" on public.doctors
for insert with check (status = 'pending');

-- Admins can do anything on doctors
create policy "doctors_admin_all" on public.doctors
for all using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

-- Admins read all profiles / patient_details / assessments
create policy "profiles_admin_select" on public.profiles
for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "profiles_admin_update" on public.profiles
for update using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "patient_details_admin_select" on public.patient_details
for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

create policy "assessments_admin_select" on public.assessments
for select using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Assessments: patient owns
create policy "assessments_select_own" on public.assessments
for select using (auth.uid() = patient_id);

create policy "assessments_insert_own" on public.assessments
for insert with check (auth.uid() = patient_id);

-- Doctors (approved) can read assessments? optional — skip for MVP

-- Appointments: patient own; doctor read via join in app
create policy "appointments_patient" on public.appointments
for all using (auth.uid() = patient_id) with check (auth.uid() = patient_id);

create policy "appointments_admin" on public.appointments
for all using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- Storage bucket (create in Dashboard → Storage → new bucket "doctor-docs" as public or authenticated)
-- Policies must be added in Supabase UI for storage.objects

comment on table public.doctors is 'Directory + applications: pending rows from /apply, approved visible on site';
