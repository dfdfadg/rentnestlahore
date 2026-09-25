import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { canEditProperty } from "@/lib/permissions";
import { rateLimit } from "@/lib/rate-limit";
import { MAX_IMAGES_PER_PROPERTY, processImage, storeImage } from "@/lib/storage";

export const runtime = "nodejs";

/** Upload one or more images (multipart field "files") to a property the user may edit. */
export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required" }, { status: 401 });
  const property = await canEditProperty(user, id);
  if (!property) return NextResponse.json({ error: "Not allowed" }, { status: 403 });
  if (!(await rateLimit("upload", 60, 10 * 60_000, user.id))) return NextResponse.json({ error: "Too many uploads, please wait." }, { status: 429 });

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload" }, { status: 400 });
  }
  const files = form.getAll("files").filter((f): f is File => f instanceof File && f.size > 0);
  if (!files.length) return NextResponse.json({ error: "No files received" }, { status: 400 });

  const existing = await prisma.propertyImage.count({ where: { propertyId: id } });
  if (existing + files.length > MAX_IMAGES_PER_PROPERTY) {
    return NextResponse.json({ error: `A listing can have at most ${MAX_IMAGES_PER_PROPERTY} photos.` }, { status: 400 });
  }
  const title = (await prisma.property.findUnique({ where: { id }, select: { title: true } }))?.title ?? "Rental property";

  const created = [];
  const errors: string[] = [];
  let position = existing;
  for (const file of files) {
    try {
      const { data, width, height } = await processImage(Buffer.from(await file.arrayBuffer()));
      const url = await storeImage(data, id);
      created.push(
        await prisma.propertyImage.create({
          data: { propertyId: id, url, width, height, position: position++, alt: `${title} — photo ${position}` },
        }),
      );
    } catch (e) {
      errors.push(`${file.name}: ${(e as Error).message}`);
    }
  }
  if (property.status === "PUBLISHED") revalidatePath(`/property/${property.slug}/`);
  return NextResponse.json({ images: created, errors }, { status: created.length ? 200 : 400 });
}
