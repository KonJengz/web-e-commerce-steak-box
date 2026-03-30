import type { Metadata } from "next";

import { envClient } from "@/config/env.client";

export const siteName = "Steak Box";
export const siteDescription =
  "Premium steaks, chef-picked cuts, and cold-chain delivery from Steak Box.";
export const metadataBase = new URL(envClient.NEXT_PUBLIC_APP_URL);

export const PRIVATE_ROUTE_ROBOTS: NonNullable<Metadata["robots"]> = {
  follow: false,
  googleBot: {
    follow: false,
    index: false,
  },
  index: false,
};

export const BASE_PRIVATE_METADATA: Metadata = {
  robots: PRIVATE_ROUTE_ROBOTS,
};

export const buildAbsoluteSiteUrl = (path: string): string => {
  return new URL(path, metadataBase).toString();
};
