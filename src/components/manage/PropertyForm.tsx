"use client";

import { useActionState, useState } from "react";
import { saveProperty } from "@/app/actions/properties";
import { FieldError, FormMessage } from "../ui/FormBits";
import { track } from "@/lib/analytics";

export type PropertyFormValues = {
  id?: string;
  title?: string;
  propertyTypeId?: string;
  price?: number;
  priceFrequency?: string;
  securityDeposit?: number | null;
  advanceMonths?: number | null;
  area?: number;
  areaUnit?: string;
  bedrooms?: number | null;
  bathrooms?: number | null;
  locationId?: string;
  society?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description?: string;
  features?: string[];
  furnished?: string | null;
  condition?: string | null;
  floor?: number | null;
  mainRoad?: boolean;
  corner?: boolean;
  frontFt?: number | null;
  loadingArea?: boolean;
  ceilingHeightFt?: number | null;
  videoUrl?: string | null;
  amenityIds?: string[];
  agentId?: string;
  status?: string;
  featured?: boolean;
  verified?: boolean;
  expiresAt?: string | null;
  rejectionReason?: string | null;
  contactPhone?: string;
  contactWhatsapp?: string;
};

type Props = {
  mode: "admin" | "user";
  values: PropertyFormValues;
  types: { id: string; name: string; category: "RESIDENTIAL" | "COMMERCIAL" }[];
  locations: { id: string; name: string; depth: number }[];
  amenities: { id: string; name: string }[];
  agents?: { id: string; name: string }[];
};

