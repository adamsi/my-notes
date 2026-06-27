-- mynotes — Supabase schema setup
-- Run this once in the Supabase Dashboard → SQL Editor.
-- This app has NO authentication by design, so policies are fully public (anon).
--
-- IMPORTANT: after running this, expose the `mynotes` schema to the Data API:
--   Dashboard → Project Settings → API → "Exposed schemas" → add `mynotes` → Save.
-- Otherwise the REST API (supabase-js) cannot see these tables.

-- ── Schema ───────────────────────────────────────────────────────────────────
drop schema if exists mynotes cascade;
create schema mynotes;

grant usage on schema mynotes to anon, authenticated, service_role;

-- ── Tables ──────────────────────────────────────────────────────────────────
create table mynotes.users (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  created_at timestamptz not null default now()
);

create table mynotes.notes (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references mynotes.users (id) on delete cascade,
  body       text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table mynotes.note_files (
  id         uuid primary key default gen_random_uuid(),
  note_id    uuid not null references mynotes.notes (id) on delete cascade,
  name       text not null,
  path       text not null,
  mime_type  text not null default '',
  size       bigint not null default 0,
  created_at timestamptz not null default now()
);

create index notes_user_id_idx     on mynotes.notes (user_id);
create index notes_created_at_idx   on mynotes.notes (created_at desc);
create index note_files_note_id_idx on mynotes.note_files (note_id);

-- REST API roles need table privileges in addition to RLS policies.
grant all on all tables in schema mynotes to anon, authenticated, service_role;
alter default privileges in schema mynotes
  grant all on tables to anon, authenticated, service_role;

-- ── Row Level Security (public, no-auth app) ─────────────────────────────────
alter table mynotes.users      enable row level security;
alter table mynotes.notes      enable row level security;
alter table mynotes.note_files enable row level security;

create policy "public_all_users"      on mynotes.users      for all using (true) with check (true);
create policy "public_all_notes"      on mynotes.notes      for all using (true) with check (true);
create policy "public_all_note_files" on mynotes.note_files for all using (true) with check (true);

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
