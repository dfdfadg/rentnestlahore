import type { NextConfig } from "next";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), browsing-topics=()" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
];

const nextConfig: NextConfig = {
  // Clean, consistent URLs: /rent/houses/
  trailingSlash: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    qualities: [60, 75],
    remotePatterns: [{ protocol: "https", hostname: "*.public.blob.vercel-storage.com" }],
  },
  async redirects() {
    return [
      // Canonical host is the apex domain (www and the production *.vercel.app alias redirect to it).
      // Preview deployment URLs (rentnestlahore-git-…vercel.app) are not affected.
      {
        source: "/:path(.*)",
        has: [{ type: "host", value: "(?:www\\.rentnestlahore\\.pk|rentnestlahore\\.vercel\\.app)" }],
        destination: "https://rentnestlahore.pk/:path",
        permanent: true,
      },
      { source: "/commercial", destination: "/rent/commercial-properties/", permanent: true },
      { source: "/houses", destination: "/rent/houses/", permanent: true },
      { source: "/flats", destination: "/rent/flats/", permanent: true },
    ];
  },
  async headers() {
    return [
      { source: "/:path*", headers: securityHeaders },
      {
        source: "/demo/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }],
      },
    ];
  },
};

export default nextConfig;
