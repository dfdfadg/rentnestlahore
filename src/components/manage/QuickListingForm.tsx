"use client";

import { useState } from "react";
import { CheckCircle2, ImagePlus, Loader2, X } from "lucide-react";
import { track } from "@/lib/analytics";
import { WhatsAppListButton } from "../WhatsAppListButton";

type Opt = { id: string; name: string };
type Props = {
  types: (Opt & { category: "RESIDENTIAL" | "COMMERCIAL" })[];
  locations: (Opt & { depth: number })[];
  whatsapp: string;
};

const MAX_PHOTOS = 8;

async function shrink(file: File): Promise<Blob> {
  try {
    const bmp = await createImageBitmap(file);
    const scale = Math.min(1, 1600 / Math.max(bmp.width, bmp.height));
    const c = document.createElement("canvas");
    c.width = Math.round(bmp.width * scale);
    c.height = Math.round(bmp.height * scale);
    c.getContext("2d")!.drawImage(bmp, 0, 0, c.width, c.height);
    return await new Promise<Blob>((r) => c.toBlob((b) => r(b ?? file), "image/jpeg", 0.82));
  } catch {
    return file;
  }
}

/** Account-free listing form: details + photos in one step, reviewed by the team before going live. */
export function QuickListingForm({ types, locations, whatsapp }: Props) {
  const [photos, setPhotos] = useState<File[]>([]);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [done, setDone] = useState<{ refNo: number; photos: number } | null>(null);
  const [typeId, setTypeId] = useState("");
  const commercial = types.find((t) => t.id === typeId)?.category === "COMMERCIAL";

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setErrors({});
    setMessage(null);
    const fd = new FormData(e.currentTarget);
    fd.delete("photos");
    for (const p of photos) fd.append("photos", await shrink(p), p.name.replace(/\.[^.]+$/, ".jpg"));
    try {
      const res = await fetch("/api/quick-listing/", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data.ok) {
        track("property_submit", { source: "quick_form" });
        setDone({ refNo: data.refNo, photos: data.photos ?? 0 });
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        setErrors(data.errors ?? {});
        setMessage(data.error ?? "Something went wrong. Please try again.");
      }
    } catch {
      setMessage("Could not send — please check your internet connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <div className="card p-8 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" />
        <h2 className="mt-4 text-2xl font-bold">Shukriya! Your property has been received.</h2>
        <p className="mt-2 text-ink-600">
          Reference <strong>RN-{done.refNo}</strong>{done.photos ? ` · ${done.photos} photo${done.photos > 1 ? "s" : ""}` : ""}. Our team will review it and may call you to confirm details.
          It will appear on RentNest Lahore once approved.
        </p>
        {whatsapp && (
          <div className="mt-6 flex justify-center">
            <WhatsAppListButton number={whatsapp} label="Send more photos on WhatsApp" message={`Hello, I submitted property RN-${done.refNo} on RentNest Lahore. Sending more photos/details.`} />
          </div>
        )}
      </div>
    );
  }

  const err = (k: string) => (errors[k] ? <p className="mt-1 text-sm text-red-600" role="alert">{errors[k]}</p> : null);

  return (
    <form onSubmit={onSubmit} className="card space-y-5 p-5 sm:p-7" noValidate>
      <div className="hidden" aria-hidden="true"><label>Company<input name="company" tabIndex={-1} autoComplete="off" /></label></div>
      {message && <div role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-200">{message}</div>}

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label" htmlFor="q-type">Property type *</label>
          <select id="q-type" name="propertyTypeId" required className="input" value={typeId} onChange={(e) => setTypeId(e.target.value)}>
            <option value="">Select</option>
            <optgroup label="Residential">{types.filter((t) => t.category === "RESIDENTIAL").map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</optgroup>
            <optgroup label="Commercial">{types.filter((t) => t.category === "COMMERCIAL").map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</optgroup>
          </select>
          {err("propertyTypeId")}
        </div>
        <div>
          <label className="label" htmlFor="q-loc">Area *</label>
          <select id="q-loc" name="locationId" required className="input" defaultValue="">
            <option value="">Select area</option>
            {locations.map((l) => <option key={l.id} value={l.id}>{l.depth ? `   ${l.name}` : l.name}</option>)}
          </select>
          {err("locationId")}
        </div>
        <div>
          <label className="label" htmlFor="q-soc">Block / sector</label>
          <input id="q-soc" name="society" className="input" placeholder="e.g. Block E" maxLength={120} />
        </div>
        <div>
          <label className="label" htmlFor="q-price">Monthly rent (PKR) *</label>
          <input id="q-price" name="price" type="number" inputMode="numeric" min={1000} step={500} required className="input" placeholder="e.g. 85000" />
          {err("price")}
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="label" htmlFor="q-area">Size *</label>
            <input id="q-area" name="area" type="number" inputMode="decimal" step="any" min={0} required className="input" />
          </div>
          <div>
            <label className="label" htmlFor="q-unit">Unit</label>
            <select id="q-unit" name="areaUnit" className="input" defaultValue="MARLA">
              <option value="MARLA">Marla</option>
              <option value="KANAL">Kanal</option>
              <option value="SQFT">Sq Ft</option>
              <option value="SQYD">Sq Yd</option>
            </select>
          </div>
          <div className="col-span-2">{err("area")}</div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {!commercial && (
            <div>
              <label className="label" htmlFor="q-beds">Bedrooms</label>
              <input id="q-beds" name="bedrooms" type="number" inputMode="numeric" min={0} max={30} className="input" />
            </div>
          )}
          <div>
            <label className="label" htmlFor="q-baths">Bathrooms</label>
            <input id="q-baths" name="bathrooms" type="number" inputMode="numeric" min={0} max={30} className="input" />
          </div>
        </div>
      </div>

      <div>
        <label className="label" htmlFor="q-desc">Details <span className="normal-case text-ink-400">(optional — furnishing, parking, separate meters, nearby places)</span></label>
        <textarea id="q-desc" name="description" rows={4} maxLength={3000} className="input" />
        {err("description")}
      </div>

      <div>
        <span className="label">Photos <span className="normal-case text-ink-400">(up to {MAX_PHOTOS} — optional but listings with photos get far more calls)</span></span>
        <div className="flex flex-wrap gap-2">
          {photos.map((p, i) => (
            <div key={p.name + i} className="relative h-20 w-24 overflow-hidden rounded-lg bg-ink-100">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={URL.createObjectURL(p)} alt="" className="h-full w-full object-cover" />
              <button type="button" aria-label="Remove photo" onClick={() => setPhotos((ps) => ps.filter((_, j) => j !== i))} className="absolute right-1 top-1 grid h-6 w-6 place-items-center rounded-full bg-white/90 shadow">
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label className="grid h-20 w-24 cursor-pointer place-items-center rounded-lg border-2 border-dashed border-ink-200 text-ink-500 hover:border-brick-400">
              <ImagePlus className="h-6 w-6" />
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                className="sr-only"
                onChange={(e) => {
                  const list = Array.from(e.target.files ?? []);
                  setPhotos((ps) => [...ps, ...list].slice(0, MAX_PHOTOS));
                  e.target.value = "";
                }}
              />
            </label>
          )}
        </div>
        <p className="mt-1 text-xs text-ink-400">Only upload photos you took yourself or have permission to use.</p>
      </div>

      <div className="grid gap-4 border-t border-ink-100 pt-5 sm:grid-cols-3">
        <div>
          <label className="label" htmlFor="q-name">Your name *</label>
          <input id="q-name" name="name" required autoComplete="name" className="input" maxLength={80} />
          {err("name")}
        </div>
        <div>
          <label className="label" htmlFor="q-phone">Mobile number *</label>
          <input id="q-phone" name="phone" type="tel" inputMode="tel" required autoComplete="tel" className="input" placeholder="03XX XXXXXXX" />
          {err("phone")}
        </div>
        <div>
          <label className="label" htmlFor="q-wa">WhatsApp <span className="normal-case text-ink-400">(if different)</span></label>
          <input id="q-wa" name="whatsapp" type="tel" inputMode="tel" className="input" />
          {err("whatsapp")}
        </div>
      </div>

      <label className="flex items-start gap-2 text-sm text-ink-700">
        <input type="checkbox" name="consent" className="mt-1 h-4 w-4 accent-brick-600" />
        <span>I am the owner of this property or authorised to rent it out, and I agree that my number is shown to renters once the listing is approved.</span>
      </label>
      {err("consent")}

      <button type="submit" disabled={busy} className="btn-primary w-full sm:w-auto sm:px-10">
        {busy ? <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</> : "Submit property for free"}
      </button>
      <p className="text-xs text-ink-500">Rental properties in Lahore only. Every listing is checked by our team before it goes live.</p>
    </form>
  );
}
