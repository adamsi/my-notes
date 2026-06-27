"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { putObject, deleteObjects } from "@/lib/storage";
import { PAGE_SIZE, type Note, type NoteFile } from "@/lib/types";

async function db() {
  return createClient(await cookies());
}

export type ActionState = { error?: string };

export type IncomingFile = {
  name: string;
  path: string;
  mime_type: string;
  size: number;
};

/** Upload attachments to storage (server-side, via S3) and return their metadata. */
export async function uploadFiles(
  userId: string,
  formData: FormData
): Promise<{ files?: IncomingFile[]; error?: string }> {
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  try {
    const uploaded = await Promise.all(
      files.map(async (file) => {
        const bytes = new Uint8Array(await file.arrayBuffer());
        const path = await putObject(userId, { name: file.name, type: file.type, bytes });
        return {
          name: file.name,
          path,
          mime_type: file.type || "application/octet-stream",
          size: file.size,
        };
      })
    );
    return { files: uploaded };
  } catch {
    return { error: "File upload failed. Please try again." };
  }
}

/** Create a user from a form. Redirects to the user's page on success. */
export async function createUser(
  _prev: ActionState,
  formData: FormData
): Promise<ActionState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { error: "Please enter a name." };
  if (name.length > 40) return { error: "Name is too long (max 40 characters)." };

  const supabase = await db();
  const { error } = await supabase.from("users").insert({ name });

  if (error) {
    if (error.code === "23505") return { error: "That name is already taken." };
    return { error: "Could not create user. Please try again." };
  }

  revalidatePath("/");
  redirect(`/${encodeURIComponent(name)}`);
}

/** Delete one or more users (and their notes + files). Requires the passkey. */
export async function deleteUsers(
  userIds: string[],
  passKey: string
): Promise<ActionState> {
  if (passKey !== process.env.DELETE_PASSKEY) return { error: "Incorrect passkey." };
  if (!userIds.length) return { error: "No users selected." };

  const supabase = await db();

  // Remove stored files for all of these users' notes first.
  const { data: notes } = await supabase
    .from("notes")
    .select("note_files(path)")
    .in("user_id", userIds);
  const paths = (notes ?? []).flatMap(
    (n: { note_files?: { path: string }[] }) => (n.note_files ?? []).map((f) => f.path)
  );
  if (paths.length) await deleteObjects(paths);

  // Deleting users cascades to their notes and note_files rows.
  const { error } = await supabase.from("users").delete().in("id", userIds);
  if (error) return { error: "Could not delete users. Please try again." };

  revalidatePath("/");
  return {};
}

/** Paged, optionally-searched notes for a user (newest first). */
export async function getNotes(
  userId: string,
  query: string,
  offset: number
): Promise<{ notes: Note[]; total: number }> {
  const supabase = await db();
  let request = supabase
    .from("notes")
    .select("*, note_files(*)", { count: "exact" })
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .range(offset, offset + PAGE_SIZE - 1);

  const q = query.trim();
  if (q) request = request.ilike("body", `%${q}%`);

  const { data, count, error } = await request;
  if (error) throw new Error(error.message);
  return { notes: (data as Note[]) ?? [], total: count ?? 0 };
}

export type NoteResult = ActionState & { note?: Note };

export async function createNote(input: {
  userId: string;
  username: string;
  body: string;
  files: IncomingFile[];
}): Promise<NoteResult> {
  const body = input.body.trim();
  if (!body && input.files.length === 0) {
    return { error: "Add some text or a file first." };
  }

  const supabase = await db();
  const { data: note, error } = await supabase
    .from("notes")
    .insert({ user_id: input.userId, body })
    .select("id")
    .single();

  if (error || !note) return { error: "Could not save the note." };

  if (input.files.length) {
    const rows = input.files.map((f) => ({ ...f, note_id: note.id }));
    const { error: filesError } = await supabase.from("note_files").insert(rows);
    if (filesError) return { error: "Note saved, but files failed to attach." };
  }

  revalidatePath(`/${encodeURIComponent(input.username)}`);
  return { note: await fetchNote(supabase, note.id) };
}

async function fetchNote(
  supabase: Awaited<ReturnType<typeof db>>,
  noteId: string
): Promise<Note | undefined> {
  const { data } = await supabase
    .from("notes")
    .select("*, note_files(*)")
    .eq("id", noteId)
    .single();
  return (data as Note) ?? undefined;
}

export async function updateNote(input: {
  noteId: string;
  username: string;
  body: string;
  addFiles: IncomingFile[];
  removeFiles: NoteFile[];
}): Promise<NoteResult> {
  const supabase = await db();

  const { error } = await supabase
    .from("notes")
    .update({ body: input.body.trim(), updated_at: new Date().toISOString() })
    .eq("id", input.noteId);
  if (error) return { error: "Could not update the note." };

  if (input.removeFiles.length) {
    const ids = input.removeFiles.map((f) => f.id);
    await deleteObjects(input.removeFiles.map((f) => f.path));
    await supabase.from("note_files").delete().in("id", ids);
  }

  if (input.addFiles.length) {
    const rows = input.addFiles.map((f) => ({ ...f, note_id: input.noteId }));
    await supabase.from("note_files").insert(rows);
  }

  revalidatePath(`/${encodeURIComponent(input.username)}`);
  return { note: await fetchNote(supabase, input.noteId) };
}

export async function deleteNote(input: {
  noteId: string;
  username: string;
  paths: string[];
}): Promise<ActionState> {
  const supabase = await db();

  if (input.paths.length) {
    await deleteObjects(input.paths);
  }
  const { error } = await supabase.from("notes").delete().eq("id", input.noteId);
  if (error) return { error: "Could not delete the note." };

  revalidatePath(`/${encodeURIComponent(input.username)}`);
  return {};
}
