"use client";

import { useRef, useState } from "react";
import { Paperclip, X, Loader2 } from "lucide-react";
import { createNote, updateNote, uploadFiles } from "@/lib/actions";
import { formatFileSize } from "@/lib/format";
import type { Note, NoteFile } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

export function NoteComposer({
  userId,
  username,
  note,
  onSaved,
  onCancel,
}: {
  userId: string;
  username: string;
  /** When provided, the composer edits this note instead of creating a new one. */
  note?: Note;
  onSaved: (note: Note) => void;
  onCancel?: () => void;
}) {
  const isEditing = !!note;
  const fileInput = useRef<HTMLInputElement>(null);
  const [body, setBody] = useState(note?.body ?? "");
  const [keptFiles, setKeptFiles] = useState<NoteFile[]>(note?.note_files ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function addFiles(picked: File[]) {
    if (picked.length) setNewFiles((prev) => [...prev, ...picked]);
  }

  async function handleSubmit() {
    setError(null);
    if (!body.trim() && keptFiles.length === 0 && newFiles.length === 0) {
      setError("Add some text or a file first.");
      return;
    }
    setBusy(true);
    try {
      let uploaded: { name: string; path: string; mime_type: string; size: number }[] = [];
      if (newFiles.length) {
        const fd = new FormData();
        newFiles.forEach((f) => fd.append("files", f));
        const up = await uploadFiles(note?.user_id ?? userId, fd);
        if (up.error || !up.files) {
          setError(up.error ?? "File upload failed.");
          return;
        }
        uploaded = up.files;
      }

      if (isEditing && note) {
        const removeFiles = (note.note_files ?? []).filter(
          (f) => !keptFiles.some((k) => k.id === f.id)
        );
        const result = await updateNote({
          noteId: note.id,
          username,
          body,
          addFiles: uploaded,
          removeFiles,
        });
        if (result.error || !result.note) {
          setError(result.error ?? "Could not save changes.");
          return;
        }
        onSaved(result.note);
      } else {
        const result = await createNote({ userId, username, body, files: uploaded });
        if (result.error || !result.note) {
          setError(result.error ?? "Could not save the note.");
          return;
        }
        setBody("");
        setNewFiles([]);
        onSaved(result.note);
      }
    } catch {
      setError("Something went wrong while saving. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-3">
      <Textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Write a note… paste links, and attach files below."
        className="min-h-48 flex-1 resize-none text-base sm:min-h-64"
        autoFocus
        aria-label="Note text"
      />

      {(keptFiles.length > 0 || newFiles.length > 0) && (
        <ul className="flex flex-wrap gap-2">
          {keptFiles.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-2 rounded-full border bg-muted/50 py-1 pl-3 pr-1 text-xs"
            >
              <span className="max-w-40 truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => setKeptFiles((p) => p.filter((f) => f.id !== file.id))}
                className="grid h-5 w-5 place-items-center rounded-full hover:bg-background"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
          {newFiles.map((file, i) => (
            <li
              key={i}
              className="flex items-center gap-2 rounded-full border border-dashed bg-muted/50 py-1 pl-3 pr-1 text-xs"
            >
              <span className="max-w-40 truncate">{file.name}</span>
              <span className="text-muted-foreground">{formatFileSize(file.size)}</span>
              <button
                type="button"
                onClick={() => setNewFiles((p) => p.filter((_, idx) => idx !== i))}
                className="grid h-5 w-5 place-items-center rounded-full hover:bg-background"
                aria-label={`Remove ${file.name}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}

      <div className="flex items-center justify-between gap-2">
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
        <div className="flex gap-2">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel} disabled={busy}>
              Cancel
            </Button>
          )}
          <Button type="button" onClick={handleSubmit} disabled={busy} className="gap-2">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {busy ? "Saving…" : isEditing ? "Save changes" : "Add note"}
          </Button>
        </div>
      </div>
    </div>
  );
}
