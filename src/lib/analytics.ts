/**
 * Lightweight analytics event helper. Pushes to GTM's dataLayer and/or GA4 gtag when present.
 * Never send personal data (names, phone numbers, emails) as event parameters.
 */
type Params = Record<string, string | number | boolean | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

export type AnalyticsEvent =
  | "rental_search"
  | "filter_apply"
  | "property_view"
  | "favorite_toggle"
  | "whatsapp_click"
  | "phone_click"
  | "enquiry_submit"
  | "property_submit"
  | "share_click";

export function track(event: AnalyticsEvent, params: Params = {}) {
  if (typeof window === "undefined") return;
  try {
    if (window.gtag) window.gtag("event", event, params);
    else if (window.dataLayer) window.dataLayer.push({ event, ...params });
  } catch {
    /* analytics must never break the UI */
  }
}
