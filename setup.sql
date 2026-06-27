-- mynotes — Supabase schema setup
-- Run this once in the Supabase Dashboard → SQL Editor.
-- This app has NO authentication by design, so policies are fully public (anon).

-- ── Tables ──────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

create table if not exists public.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users (id) on delete cascade,
  body       text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.note_files (
  id         uuid primary key default gen_random_uuid(),
  note_id    uuid not null references public.notes (id) on delete cascade,
  name       text not null,
  path       text not null,
  mime_type  text not null default '',
  size       bigint not null default 0,
  created_at timestamptz not null default now()
);

create index if not exists notes_user_id_idx       on public.notes (user_id);
create index if not exists notes_created_at_idx     on public.notes (created_at desc);
create index if not exists note_files_note_id_idx   on public.note_files (note_id);

-- ── Row Level Security (public, no-auth app) ─────────────────────────────────
alter table public.users      enable row level security;
alter table public.notes      enable row level security;
alter table public.note_files enable row level security;

drop policy if exists "public_all_users"      on public.users;
drop policy if exists "public_all_notes"      on public.notes;
drop policy if exists "public_all_note_files" on public.note_files;

create policy "public_all_users"      on public.users      for all using (true) with check (true);
create policy "public_all_notes"      on public.notes      for all using (true) with check (true);
create policy "public_all_note_files" on public.note_files for all using (true) with check (true);

-- ── Storage bucket: my-notes ─────────────────────────────────────────────────
-- Create a PUBLIC bucket named `my-notes`
-- (Dashboard → Storage → New bucket → name "my-notes" → toggle "Public bucket").
-- The statement below also creates it if your project allows SQL bucket creation:
insert into storage.buckets (id, name, public)
values ('my-notes', 'my-notes', true)
on conflict (id) do update set public = true;

-- Public storage policies for the bucket (read / upload / delete via anon).
drop policy if exists "my_notes_read"   on storage.objects;
drop policy if exists "my_notes_insert" on storage.objects;
drop policy if exists "my_notes_delete" on storage.objects;

create policy "my_notes_read"   on storage.objects for select using (bucket_id = 'my-notes');
create policy "my_notes_insert" on storage.objects for insert with check (bucket_id = 'my-notes');
create policy "my_notes_delete" on storage.objects for delete using (bucket_id = 'my-notes');
