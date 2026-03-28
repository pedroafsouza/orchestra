import fs from 'fs/promises';
import path from 'path';

const UPLOADS_DIR = process.env.UPLOADS_DIR || path.join(process.cwd(), 'uploads');

export async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function writeFile(storagePath: string, buffer: Buffer): Promise<void> {
  const fullPath = path.join(UPLOADS_DIR, storagePath);
  await ensureDir(path.dirname(fullPath));
  await fs.writeFile(fullPath, buffer);
}

export async function readFile(storagePath: string): Promise<Buffer> {
  return fs.readFile(path.join(UPLOADS_DIR, storagePath));
}

export async function deleteFile(storagePath: string): Promise<void> {
  try {
    await fs.unlink(path.join(UPLOADS_DIR, storagePath));
  } catch {
    // File may not exist, that's OK
  }
}

export function getUploadsDir(): string {
  return UPLOADS_DIR;
}
