export const SITE_NAME = "RentNest Lahore";
export const SITE_TAGLINE = "Find Your Place in Lahore";
export const SITE_DESCRIPTION =
  "Houses, flats, offices, shops and more for rent in Lahore. Search rental properties across DHA, Gulberg, Johar Town, Bahria Town and every major Lahore area.";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL || "https://rentnestlahore.pk").replace(/\/+$/, "");

export const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL || "hello@rentnestlahore.pk";
export const CONTACT_PHONE = process.env.NEXT_PUBLIC_CONTACT_PHONE || "";
/** Site owner's WhatsApp (international format, e.g. 923001234567). Enables "list via WhatsApp" buttons. */
export const CONTACT_WHATSAPP = (process.env.NEXT_PUBLIC_CONTACT_WHATSAPP || "923134551880").replace(/[^\d]/g, "");

/** Absolute URL for a site path. Paths always end with a trailing slash (except files). */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  const p = path.startsWith("/") ? path : `/${path}`;
  return `${SITE_URL}${p}`;
}

export const PAGE_SIZE = 20;
