import fs from "fs";
import os from "os";
import path from "path";

let cachedDir: string | null = null;

export function getUploadsDir(): string {
  if (cachedDir) return cachedDir;

  const dir =
    process.env.UPLOADS_DIR ??
    (process.env.VERCEL
      ? path.join(os.tmpdir(), "ods-uploads")
      : path.resolve("uploads"));

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  cachedDir = dir;
  return dir;
}
