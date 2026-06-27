"use client";

import { useRef, useState } from "react";
import { Paperclip, X, Loader2 } from "lucide-react";
import { createNote, uploadFiles } from "@/lib/actions";
import { formatFileSize } from "@/lib/format";
import type { Note } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function NoteComposer({
  userId,
  username,
  onCreated,
}: {
  userId: string;
  username: string;
  onCreated: (note: Note) => void;
}) {
  const fileInput = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFiles(picked: File[]) {
    if (picked.length) setFiles((prev) => [...prev, ...picked]);
  }

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit() {
    setError(null);
    if (!body.trim() && files.length === 0) {
      setError("Add some text or a file first.");
      return;
    }
    setBusy(true);
    try {
      let uploaded: { name: string; path: string; mime_type: string; size: number }[] = [];
      if (files.length) {
        const fd = new FormData();
        files.forEach((f) => fd.append("files", f));
        const up = await uploadFiles(userId, fd);
        if (up.error || !up.files) {
          setError(up.error ?? "File upload failed.");
          return;
        }
        uploaded = up.files;
      }
      const result = await createNote({ userId, username, body, files: uploaded });
      if (result.error || !result.note) {
        setError(result.error ?? "Could not save the note.");
        return;
      }
      setBody("");
      setFiles([]);
      onCreated(result.note);
    } catch {
      setError("Something went wrong while saving. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a note… paste links, and attach files below."
        className="min-h-32 resize-y"
        autoFocus
        aria-label="Note text"
      />

      {files.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-2">
          {files.map((file, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-full border bg-muted/50 py-1 pl-3 pr-1 text-xs"
            >
              <span className="max-w-40 truncate">{file.name}</span>
              <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="grid h-5 w-5 place-items-center rounded-full hover:bg-background"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="mt-2 text-sm text-destructive">{error}</p>}

      <div className="mt-3 flex items-center justify-between gap-2">
        <input
          ref={fileInput}
          type="file"
          multiple
          hidden
          onChange={(e) => {
            const picked = Array.from(e.target.files ?? []);
            e.target.value = "";
            addFiles(picked);
          }}
        />
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={() => fileInput.current?.click()}
          disabled={busy}
        >
          <Paperclip className="h-4 w-4" />
          Attach files
        </Button>
        <Button type="button" onClick={handleSubmit} disabled={busy} className="gap-2">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}
          {busy ? "Saving…" : "Add note"}
        </Button>
      </div>
    </div>
  );
}
