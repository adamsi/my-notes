import { Download, FileText } from "lucide-react";
import { downloadUrl, formatFileSize, isImage, publicUrl } from "@/lib/format";
import type { NoteFile } from "@/lib/types";

/** Image thumbnails inline; every other file type as a download chip. */
export function Attachments({ files }: { files: NoteFile[] }) {
  if (!files.length) return null;

  const images = files.filter((f) => isImage(f.mime_type));
  const others = files.filter((f) => !isImage(f.mime_type));

  return (
    <div className="space-y-3">
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((file) => (
            <a
              key={file.id}
              href={publicUrl(file.path)}
              target="_blank"
              rel="noopener noreferrer"
              className="group relative overflow-hidden rounded-lg border bg-muted"
              title={file.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={publicUrl(file.path)}
                alt={file.name}
                loading="lazy"
                className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
              />
            </a>
          ))}
        </div>
      )}

      {others.length > 0 && (
        <ul className="flex flex-col gap-2">
          {others.map((file) => (
            <li
              key={file.id}
              className="flex items-center gap-3 rounded-lg border bg-card p-3 transition-colors hover:bg-accent"
            >
              <FileText className="h-5 w-5 shrink-0 text-muted-foreground" />
              {/* Click the name to open the file in a new tab */}
              <a
                href={publicUrl(file.path)}
                target="_blank"
                rel="noopener noreferrer"
                className="min-w-0 flex-1"
                title={`Open ${file.name} in a new tab`}
              >
                <span className="block truncate text-sm font-medium hover:underline">
                  {file.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
              </a>
              {/* Download button actually downloads the file */}
              <a
                href={downloadUrl(file.path, file.name)}
                download={file.name}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                aria-label={`Download ${file.name}`}
                title={`Download ${file.name}`}
              >
                <Download className="h-4 w-4" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
