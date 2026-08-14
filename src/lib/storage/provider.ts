import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const ALLOWED_MIME_TYPES = new Set([
  "image/png",
  "image/jpeg",
  "image/webp",
  "application/pdf",
  "text/csv",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
]);

const MAX_BYTES = 15 * 1024 * 1024; // 15MB

export class StorageValidationError extends Error {}

export interface StoredFile {
  key: string;
  url: string;
  sizeBytes: number;
  mimeType: string;
}

export interface StorageProvider {
  save(file: { name: string; mimeType: string; buffer: Buffer }, folder: string): Promise<StoredFile>;
}

function assertValid(file: { mimeType: string; buffer: Buffer }) {
  if (!ALLOWED_MIME_TYPES.has(file.mimeType)) {
    throw new StorageValidationError(`Unsupported file type: ${file.mimeType}`);
  }
  if (file.buffer.byteLength === 0) {
    throw new StorageValidationError("Empty file");
  }
  if (file.buffer.byteLength > MAX_BYTES) {
    throw new StorageValidationError("File exceeds the 15MB upload limit");
  }
}

/** Local-disk implementation for dev. Swap for an S3-compatible provider in production. */
export class LocalStorageProvider implements StorageProvider {
  private readonly root: string;

  constructor(root = process.env.STORAGE_LOCAL_DIR ?? "./uploads") {
    this.root = root;
  }

  async save(file: { name: string; mimeType: string; buffer: Buffer }, folder: string): Promise<StoredFile> {
    assertValid(file);

    const ext = path.extname(file.name).toLowerCase();
    const key = `${folder}/${randomUUID()}${ext}`;
    const destPath = path.join(this.root, key);
    await mkdir(path.dirname(destPath), { recursive: true });
    await writeFile(destPath, file.buffer);

    return {
      key,
      url: `/uploads/${key}`,
      sizeBytes: file.buffer.byteLength,
      mimeType: file.mimeType,
    };
  }
}

let provider: StorageProvider | null = null;

export function getStorageProvider(): StorageProvider {
  if (!provider) {
    provider = new LocalStorageProvider();
  }
  return provider;
}
