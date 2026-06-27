"use client";

import { useActionState, useState } from "react";
import { Plus } from "lucide-react";
import { createUser, type ActionState } from "@/lib/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const initialState: ActionState = {};

export function AddUserDialog() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(createUser, initialState);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button size="lg" className="gap-2" />}>
        <Plus className="h-4 w-4" />
        Add user
      </DialogTrigger>
      <DialogContent>
        <form action={formAction}>
          <DialogHeader>
            <DialogTitle>Add a user</DialogTitle>
            <DialogDescription>
              Pick a name to start a personal notes space.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              name="name"
              placeholder="e.g. Adam"
              autoFocus
              maxLength={40}
              aria-label="User name"
            />
            {state.error ? (
              <p className="mt-2 text-sm text-destructive">{state.error}</p>
            ) : null}
          </div>
          <DialogFooter>
            <Button type="submit" disabled={pending} className="w-full sm:w-auto">
              {pending ? "Creating…" : "Create user"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
