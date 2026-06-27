import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import { UsersManager } from "@/components/users-manager";
import { Card } from "@/components/ui/card";
import type { User } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const supabase = createClient(await cookies());
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .order("created_at", { ascending: true });

  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
        <Card className="border-destructive/40 p-6 text-sm text-destructive">
          Could not load users. Make sure the database is set up, then refresh.
        </Card>
      </div>
    );
  }

  return <UsersManager users={(data as User[]) ?? []} />;
}