export function PropertyForm({ mode, values: v, types, locations, amenities, agents = [] }: Props) {
  const [state, action, pending] = useActionState(saveProperty, undefined);
  const [typeId, setTypeId] = useState(v.propertyTypeId ?? "");
  const category = types.find((t) => t.id === typeId)?.category;
  const commercial = category === "COMMERCIAL";
  const err = (n: string) => <FieldError state={state} name={n} />;

  return (
    <form
      action={action}
      onSubmit={() => {
        if (!v.id && mode === "user") track("property_submit", { step: "details" });
      }}
      className="space-y-8"
      noValidate
    >
      {v.id && <input type="hidden" name="id" value={v.id} />}
      <FormMessage state={state} />

      <Fieldset title="Basics" hint="Every listing on RentNest Lahore is for rent. Sale listings are not accepted.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pf-type" className="label">Property type *</label>
            <select id="pf-type" name="propertyTypeId" className="input" required value={typeId} onChange={(e) => setTypeId(e.target.value)}>
              <option value="">Select type</option>
              <optgroup label="Residential">
                {types.filter((t) => t.category === "RESIDENTIAL").map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </optgroup>
              <optgroup label="Commercial">
                {types.filter((t) => t.category === "COMMERCIAL").map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </optgroup>
            </select>
            {err("propertyTypeId")}
          </div>
          <div>
            <span className="label">Purpose</span>
            <p className="input flex items-center bg-ink-50 font-semibold text-ink-700">For Rent</p>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="pf-title" className="label">Title <span className="normal-case text-ink-400">(optional — we&apos;ll generate one like &quot;5 Marla House for Rent in Johar Town&quot;)</span></label>
            <input id="pf-title" name="title" defaultValue={v.title} maxLength={120} className="input" />
            {err("title")}
          </div>
        </div>
      </Fieldset>

      <Fieldset title="Rent">
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="sm:col-span-2">
            <label htmlFor="pf-price" className="label">Rent amount (PKR) *</label>
            <input id="pf-price" name="price" type="number" min={1000} step={500} inputMode="numeric" required defaultValue={v.price} className="input" />
            {err("price")}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="pf-freq" className="label">Rent is per</label>
            <select id="pf-freq" name="priceFrequency" defaultValue={v.priceFrequency ?? "MONTHLY"} className="input">
              <option value="MONTHLY">Month</option>
              <option value="QUARTERLY">Quarter</option>
              <option value="YEARLY">Year</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="pf-dep" className="label">Security deposit (PKR)</label>
            <input id="pf-dep" name="securityDeposit" type="number" min={0} inputMode="numeric" defaultValue={v.securityDeposit ?? ""} className="input" />
            {err("securityDeposit")}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="pf-adv" className="label">Advance rent (months)</label>
            <input id="pf-adv" name="advanceMonths" type="number" min={0} max={24} inputMode="numeric" defaultValue={v.advanceMonths ?? ""} className="input" />
            {err("advanceMonths")}
          </div>
        </div>
      </Fieldset>

      <Fieldset title="Size & layout">
        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label htmlFor="pf-area" className="label">Area *</label>
            <input id="pf-area" name="area" type="number" min={0} step="any" inputMode="decimal" required defaultValue={v.area} className="input" />
            {err("area")}
          </div>
          <div>
            <label htmlFor="pf-unit" className="label">Unit</label>
            <select id="pf-unit" name="areaUnit" defaultValue={v.areaUnit ?? "MARLA"} className="input">
              <option value="MARLA">Marla</option>
              <option value="KANAL">Kanal</option>
              <option value="SQFT">Sq Ft</option>
              <option value="SQYD">Sq Yd</option>
            </select>
          </div>
          {!commercial && (
            <div>
              <label htmlFor="pf-beds" className="label">Bedrooms</label>
              <input id="pf-beds" name="bedrooms" type="number" min={0} max={30} inputMode="numeric" defaultValue={v.bedrooms ?? ""} className="input" />
              {err("bedrooms")}
            </div>
          )}
          <div>
            <label htmlFor="pf-baths" className="label">Bathrooms</label>
            <input id="pf-baths" name="bathrooms" type="number" min={0} max={30} inputMode="numeric" defaultValue={v.bathrooms ?? ""} className="input" />
            {err("bathrooms")}
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="pf-furn" className="label">Furnishing</label>
            <select id="pf-furn" name="furnished" defaultValue={v.furnished ?? ""} className="input">
              <option value="">Not specified</option>
              <option value="FURNISHED">Furnished</option>
              <option value="SEMI_FURNISHED">Semi Furnished</option>
              <option value="UNFURNISHED">Unfurnished</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="pf-cond" className="label">Condition</label>
            <select id="pf-cond" name="condition" defaultValue={v.condition ?? ""} className="input">
              <option value="">Not specified</option>
              <option value="BRAND_NEW">Brand New</option>
              <option value="RENOVATED">Renovated</option>
              <option value="USED">Used</option>
            </select>
          </div>
          <div>
            <label htmlFor="pf-floor" className="label">Floor</label>
            <input id="pf-floor" name="floor" type="number" min={-2} max={150} inputMode="numeric" defaultValue={v.floor ?? ""} className="input" placeholder="0 = ground" />
            {err("floor")}
          </div>
        </div>
      </Fieldset>

      {commercial && (
        <Fieldset title="Commercial details">
          <div className="grid gap-4 sm:grid-cols-3">
            <div>
              <label htmlFor="pf-front" className="label">Front (ft)</label>
              <input id="pf-front" name="frontFt" type="number" min={0} step="any" defaultValue={v.frontFt ?? ""} className="input" />
            </div>
            <div>
              <label htmlFor="pf-height" className="label">Ceiling height (ft)</label>
              <input id="pf-height" name="ceilingHeightFt" type="number" min={0} step="any" defaultValue={v.ceilingHeightFt ?? ""} className="input" />
            </div>
            <div className="flex flex-col justify-end gap-2 text-sm">
              <label className="flex items-center gap-2"><input type="checkbox" name="mainRoad" defaultChecked={v.mainRoad} className="h-4 w-4 accent-brick-600" /> On main road</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="corner" defaultChecked={v.corner} className="h-4 w-4 accent-brick-600" /> Corner</label>
              <label className="flex items-center gap-2"><input type="checkbox" name="loadingArea" defaultChecked={v.loadingArea} className="h-4 w-4 accent-brick-600" /> Loading area</label>
            </div>
          </div>
        </Fieldset>
      )}

      <Fieldset title="Location" hint="Only the area and block are shown publicly. Maps show an approximate area, never an exact pin.">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="pf-loc" className="label">Area *</label>
            <select id="pf-loc" name="locationId" defaultValue={v.locationId ?? ""} required className="input">
              <option value="">Select area</option>
              {locations.map((l) => <option key={l.id} value={l.id}>{l.depth ? `   ${l.name}` : l.name}</option>)}
            </select>
            {err("locationId")}
          </div>
          <div>
            <label htmlFor="pf-soc" className="label">Block / sector / street</label>
            <input id="pf-soc" name="society" defaultValue={v.society ?? ""} maxLength={120} className="input" placeholder="e.g. Block E" />
          </div>
          <div className="sm:col-span-2">
            <label htmlFor="pf-addr" className="label">Full address <span className="normal-case text-ink-400">(private — for our records only)</span></label>
            <input id="pf-addr" name="address" defaultValue={v.address ?? ""} maxLength={200} className="input" />
          </div>
          <div>
            <label htmlFor="pf-lat" className="label">Latitude (optional)</label>
            <input id="pf-lat" name="latitude" type="number" step="any" defaultValue={v.latitude ?? ""} className="input" placeholder="31.4700" />
            {err("latitude")}
          </div>
          <div>
            <label htmlFor="pf-lng" className="label">Longitude (optional)</label>
            <input id="pf-lng" name="longitude" type="number" step="any" defaultValue={v.longitude ?? ""} className="input" placeholder="74.4100" />
            {err("longitude")}
          </div>
        </div>
      </Fieldset>

      <Fieldset title="Description & amenities">
        <div className="space-y-4">
          <div>
            <label htmlFor="pf-desc" className="label">Description *</label>
            <textarea id="pf-desc" name="description" rows={7} required minLength={40} maxLength={8000} defaultValue={v.description} className="input" placeholder="Describe the property, its condition, nearby facilities and rental terms." />
            {err("description")}
          </div>
          <div>
            <label htmlFor="pf-feat" className="label">Features <span className="normal-case text-ink-400">(one per line)</span></label>
            <textarea id="pf-feat" name="features" rows={4} defaultValue={(v.features ?? []).join("\n")} className="input" placeholder={"Separate meters\nNear park"} />
          </div>
          <fieldset>
            <legend className="label">Amenities</legend>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {amenities.map((a) => (
                <label key={a.id} className="flex items-center gap-2 text-sm">
                  <input type="checkbox" name="amenityIds" value={a.id} defaultChecked={v.amenityIds?.includes(a.id)} className="h-4 w-4 accent-brick-600" /> {a.name}
                </label>
              ))}
            </div>
          </fieldset>
          <div>
            <label htmlFor="pf-video" className="label">Video tour URL (YouTube or Vimeo)</label>
            <input id="pf-video" name="videoUrl" type="url" defaultValue={v.videoUrl ?? ""} className="input" />
            {err("videoUrl")}
          </div>
        </div>
      </Fieldset>

      {mode === "user" && (
        <Fieldset title="Contact details" hint="Shown to renters when they tap Call or WhatsApp on your listing.">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-cp" className="label">Phone *</label>
              <input id="pf-cp" name="contactPhone" type="tel" required defaultValue={v.contactPhone} className="input" placeholder="03XX XXXXXXX" />
              {err("contactPhone")}
            </div>
            <div>
              <label htmlFor="pf-cw" className="label">WhatsApp (if different)</label>
              <input id="pf-cw" name="contactWhatsapp" type="tel" defaultValue={v.contactWhatsapp} className="input" />
              {err("contactWhatsapp")}
            </div>
          </div>
        </Fieldset>
      )}

      {mode === "admin" && (
        <Fieldset title="Admin controls">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pf-agent" className="label">Agent / landlord *</label>
              <select id="pf-agent" name="agentId" defaultValue={v.agentId ?? ""} className="input">
                <option value="">Select agent</option>
                {agents.map((a) => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>
              {err("agentId")}
            </div>
            <div>
              <label htmlFor="pf-status" className="label">Status</label>
              <select id="pf-status" name="status" defaultValue={v.status ?? "DRAFT"} className="input">
                <option value="DRAFT">Draft</option>
                <option value="PENDING_REVIEW">Pending Review</option>
                <option value="PUBLISHED">Published</option>
                <option value="EXPIRED">Expired</option>
                <option value="RENTED">Rented</option>
                <option value="REJECTED">Rejected</option>
              </select>
            </div>
            <div>
              <label htmlFor="pf-exp" className="label">Expires on</label>
              <input id="pf-exp" name="expiresAt" type="date" defaultValue={v.expiresAt ?? ""} className="input" />
            </div>
            <div>
              <label htmlFor="pf-rej" className="label">Rejection reason</label>
              <input id="pf-rej" name="rejectionReason" defaultValue={v.rejectionReason ?? ""} maxLength={300} className="input" />
            </div>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={v.featured} className="h-4 w-4 accent-brick-600" /> Featured</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="verified" defaultChecked={v.verified} className="h-4 w-4 accent-brick-600" /> Verified property</label>
          </div>
        </Fieldset>
      )}

      <div className="flex flex-wrap items-center gap-3">
        <button type="submit" disabled={pending} className="btn-primary min-w-40">
          {pending ? "Saving…" : v.id ? "Save changes" : "Save & add photos"}
        </button>
        {state?.message && !state.ok && <p className="text-sm text-red-600">{state.message}</p>}
        {state?.ok && <p className="text-sm text-emerald-700">{state.message}</p>}
      </div>
    </form>
  );
}

function Fieldset({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="card p-5 sm:p-6">
      <legend className="sr-only">{title}</legend>
      <h2 className="text-lg font-bold">{title}</h2>
      {hint && <p className="mb-4 mt-1 text-sm text-ink-500">{hint}</p>}
      <div className={hint ? "" : "mt-4"}>{children}</div>
    </fieldset>
  );
}
