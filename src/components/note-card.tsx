"use client";

import { useEffect, useRef, useState } from "react";
import { Pencil, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { deleteNote } from "@/lib/actions";
import { formatDate, wasEdited } from "@/lib/format";
import type { Note } from "@/lib/types";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { NoteText } from "@/components/note-text";
import { Attachments } from "@/components/attachments";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { NoteDialog } from "@/components/note-dialog";

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

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);

  useEffect(() => {
    if (contentRef.current) {
      setOverflowing(contentRef.current.scrollHeight > COLLAPSED_MAX_HEIGHT + 8);
    }
  }, [note.body, note.note_files]);

  const edited = wasEdited(note.created_at, note.updated_at);

  async function handleDelete() {
    setBusy(true);
    try {
      const paths = (note.note_files ?? []).map((f) => f.path);
      const result = await deleteNote({ noteId: note.id, username, paths });
      if (result.error) {
        setError(result.error);
        setBusy(false);
        setConfirmOpen(false);
        return;
      }
      onDeleted?.(note.id);
    } catch {
      setError("Could not delete the note.");
      setBusy(false);
      setConfirmOpen(false);
    }
  }

  return (
    <Card className="bg-muted p-4">
      <div className="mb-3 flex items-start justify-between gap-2">
        <p className="text-xs text-muted-foreground">
          {formatDate(note.created_at)}
          {edited && <span> · edited {formatDate(note.updated_at)}</span>}
        </p>
        <div className="flex shrink-0 gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setEditing(true)}
            disabled={busy}
            aria-label="Edit note"
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-destructive hover:text-destructive"
            onClick={() => setConfirmOpen(true)}
            disabled={busy}
            aria-label="Delete note"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

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

      <NoteDialog
        open={editing}
        onOpenChange={setEditing}
        userId={note.user_id}
        username={username}
        note={note}
        onSaved={(updated) => onUpdated?.(updated)}
      />

      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={(o) => !busy && setConfirmOpen(o)}
        title="Delete this note?"
        description="This permanently removes the note and its attachments. This cannot be undone."
        confirmLabel="Delete"
        destructive
        loading={busy}
        onConfirm={handleDelete}
      />
    </Card>
  );
}
