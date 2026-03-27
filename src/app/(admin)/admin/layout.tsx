import type { ReactNode } from "react";
import { Suspense } from "react";

import { AdminShell } from "@/components/admin/admin-shell";
import { AdminShellSkeleton } from "@/components/shared/loading-skeletons";

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
