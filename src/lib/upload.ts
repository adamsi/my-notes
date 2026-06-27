import { createClient } from "@/utils/supabase/client";
import type { IncomingFile } from "@/lib/actions";

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "my-notes";

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

/** Upload a single file to storage and return its metadata row. */
export async function uploadFile(userId: string, file: File): Promise<IncomingFile> {
  const supabase = createClient();
  const path = `${userId}/${crypto.randomUUID()}-${sanitize(file.name)}`;

  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "3600",
    upsert: false,
    contentType: file.type || "application/octet-stream",
  });
  if (error) throw new Error(error.message);

  return {
    name: file.name,
    path,
    mime_type: file.type || "application/octet-stream",
    size: file.size,
  };
}

export async function uploadFiles(userId: string, files: File[]): Promise<IncomingFile[]> {
  return Promise.all(files.map((f) => uploadFile(userId, f)));
}
