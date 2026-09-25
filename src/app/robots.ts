import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const isProd = process.env.VERCEL_ENV ? process.env.VERCEL_ENV === "production" : true;
  if (!isProd) {
    // Preview deployments must never be indexed.
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/dashboard/",
          "/favorites/",
          "/my-properties/",
          "/my-enquiries/",
          "/profile/",
          "/login/",
          "/register/",
          "/forgot-password/",
          "/reset-password/",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
