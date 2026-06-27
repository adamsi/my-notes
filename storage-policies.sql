drop policy if exists "my_notes_read"   on storage.objects;
drop policy if exists "my_notes_insert" on storage.objects;
drop policy if exists "my_notes_delete" on storage.objects;

create policy "my_notes_read"   on storage.objects for select to anon using (bucket_id = 'my-notes');
create policy "my_notes_insert" on storage.objects for insert to anon with check (bucket_id = 'my-notes');
create policy "my_notes_delete" on storage.objects for delete to anon using (bucket_id = 'my-notes');
