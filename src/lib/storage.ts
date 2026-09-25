import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

export const MAX_UPLOAD_BYTES = 8 * 1024 * 1024;
export const MAX_IMAGES_PER_PROPERTY = 20;
const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "avif", "heif"]);
export const LOCAL_UPLOAD_DIR = path.join(process.cwd(), ".uploads");

/**
 * Validates an uploaded image by decoding it (not by trusting the file extension or MIME type),
 * strips all metadata (EXIF/GPS), auto-rotates, resizes to max 1920px and re-encodes to WebP.
 * next/image then serves responsive sizes (AVIF/WebP) from this master.
 */
export async function processImage(input: Buffer): Promise<{ data: Buffer; width: number; height: number }> {
  if (input.byteLength > MAX_UPLOAD_BYTES) throw new Error("Image is larger than 8 MB");
  let meta: Awaited<ReturnType<ReturnType<typeof sharp>["metadata"]>>;
  try {
    meta = await sharp(input, { limitInputPixels: 50_000_000 }).metadata();
  } catch {
    throw new Error("File is not a valid image");
  }
  if (!meta.format || !ALLOWED_FORMATS.has(meta.format)) throw new Error("Only JPG, PNG, WebP or AVIF images are allowed");
  if ((meta.width ?? 0) < 400 || (meta.height ?? 0) < 300) throw new Error("Image is too small (minimum 400×300 pixels)");
  const { data, info } = await sharp(input, { limitInputPixels: 50_000_000 })
    .rotate()
    .resize({ width: 1920, height: 1920, fit: "inside", withoutEnlargement: true })
    .webp({ quality: 80 })
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

function blobEnabled() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

export async function storeImage(data: Buffer, propertyId: string): Promise<string> {
  const name = `${propertyId}/${randomUUID()}.webp`;
  if (blobEnabled()) {
    const { put } = await import("@vercel/blob");
    const blob = await put(`properties/${name}`, data, { access: "public", contentType: "image/webp", addRandomSuffix: false });
    return blob.url;
  }
  if (process.env.VERCEL) {
    throw new Error("Image storage is not configured. Set BLOB_READ_WRITE_TOKEN in the Vercel project settings.");
  }
  const file = path.join(LOCAL_UPLOAD_DIR, name);
  await mkdir(path.dirname(file), { recursive: true });
  await writeFile(file, data);
  return `/media/${name}`;
}

export async function deleteStoredImage(url: string): Promise<void> {
  try {
    if (url.startsWith("/media/")) {
      const rel = url.slice("/media/".length);
      const file = path.join(LOCAL_UPLOAD_DIR, rel);
      if (file.startsWith(LOCAL_UPLOAD_DIR + path.sep)) await unlink(file);
    } else if (blobEnabled() && /\.public\.blob\.vercel-storage\.com\//.test(url)) {
      const { del } = await import("@vercel/blob");
      await del(url);
    }
    // Demo images (/demo/...) and external imported URLs are never deleted from disk.
  } catch (e) {
    console.warn("[storage] could not delete", url, (e as Error).message);
  }
}
