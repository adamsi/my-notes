"use client";

import { useState } from "react";
import { Loader2, NotebookPen } from "lucide-react";
import { getNotes } from "@/lib/actions";
import { type Note } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NoteCard } from "@/components/note-card";

export function NoteList({
  userId,
  username,
  query,
  initialNotes,
  total,
}: {
  userId: string;
  username: string;
  query: string;
  initialNotes: Note[];
  total: number;
}) {
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [count, setCount] = useState(total);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasMore = notes.length < count;

  async function loadMore() {
    setLoading(true);
    setError(null);
    try {
      const { notes: more, total: fresh } = await getNotes(userId, query, notes.length);
      setNotes((prev) => [...prev, ...more]);
      setCount(fresh);
    } catch {
      setError("Could not load more notes.");
    } finally {
      setLoading(false);
    }
  }

  if (notes.length === 0) {
    return (
      <Card className="flex flex-col items-center gap-2 p-10 text-center">
        <NotebookPen className="h-8 w-8 text-muted-foreground" />
        <p className="font-medium">{query ? "No matching notes" : "No notes yet"}</p>
        <p className="text-sm text-muted-foreground">
          {query ? "Try a different search." : "Write your first note above."}
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {notes.map((note) => (
        <NoteCard
          key={note.id}
          note={note}
          username={username}
          onDeleted={(id) => {
            setNotes((prev) => prev.filter((n) => n.id !== id));
            setCount((c) => Math.max(0, c - 1));
          }}
        />
      ))}

      {error && <p className="text-center text-sm text-destructive">{error}</p>}

      {hasMore && (
        <div className="flex justify-center pt-2">
          <Button variant="outline" onClick={loadMore} disabled={loading} className="gap-2">
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {loading ? "Loading…" : `Show more (${count - notes.length})`}
          </Button>
        </div>
      )}

      <p className="pt-1 text-center text-xs text-muted-foreground">
        Showing {notes.length} of {count} {count === 1 ? "note" : "notes"}
      </p>
    </div>
  );
}
