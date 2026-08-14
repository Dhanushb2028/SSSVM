import { readFile, stat } from "node:fs/promises";
import path from "node:path";

// Serves locally-stored uploads (Section 3: StorageProvider is swappable — in
// production, StoredFile.url would point at S3-compatible storage directly and
// this route would not exist).
const MIME_BY_EXT: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".csv": "text/csv",
};

export async function GET(_request: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const { path: segments } = await params;
  const root = path.resolve(/* turbopackIgnore: true */ process.env.STORAGE_LOCAL_DIR ?? "./uploads");
  const filePath = path.resolve(root, ...segments);

  if (!filePath.startsWith(root)) {
    return new Response("Not found", { status: 404 });
  }

  try {
    await stat(filePath);
    const buffer = await readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    return new Response(new Uint8Array(buffer), {
      headers: { "Content-Type": MIME_BY_EXT[ext] ?? "application/octet-stream" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
