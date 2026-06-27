import Link from "next/link";
import { cookies } from "next/headers";
import { NotebookPen } from "lucide-react";
import { createClient } from "@/utils/supabase/server";
import { AddUserDialog } from "@/components/add-user-dialog";
import { Card } from "@/components/ui/card";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: true });

  const users = (data as User[]) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
          <p className="text-sm text-muted-foreground">
            Choose a user to open their notes.
          </p>
        </div>
        <AddUserDialog />
      </div>

      {error ? (
        <Card className="border-destructive/40 p-6 text-sm text-destructive">
          Could not load users. Make sure the database is set up, then refresh.
        </Card>
      ) : users.length === 0 ? (
        <Card className="flex flex-col items-center gap-2 p-10 text-center">
          <NotebookPen className="h-8 w-8 text-muted-foreground" />
          <p className="font-medium">No users yet</p>
          <p className="text-sm text-muted-foreground">
            Add your first user to get started.
          </p>
        </Card>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {users.map((user) => (
            <li key={user.id}>
              <Link
                href={`/${encodeURIComponent(user.name)}`}
                className="flex h-full min-h-24 flex-col justify-between rounded-xl border bg-card p-4 transition-colors hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <span className="mt-3 truncate font-medium">{user.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
