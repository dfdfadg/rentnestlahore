/** Shared shape for landing-page editorial content. */
export type LandingSection = { h: string; p?: string[]; ul?: string[] };
export type LandingFaq = { q: string; a: string };
export type LandingContent = {
  /** Overrides the <title> of page 1 (unfiltered) */
  seoTitle?: string;
  /** Overrides the meta description of page 1 (unfiltered) */
  metaDescription?: string;
  sections: LandingSection[];
  faqs: LandingFaq[];
};
