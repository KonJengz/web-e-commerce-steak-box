import type { ReactNode } from "react";
import { Suspense } from "react";

import { AccountShell } from "@/components/account/account-shell";
import { AccountShellSkeleton } from "@/components/shared/loading-skeletons";

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
