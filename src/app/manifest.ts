import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "RentNest Lahore",
    short_name: "RentNest",
    description: "Houses, flats, offices, shops & more for rent in Lahore.",
    start_url: "/",
    display: "standalone",
    background_color: "#fcfbf8",
    theme_color: "#0f1d31",
    icons: [
      { src: "/logo.png", sizes: "512x512", type: "image/png" },
      { src: "/icon.svg", sizes: "any", type: "image/svg+xml" },
    ],
  };
}
