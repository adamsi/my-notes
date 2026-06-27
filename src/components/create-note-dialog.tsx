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
      <DialogTrigger
        render={
          <Button
            size="lg"
            className="fixed bottom-6 right-6 z-30 h-12 gap-2 rounded-full px-5 shadow-lg sm:bottom-8 sm:right-8"
          />
        }
      >
        <Plus className="h-5 w-5" />
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
