import type { MetadataRoute } from "next";

import { siteDescription, siteName } from "@/lib/metadata";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#0f0908",
    description: siteDescription,
    display: "standalone",
    icons: [
      {
        sizes: "512x512",
        src: "/icon.png",
        type: "image/png",
      },
      {
        sizes: "192x192",
        src: "/favicon.png",
        type: "image/png",
      },
    ],
    name: siteName,
    short_name: siteName,
    start_url: "/",
    theme_color: "#e05a45",
  };
}
