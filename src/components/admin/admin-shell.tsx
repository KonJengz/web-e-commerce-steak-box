import type { ReactNode } from "react";
import Link from "next/link";

import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { requireAdminUser } from "@/features/auth/services/current-user.service";
import { resolveUserAvatar } from "@/features/user/utils/avatar";
import MainContainer from "@/components/layout/header/main-container";
import { HeaderBrand } from "@/components/layout/header/header-brand";

interface AdminShellProps {
  children: ReactNode;
}

export async function AdminShell({ children }: AdminShellProps) {
  const currentUser = await requireAdminUser("/admin");
  const avatar = resolveUserAvatar(currentUser.email, currentUser.image);

  return (
    <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.08),_transparent_40%),linear-gradient(180deg,#f7f7f3_0%,#ffffff_30%,#f7f9f8_100%)]">
      <MainContainer>
        <div className="py-6 sm:py-8">
          <div className="mb-6 flex flex-col gap-4 rounded-[2rem] border border-border/70 bg-background/85 px-5 py-5 shadow-[0_18px_50px_rgba(0,0,0,0.06)] sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <HeaderBrand />
              <div className="hidden h-10 w-px bg-border/70 sm:block" />
              <div className="space-y-1">
                <p className="text-xs font-semibold tracking-[0.24em] text-emerald-600 uppercase">
                  Admin Console
                </p>
                <p className="text-sm text-muted-foreground">
                  Manage catalog data without mixing it into the customer account area.
                </p>
              </div>
            </div>

            <Button asChild variant="outline" className="rounded-full">
              <Link href="/">Back to Storefront</Link>
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
            <aside className="space-y-4 lg:sticky lg:top-8">
              <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.08)]">
                <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent_75%)]" />
                <div className="relative space-y-4">
                  <Avatar className="size-16 border-border/80 shadow-md">
                    <AvatarImage
                      src={avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="bg-emerald-500/10 font-semibold text-emerald-600">
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

                  <div className="rounded-[1.25rem] border border-emerald-500/15 bg-emerald-500/8 px-4 py-3 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
                    Admin routes are isolated from the customer layout and still
                    require backend authorization on every protected endpoint.
                  </div>
                </div>
              </div>

              <div className="rounded-[2rem] border border-border/70 bg-card/90 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
                <p className="mb-3 px-1 text-xs font-semibold tracking-[0.24em] uppercase text-muted-foreground">
                  Management
                </p>
                <AdminSidebarNav />
              </div>
            </aside>

            <div className="min-w-0">{children}</div>
          </div>
        </div>
      </MainContainer>
    </div>
  );
}
