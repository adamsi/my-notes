"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Note } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { NoteDialog } from "@/components/note-dialog";

export function CreateNoteDialog({
  userId,
  username,
  onCreated,
}: {
  userId: string;
  username: string;
  onCreated: (note: Note) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button className="shrink-0 gap-2" onClick={() => setOpen(true)}>
        <Plus className="h-4 w-4" />
        Create new note
      </Button>
      <NoteDialog
        open={open}
        onOpenChange={setOpen}
        userId={userId}
        username={username}
        onSaved={onCreated}
      />
    </>
  );
}
