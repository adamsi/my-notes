drop schema if exists mynotes cascade;
create schema mynotes;

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
