import { Download, ExternalLink, FileText } from "lucide-react";
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
            <div
              key={file.id}
              className="group relative overflow-hidden rounded-lg border bg-muted"
            >
              {/* Click the image to open it in a new tab */}
              <a
                href={publicUrl(file.path)}
                target="_blank"
                rel="noopener noreferrer"
                title={`Open ${file.name} in a new tab`}
                className="block"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={publicUrl(file.path)}
                  alt={file.name}
                  loading="lazy"
                  className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                />
              </a>
              {/* Download button overlay */}
              <a
                href={downloadUrl(file.path, file.name)}
                download={file.name}
                aria-label={`Download ${file.name}`}
                title={`Download ${file.name}`}
                className="absolute right-1.5 top-1.5 grid h-8 w-8 place-items-center rounded-md bg-background/80 text-foreground opacity-0 backdrop-blur transition-opacity hover:bg-background focus-visible:opacity-100 group-hover:opacity-100"
              >
                <Download className="h-4 w-4" />
              </a>
            </div>
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
              {/* Click the name to download the file */}
              <a
                href={downloadUrl(file.path, file.name)}
                download={file.name}
                className="min-w-0 flex-1"
                title={`Download ${file.name}`}
              >
                <span className="block truncate text-sm font-medium hover:underline">
                  {file.name}
                </span>
                <span className="block text-xs text-muted-foreground">
                  {formatFileSize(file.size)}
                </span>
              </a>
              {/* Arrow button opens the file in a new tab */}
              <a
                href={publicUrl(file.path)}
                target="_blank"
                rel="noopener noreferrer"
                className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
                aria-label={`Open ${file.name} in a new tab`}
                title={`Open ${file.name} in a new tab`}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
