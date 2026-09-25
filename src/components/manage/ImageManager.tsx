"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";
import { deleteImage, reorderImages, updateImageAlt } from "@/app/actions/properties";
import { SmartImage } from "../ui/SmartImage";

type Img = { id: string; url: string; alt: string };

/** Downscale large photos in the browser before upload (keeps requests under serverless body limits). */
async function downscale(file: File): Promise<Blob> {
  if (!file.type.startsWith("image/") || file.size < 1_500_000) return file;
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, 2400 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    return await new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b ?? file), "image/jpeg", 0.88));
  } catch {
    return file;
  }
}

export function ImageManager({ propertyId, initial }: { propertyId: string; initial: Img[] }) {
  const [images, setImages] = useState(initial);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [pending, startTransition] = useTransition();
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setUploading(true);
    setErrors([]);
    const errs: string[] = [];
    // Upload in small batches
    const list = Array.from(files);
    for (let i = 0; i < list.length; i += 3) {
      const fd = new FormData();
      for (const f of list.slice(i, i + 3)) fd.append("files", await downscale(f), f.name.replace(/\.[^.]+$/, ".jpg"));
      try {
        const res = await fetch(`/api/properties/${propertyId}/images/`, { method: "POST", body: fd });
        const data = await res.json().catch(() => ({}));
        if (data.images) setImages((prev) => [...prev, ...data.images.map((im: Img) => ({ id: im.id, url: im.url, alt: im.alt }))]);
        if (data.errors?.length) errs.push(...data.errors);
        if (data.error) errs.push(data.error);
      } catch {
        errs.push("Upload failed — check your connection and try again.");
      }
    }
    setErrors(errs);
    setUploading(false);
    if (inputRef.current) inputRef.current.value = "";
    router.refresh();
  }

  function move(index: number, dir: -1 | 1 | "first") {
    const next = [...images];
    const [item] = next.splice(index, 1);
    const to = dir === "first" ? 0 : index + dir;
    next.splice(Math.max(0, Math.min(next.length, to)), 0, item);
    setImages(next);
    startTransition(async () => {
      const r = await reorderImages(propertyId, next.map((i) => i.id));
      if (!r?.ok) setErrors([r?.message ?? "Could not reorder"]);
      router.refresh();
    });
  }

  function remove(id: string) {
    if (!confirm("Delete this photo?")) return;
    setImages((prev) => prev.filter((i) => i.id !== id));
    startTransition(async () => {
      await deleteImage(id);
      router.refresh();
    });
  }

  return (
    <div>
      <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-ink-200 bg-white px-6 py-10 text-center hover:border-brick-400">
        {uploading ? <Loader2 className="h-8 w-8 animate-spin text-brick-600" /> : <ImagePlus className="h-8 w-8 text-brick-600" />}
        <span className="mt-3 font-semibold text-ink-900">{uploading ? "Uploading…" : "Add photos"}</span>
        <span className="mt-1 text-sm text-ink-500">JPG, PNG or WebP · min 400×300 px · max 8 MB each · up to 20 photos</span>
        <span className="mt-1 text-xs text-ink-400">Only upload photos you own or are authorised to use.</span>
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          multiple
          className="sr-only"
          disabled={uploading}
          onChange={(e) => upload(e.target.files)}
        />
      </label>

      {errors.length > 0 && (
        <ul className="mt-3 space-y-1 rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-200" role="alert">
          {errors.map((e) => <li key={e}>{e}</li>)}
        </ul>
      )}

      {images.length > 0 && (
        <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3" aria-busy={pending}>
          {images.map((img, i) => (
            <li key={img.id} className="card overflow-hidden">
              <div className="relative aspect-[4/3] bg-ink-100">
                <SmartImage src={img.url} alt={img.alt} fill sizes="(min-width: 1024px) 33vw, 50vw" className="object-cover" />
                {i === 0 && <span className="badge absolute left-2 top-2 bg-brick-600 text-white"><Star className="h-3 w-3 fill-current" /> Primary</span>}
              </div>
              <div className="space-y-2 p-3">
                <label className="sr-only" htmlFor={`alt-${img.id}`}>Alt text</label>
                <input
                  id={`alt-${img.id}`}
                  defaultValue={img.alt}
                  maxLength={160}
                  placeholder="Describe this photo (alt text)"
                  className="input min-h-9 py-1.5 text-xs"
                  onBlur={(e) => {
                    const alt = e.target.value;
                    if (alt !== img.alt) startTransition(async () => { await updateImageAlt(img.id, alt); });
                  }}
                />
                <div className="flex flex-wrap gap-1">
                  {i > 0 && <button type="button" onClick={() => move(i, "first")} className="btn-ghost min-h-9 px-2 text-xs"><Star className="h-3.5 w-3.5" /> Set primary</button>}
                  <button type="button" onClick={() => move(i, -1)} disabled={i === 0} className="btn-ghost min-h-9 px-2" aria-label="Move earlier"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" onClick={() => move(i, 1)} disabled={i === images.length - 1} className="btn-ghost min-h-9 px-2" aria-label="Move later"><ArrowDown className="h-4 w-4" /></button>
                  <button type="button" onClick={() => remove(img.id)} className="btn-ghost ml-auto min-h-9 px-2 text-red-600" aria-label="Delete photo"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
