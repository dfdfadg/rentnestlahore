import { readFile } from "node:fs/promises";
import path from "node:path";
import { LOCAL_UPLOAD_DIR } from "@/lib/storage";

/** Serves locally stored uploads (development / self-hosted). Production on Vercel uses Blob URLs. */
export async function GET(_req: Request, ctx: { params: Promise<{ path: string[] }> }) {
  const { path: parts } = await ctx.params;
  if (!parts.every((p) => /^[a-zA-Z0-9_-]+(\.webp)?$/.test(p))) return new Response("Not found", { status: 404 });
  const file = path.join(LOCAL_UPLOAD_DIR, ...parts);
  if (!file.startsWith(LOCAL_UPLOAD_DIR + path.sep)) return new Response("Not found", { status: 404 });
  try {
    const data = await readFile(file);
    return new Response(new Uint8Array(data), {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable", "X-Content-Type-Options": "nosniff" },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}
