import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminShellSkeleton } from "@/components/shared/loading-skeletons";
import { PRIVATE_ROUTE_ROBOTS } from "@/lib/metadata";

export const metadata: Metadata = {
  robots: PRIVATE_ROUTE_ROBOTS,
};

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <Suspense fallback={<AdminShellSkeleton />}>
      <AdminShell>{children}</AdminShell>
    </Suspense>
  );
}
