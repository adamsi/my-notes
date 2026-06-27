import { linkify } from "@/lib/format";

/** Renders note text with auto-detected, clickable links. */
export function NoteText({ text }: { text: string }) {
  if (!text) return null;
  const parts = linkify(text);
  return (
    <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
      {parts.map((part, i) =>
        part.type === "link" ? (
          <a
            key={i}
            href={part.value}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-primary underline underline-offset-2 break-all hover:opacity-80"
          >
            {part.value}
          </a>
        ) : (
          <span key={i}>{part.value}</span>
        )
      )}
    </p>
  );
}
