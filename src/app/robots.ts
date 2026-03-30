import type { MetadataRoute } from "next";

import { buildAbsoluteSiteUrl, metadataBase } from "@/lib/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    host: metadataBase.origin,
    rules: [
      {
        allow: "/",
        disallow: [
          "/admin",
          "/api/",
          "/addresses",
          "/cart",
          "/checkout",
          "/forgot-password",
          "/login",
          "/orders",
          "/profile",
          "/register",
          "/reset-password",
          "/security",
          "/verify-email",
        ],
        userAgent: "*",
      },
    ],
    sitemap: buildAbsoluteSiteUrl("/sitemap.xml"),
  };
}
