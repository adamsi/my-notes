import { cookies } from "next/headers";
import { notFound } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { getNotes } from "@/lib/actions";
import type { User } from "@/lib/types";
import { NotesSection } from "@/components/notes-section";

export const dynamic = "force-dynamic";

export default async function UserPage({
  params,
  searchParams,
}: {
  params: Promise<{ user: string }>;
  searchParams: Promise<{ q?: string }>;
}) {
  const { user: userParam } = await params;
  const { q } = await searchParams;
  const name = decodeURIComponent(userParam);
  const query = (q ?? "").trim();

  const supabase = createClient(await cookies());
  const { data: user } = await supabase
    .from("users")
    .select("*")
    .eq("name", name)
    .maybeSingle();

  if (!user) notFound();
  const typedUser = user as User;

  const { notes, total } = await getNotes(typedUser.id, query, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">{typedUser.name}&apos;s notes</h1>

      <NotesSection
        key={query}
        userId={typedUser.id}
        username={typedUser.name}
        query={query}
        initialNotes={notes}
        total={total}
      />
    </div>
  );
}
