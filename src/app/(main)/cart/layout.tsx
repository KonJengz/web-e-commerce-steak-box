import type { ReactNode } from "react";

import { AccountShell } from "@/components/account/account-shell";

interface CartLayoutProps {
  children: ReactNode;
}

export default function CartLayout({ children }: CartLayoutProps) {
  return <AccountShell>{children}</AccountShell>;
}
