-- Doctors can read/update their own directory row by email match (after approval)
create policy "doctors_select_own_email" on public.doctors
for select to authenticated
using (lower(coalesce(email,'')) = lower(coalesce(auth.jwt() ->> 'email', '')));

create policy "doctors_update_own_email" on public.doctors
for update to authenticated
using (lower(coalesce(email,'')) = lower(coalesce(auth.jwt() ->> 'email', '')))
with check (lower(coalesce(email,'')) = lower(coalesce(auth.jwt() ->> 'email', '')));
