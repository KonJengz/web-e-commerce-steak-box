import type { Metadata } from "next";
import type { ReactNode } from "react";

import { PRIVATE_ROUTE_ROBOTS } from "@/lib/metadata";

export const metadata: Metadata = {
  robots: PRIVATE_ROUTE_ROBOTS,
};

export default function AuthLayout({
  children,
}: {
  children: ReactNode;
}) {
  return children;
}
