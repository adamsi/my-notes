import "server-only";
import { S3Client, PutObjectCommand, DeleteObjectsCommand } from "@aws-sdk/client-s3";

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_BUCKET ?? "my-notes";

const s3 = new S3Client({
  forcePathStyle: true,
  region: process.env.SUPABASE_S3_REGION!,
  endpoint: process.env.SUPABASE_S3_ENDPOINT!,
  credentials: {
    accessKeyId: process.env.SUPABASE_S3_ACCESS_KEY_ID!,
    secretAccessKey: process.env.SUPABASE_S3_SECRET_ACCESS_KEY!,
  },
});

function sanitize(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 120);
}

/** Upload one file's bytes to S3 and return its storage key (path). */
export async function putObject(
  userId: string,
  file: { name: string; type: string; bytes: Uint8Array }
): Promise<string> {
  const key = `${userId}/${crypto.randomUUID()}-${sanitize(file.name)}`;
  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: file.bytes,
      ContentType: file.type || "application/octet-stream",
    })
  );
  return key;
}

/** Delete objects from S3 by key. Ignores empty input. */
export async function deleteObjects(keys: string[]): Promise<void> {
  if (!keys.length) return;
  await s3.send(
    new DeleteObjectsCommand({
      Bucket: BUCKET,
      Delete: { Objects: keys.map((Key) => ({ Key })) },
    })
  );
}
