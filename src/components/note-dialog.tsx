"use client";

import type { Note } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { NoteComposer } from "@/components/note-composer";

/**
 * Large note editor modal. Anchored to the top on mobile so the on-screen
 * keyboard doesn't cover it, centered on larger screens.
 */
const noteDialogContentClassName =
  "flex max-h-[calc(100dvh-2rem)] w-full flex-col gap-4 overflow-y-auto top-4 -translate-y-0 sm:top-1/2 sm:max-w-2xl sm:-translate-y-1/2";

export function NoteDialog({
  open,
  onOpenChange,
  userId,
  username,
  note,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  username: string;
  note?: Note;
  onSaved: (note: Note) => void;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={noteDialogContentClassName}>
        <DialogHeader>
          <DialogTitle>{note ? "Edit note" : "New note"}</DialogTitle>
        </DialogHeader>
        <NoteComposer
          userId={userId}
          username={username}
          note={note}
          onSaved={(saved) => {
            onSaved(saved);
            onOpenChange(false);
          }}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}
