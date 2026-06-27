"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";

export function SiteHeader() {
  const pathname = usePathname();
  const segment =
    pathname === "/" ? "" : decodeURIComponent(pathname.split("/").filter(Boolean)[0] ?? "");

  return (
    <header className="sticky top-0 z-10 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between gap-3 px-4">
        <Link href="/" className="flex shrink-0 items-center gap-2.5 font-semibold">
          <Logo className="h-10 w-10" />
          <span className="text-2xl font-bold tracking-tight">mynotes</span>
        </Link>
        {segment && (
          <span className="truncate text-lg font-semibold tracking-tight text-muted-foreground">
            {segment}&apos;s notes
          </span>
        )}
      </div>
    </header>
  );
}
