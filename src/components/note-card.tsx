"use client";

import { useEffect, useRef, useState } from "react";
import {
  Pencil,
  Trash2,
  Paperclip,
  X,
  Loader2,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { deleteNote, updateNote } from "@/lib/actions";
import { uploadFiles } from "@/lib/upload";
import { formatDate, formatFileSize, wasEdited } from "@/lib/format";
import type { Note, NoteFile } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { NoteText } from "@/components/note-text";
import { Attachments } from "@/components/attachments";

const COLLAPSED_MAX_HEIGHT = 320;

export function NoteCard({
  note,
  username,
  onUpdated,
  onDeleted,
}: {
  note: Note;
  username: string;
  onUpdated?: (note: Note) => void;
  onDeleted?: (id: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Edit state
  const [body, setBody] = useState(note.body);
  const [keptFiles, setKeptFiles] = useState<NoteFile[]>(note.note_files ?? []);
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const fileInput = useRef<HTMLInputElement>(null);

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editing && contentRef.current) {
      setOverflowing(contentRef.current.scrollHeight > COLLAPSED_MAX_HEIGHT + 8);
    }
  }, [editing, note.body, note.note_files]);

  const edited = wasEdited(note.created_at, note.updated_at);

  function startEdit() {
    setBody(note.body);
    setKeptFiles(note.note_files ?? []);
    setNewFiles([]);
    setError(null);
    setEditing(true);
  }

  async function handleSave() {
    setError(null);
    if (!body.trim() && keptFiles.length === 0 && newFiles.length === 0) {
      setError("A note needs some text or a file.");
      return;
    }
    setBusy(true);
    try {
      const removeFiles = (note.note_files ?? []).filter(
        (f) => !keptFiles.some((k) => k.id === f.id)
      );
      const addFiles = newFiles.length ? await uploadFiles(note.user_id, newFiles) : [];
      const result = await updateNote({
        noteId: note.id,
        username,
        body,
        addFiles,
        removeFiles,
      });
      if (result.error || !result.note) {
        setError(result.error ?? "Could not save changes.");
        return;
      }
      setEditing(false);
      onUpdated?.(result.note);
    } catch {
      setError("Could not save changes. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    setBusy(true);
    try {
      const paths = (note.note_files ?? []).map((f) => f.path);
      const result = await deleteNote({ noteId: note.id, username, paths });
      if (result.error) {
        setError(result.error);
        setBusy(false);
        return;
      }
      onDeleted?.(note.id);
    } catch {
      setError("Could not delete the note.");
      setBusy(false);
    }
  }

  return (
    <Card className="p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {formatDate(note.created_at)}
          {edited && <span> · edited {formatDate(note.updated_at)}</span>}
        </p>
        {!editing && (
          <div className="flex shrink-0 gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={startEdit}
              disabled={busy}
              aria-label="Edit note"
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={handleDelete}
              disabled={busy}
              aria-label="Delete note"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
            </Button>
          </div>
        )}
      </div>

      {editing ? (
        <div className="space-y-3">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            className="min-h-24 resize-y"
            aria-label="Edit note text"
          />

          {keptFiles.length > 0 && (
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
            </ul>
          )}

          {newFiles.length > 0 && (
            <ul className="flex flex-wrap gap-2">
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

          <input
            ref={fileInput}
            type="file"
            multiple
            hidden
            onChange={(e) => {
              if (e.target.files) setNewFiles((p) => [...p, ...Array.from(e.target.files!)]);
              e.target.value = "";
            }}
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="gap-2"
              onClick={() => fileInput.current?.click()}
              disabled={busy}
            >
              <Paperclip className="h-4 w-4" />
              Attach
            </Button>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setEditing(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button type="button" size="sm" className="gap-2" onClick={handleSave} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                Save
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <>
          <div
            ref={contentRef}
            className="space-y-3 overflow-hidden transition-all"
            style={{ maxHeight: expanded || !overflowing ? "none" : COLLAPSED_MAX_HEIGHT }}
          >
            <NoteText text={note.body} />
            <Attachments files={note.note_files ?? []} />
          </div>

          {overflowing && (
            <Button
              variant="ghost"
              size="sm"
              className="mt-2 gap-1"
              onClick={() => setExpanded((v) => !v)}
            >
              {expanded ? (
                <>
                  <ChevronUp className="h-4 w-4" /> Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4" /> Show more
                </>
              )}
            </Button>
          )}

          {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        </>
      )}
    </Card>
  );
}
