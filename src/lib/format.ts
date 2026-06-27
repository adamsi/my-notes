const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "my-notes";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

const dateFormatter = new Intl.DateTimeFormat("en-GB", {
  year: "numeric",
  month: "short",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

/** Human date with minute precision, e.g. "27 Jun 2026, 14:08". */
export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

/** True when a note was edited after creation (more than a second apart). */
export function wasEdited(createdAt: string, updatedAt: string): boolean {
  return new Date(updatedAt).getTime() - new Date(createdAt).getTime() > 1000;
}

export function formatFileSize(bytes: number): string {
  if (!bytes) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, i);
  return `${value.toFixed(value >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function isImage(mimeType: string): boolean {
  return mimeType.startsWith("image/");
}

/** Public URL for a stored object path in the notes bucket. */
export function publicUrl(path: string): string {
  return `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`;
}

/**
 * URL that forces a download (Content-Disposition: attachment) via Supabase's
 * `?download` param — works cross-origin where the `download` attribute does not.
 */
export function downloadUrl(path: string, name: string): string {
  return `${publicUrl(path)}?download=${encodeURIComponent(name)}`;
}

const URL_REGEX = /(https?:\/\/[^\s<]+[^\s<.,:;"')\]!?])/gi;

export type TextPart = { type: "text" | "link"; value: string };

/** Split text into plain and link parts so URLs can be rendered clickable. */
export function linkify(text: string): TextPart[] {
  const parts: TextPart[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(URL_REGEX)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, index) });
    }
    parts.push({ type: "link", value: match[0] });
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }
  return parts;
}
