-- ─── FIX 1: drop the recursive admin policies on profiles ───────────
-- These policies called is_admin() which queries profiles → infinite loop.
drop policy if exists "profiles_admin_select" on public.profiles;
drop policy if exists "profiles_admin_update" on public.profiles;

-- ─── FIX 2: replace is_admin() with a non-recursive version ─────────
-- The new function is owned by postgres (which has BYPASSRLS in Supabase),
-- so it reads profiles without triggering RLS at all.
drop function if exists public.is_admin();

create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_role text;
begin
  select role into v_role
  from public.profiles
  where id = auth.uid();
  return coalesce(v_role = 'admin', false);
end;
$$;

-- Ensure function is owned by the postgres role (has bypassrls in Supabase)
alter function public.is_admin() owner to postgres;

-- ─── FIX 3: safe admin policies on profiles ──────────────────────────
-- Admins see/update all profiles — now safe because is_admin() bypasses RLS.
create policy "profiles_admin_select" on public.profiles
  for select using (public.is_admin());

create policy "profiles_admin_update" on public.profiles
  for update using (public.is_admin());

-- ─── FIX 4: doctors — approved doctor can see their own pending row ──
-- Lets an approved doctor log in and find their doctor row by email.
create policy "doctors_select_own_email" on public.doctors
  for select using (
    email = (select email from auth.users where id = auth.uid())
  );

-- ─── FIX 5: doctors — approved doctor can update their own row ───────
create policy "doctors_update_own" on public.doctors
  for update using (
    profile_id = auth.uid() or
    email = (select email from auth.users where id = auth.uid())
  );

-- ─── FIX 6: storage bucket doctor-docs ───────────────────────────────
-- Creates the bucket if it doesn't exist (idempotent via conflict ignore).
insert into storage.buckets (id, name, public)
values ('doctor-docs', 'doctor-docs', true)
on conflict (id) do nothing;

-- Anyone can upload to doctor-docs (doctor application form is public)
create policy "doctor_docs_insert_public" on storage.objects
  for insert with check (bucket_id = 'doctor-docs');

-- Anyone can read doctor-docs (photos displayed on public site)
create policy "doctor_docs_select_public" on storage.objects
  for select using (bucket_id = 'doctor-docs');

-- Only admins can delete
create policy "doctor_docs_delete_admin" on storage.objects
  for delete using (bucket_id = 'doctor-docs' and public.is_admin());
