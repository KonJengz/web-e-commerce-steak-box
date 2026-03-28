import type { ReactNode } from "react";
import Link from "next/link";
import { Store } from "lucide-react";

import { AdminSidebarNav } from "@/components/admin/admin-sidebar-nav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { adminGhostButtonClassName } from "@/components/ui/admin-action-styles";
import { Button } from "@/components/ui/button";
import { requireAdminUser } from "@/features/auth/services/current-user.service";
import { resolveUserAvatar } from "@/features/user/utils/avatar";
import MainContainer from "@/components/layout/header/main-container";
import { HeaderBrand } from "@/components/layout/header/header-brand";
import { AdminLogoutButton } from "@/components/admin/admin-logout-button";

interface AdminShellProps {
  children: ReactNode;
}

export async function AdminShell({ children }: AdminShellProps) {
  const currentUser = await requireAdminUser("/admin");
  const avatar = resolveUserAvatar(currentUser.email, currentUser.image);

  return (
    <div className="min-h-full">
      {/* Top bar */}
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <MainContainer>
          <div className="flex items-center justify-between gap-4 py-3">
            {/* Brand + Admin label */}
            <div className="flex items-center gap-4">
              <HeaderBrand />
              <div className="hidden h-8 w-px bg-border/60 sm:block" />
              <div className="hidden sm:block">
                <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-primary">
                  Admin Console
                </p>
              </div>
            </div>

            {/* User + Actions */}
            <div className="flex items-center gap-3">
              <Button
                asChild
                variant="ghost"
                size="sm"
                className={`hidden sm:inline-flex ${adminGhostButtonClassName}`}
              >
                <Link href="/">
                  <Store className="mr-1 size-3.5" />
                  Storefront
                </Link>
              </Button>

              <div className="flex items-center gap-3 rounded-full border border-border/50 bg-card px-3 py-1.5">
                <Avatar className="size-7 border border-border/60">
                  <AvatarImage
                    src={avatar}
                    alt={currentUser.name}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
                    {currentUser.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden max-w-32 truncate text-sm font-medium text-foreground md:block">
                  {currentUser.name}
                </span>
              </div>

              <AdminLogoutButton />
            </div>
          </div>
        </MainContainer>
      </header>

      {/* Content area */}
      <MainContainer>
        <div className="py-6 sm:py-8">
          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
            {/* Sidebar */}
            <aside className="animate-slide-in-left hidden space-y-4 lg:sticky lg:top-20 lg:block">
              <nav className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
                <p className="mb-3 px-1 text-[10px] font-semibold tracking-[0.28em] uppercase text-muted-foreground">
                  Management
                </p>
                <AdminSidebarNav />
              </nav>

              {/* Quick info card */}
              <div className="gradient-border rounded-2xl border border-border/40 bg-card p-4">
                <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-muted-foreground">
                  Signed in as
                </p>
                <p className="mt-2 truncate text-sm font-medium text-foreground">
                  {currentUser.email}
                </p>
                <p className="mt-1 text-xs capitalize text-primary">
                  {currentUser.role.toLowerCase()}
                </p>
              </div>
            </aside>

            {/* Page content */}
            <div className="animate-fade-in-up min-w-0" style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}>
              {children}
            </div>
          </div>
        </div>
      </MainContainer>
    </div>
  );
}
