export type User = {
  id: string;
  name: string;
  created_at: string;
};

export type NoteFile = {
  id: string;
  note_id: string;
  name: string;
  path: string;
  mime_type: string;
  size: number;
  created_at: string;
};

export type Note = {
  id: string;
  user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
  note_files: NoteFile[];
};

export const PAGE_SIZE = 10;
