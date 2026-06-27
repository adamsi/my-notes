"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import type { Note } from "@/lib/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { NoteComposer } from "@/components/note-composer";

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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="shrink-0 gap-2" />}>
        <Plus className="h-4 w-4" />
        Create new note
      </DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New note</DialogTitle>
        </DialogHeader>
        <NoteComposer
          userId={userId}
          username={username}
          onCreated={(note) => {
            onCreated(note);
            setOpen(false);
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
