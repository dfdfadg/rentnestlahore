import { AREA_CONTENT, COMBO_CONTENT } from "./landing-areas";
import { TYPE_CONTENT } from "./landing-types";
import type { LandingContent } from "./landing-types-def";

/** Editorial content for a listing page: area+type, area-only, or type-only. */
export function landingContent(typeSlug?: string | null, areaSlug?: string | null): LandingContent | null {
  if (typeSlug && areaSlug) return COMBO_CONTENT[`${areaSlug}/${typeSlug}`] ?? null;
  if (areaSlug) return AREA_CONTENT[areaSlug] ?? null;
  if (typeSlug) return TYPE_CONTENT[typeSlug] ?? null;
  return null;
}

export type { LandingContent };
