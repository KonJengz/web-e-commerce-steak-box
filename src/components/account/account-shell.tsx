import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { AccountSidebarNav } from "@/components/account/account-sidebar-nav";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getCurrentUser } from "@/features/auth/services/current-user.service";
import { resolveUserAvatar } from "@/features/user/utils/avatar";

interface AccountShellProps {
  children: ReactNode;
}

export async function AccountShell({ children }: AccountShellProps) {
  const currentUser = await getCurrentUser();

  if (!currentUser) {
    redirect("/login");
  }

  const avatar = resolveUserAvatar(currentUser.email, currentUser.image);

  return (
    <div className="py-6 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.08)]">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent_75%)]" />
            <div className="relative space-y-4">
              <Avatar className="size-16 border-border/80 shadow-md">
                <AvatarImage
                  src={avatar}
                  alt={currentUser.name}
                  referrerPolicy="no-referrer"
                />
                <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                  {currentUser.name.charAt(0)}
                </AvatarFallback>
              </Avatar>

              <div className="space-y-1">
                <p className="text-lg font-semibold tracking-tight text-foreground">
                  {currentUser.name}
                </p>
                <p className="text-sm text-muted-foreground">
                  {currentUser.email}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-full px-2.5 py-1">
                  {currentUser.role}
                </Badge>
                <Badge className="rounded-full px-2.5 py-1">Signed In</Badge>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-card/90 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
            <p className="mb-3 px-1 text-xs font-semibold tracking-[0.24em] uppercase text-muted-foreground">
              Account
            </p>
            <AccountSidebarNav />
          </div>
        </aside>

        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
