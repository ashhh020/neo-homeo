-- Storage for doctor application documents (run after creating project)
insert into storage.buckets (id, name, public)
values ('doctor-docs', 'doctor-docs', true)
on conflict (id) do nothing;

create policy "doctor_docs_insert"
on storage.objects for insert to anon, authenticated
with check (bucket_id = 'doctor-docs');

create policy "doctor_docs_select"
on storage.objects for select to anon, authenticated
using (bucket_id = 'doctor-docs');
