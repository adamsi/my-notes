"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Check, Loader2, NotebookPen } from "lucide-react";
import { deleteUsers } from "@/lib/actions";
import type { User } from "@/lib/types";
import { AddUserDialog } from "@/components/add-user-dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export function UsersManager({ users: initialUsers }: { users: User[] }) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);
  const [selecting, setSelecting] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [dialogOpen, setDialogOpen] = useState(false);
  const [passKey, setPassKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function cancelSelect() {
    setSelecting(false);
    setSelected(new Set());
  }

  async function handleDelete() {
    setError(null);
    if (!passKey.trim()) {
      setError("Enter the passkey.");
      return;
    }
    setBusy(true);
    try {
      const ids = [...selected];
      const res = await deleteUsers(ids, passKey.trim());
      if (res.error) {
        setError(res.error);
        return;
      }
      setUsers((prev) => prev.filter((u) => !selected.has(u.id)));
      setDialogOpen(false);
      setPassKey("");
      cancelSelect();
      router.refresh();
    } catch {
      setError("Could not delete users. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            {selecting ? "Select users to delete." : "Choose a user to open their notes."}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selecting ? (
            <>
              <Button variant="outline" onClick={cancelSelect} disabled={busy}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                className="gap-2"
                disabled={selected.size === 0}
                onClick={() => {
                  setError(null);
                  setPassKey("");
                  setDialogOpen(true);
                }}
              >
                <Trash2 className="h-4 w-4" />
                Delete ({selected.size})
              </Button>
            </>
          ) : (
            <>
              {users.length > 0 && (
                <Button variant="outline" className="gap-2" onClick={() => setSelecting(true)}>
                  <Trash2 className="h-4 w-4" />
                  Delete users
                </Button>
              )}
              <AddUserDialog />
            </>
          )}
        </div>
      </div>

      {users.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-10 text-center">
          <NotebookPen className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No users yet</p>
          <p className="text-sm text-muted-foreground">Add your first user to get started.</p>
        </Card>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {users.map((user) => {
            const isSelected = selected.has(user.id);
            const inner = (
              <>
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="mt-3 truncate font-medium">{user.name}</span>
              </>
            );
            return (
              <li key={user.id}>
                {selecting ? (
                  <button
                    type="button"
                    onClick={() => toggle(user.id)}
                    aria-pressed={isSelected}
                    className={`relative flex h-full min-h-24 w-full flex-col justify-between rounded-xl border bg-card p-4 text-left transition-colors hover:bg-accent ${
                      isSelected ? "border-primary ring-2 ring-primary" : ""
                    }`}
                  >
                    <span
                      className={`absolute right-2 top-2 grid h-5 w-5 place-items-center rounded-full border ${
                        isSelected
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border bg-background"
                      }`}
                    >
                      {isSelected && <Check className="h-3.5 w-3.5" />}
                    </span>
                    {inner}
                  </button>
                ) : (
                  <Link
                    href={`/${encodeURIComponent(user.name)}`}
                    className="flex h-full min-h-24 flex-col justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                  >
                    {inner}
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      )}

      <Dialog open={dialogOpen} onOpenChange={(o) => !busy && setDialogOpen(o)}>
        <DialogContent showCloseButton={false}>
          <DialogHeader>
            <DialogTitle>
              Delete {selected.size} {selected.size === 1 ? "user" : "users"}?
            </DialogTitle>
            <DialogDescription>
              This permanently removes the selected {selected.size === 1 ? "user" : "users"} and all
              their notes and files. Enter the passkey to confirm.
            </DialogDescription>
          </DialogHeader>
          <div className="py-2">
            <Input
              type="password"
              value={passKey}
              onChange={(e) => setPassKey(e.target.value)}
              placeholder="Passkey"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === "Enter") handleDelete();
              }}
              aria-label="Passkey"
            />
            {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)} disabled={busy}>
              Cancel
            </Button>
            <Button variant="destructive" className="gap-2" onClick={handleDelete} disabled={busy}>
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
