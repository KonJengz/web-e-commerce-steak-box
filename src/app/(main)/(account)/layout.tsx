import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Suspense } from "react";

import { AccountShell } from "@/components/account/account-shell";
import { AccountShellSkeleton } from "@/components/shared/loading-skeletons";
import { PRIVATE_ROUTE_ROBOTS } from "@/lib/metadata";

export const metadata: Metadata = {
  robots: PRIVATE_ROUTE_ROBOTS,
};

interface AccountLayoutProps {
  children: ReactNode;
}

export default async function AccountLayout({ children }: AccountLayoutProps) {
  return (
    <Suspense fallback={<AccountShellSkeleton />}>
      <AccountShell>{children}</AccountShell>
    </Suspense>
  );
}
