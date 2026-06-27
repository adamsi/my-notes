"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";

export function SearchBar({ initialQuery }: { initialQuery: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const [value, setValue] = useState(initialQuery);
  const firstRender = useRef(true);

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const id = setTimeout(() => {
      const q = value.trim();
      router.replace(q ? `${pathname}?q=${encodeURIComponent(q)}` : pathname, {
        scroll: false,
      });
    }, 300);
    return () => clearTimeout(id);
  }, [value, pathname, router]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search notes…"
        className="pl-9 pr-9"
        aria-label="Search notes"
      />
      {value && (
        <button
          type="button"
          onClick={() => setValue("")}
          className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-accent"
          aria-label="Clear search"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
