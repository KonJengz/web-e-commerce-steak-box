import type { ReactNode } from "react";

import { AccountShell } from "@/components/account/account-shell";

interface AccountLayoutProps {
  children: ReactNode;
}

export default async function AccountLayout({
  children,
}: AccountLayoutProps) {
  return <AccountShell>{children}</AccountShell>;
}
