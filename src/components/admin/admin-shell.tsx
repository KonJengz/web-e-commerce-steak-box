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
    <div className="min-h-full bg-[radial-gradient(circle_at_top,_rgba(16,185,129,0.12),_transparent_34%),radial-gradient(circle_at_bottom_left,_rgba(246,193,104,0.08),_transparent_28%),linear-gradient(180deg,#f2f7f3_0%,#f7faf8_24%,#fbfcfb_100%)]">
      <MainContainer>
        <div className="py-6 sm:py-8">
          <div className="relative mb-6 overflow-hidden rounded-[2rem] border border-emerald-500/15 bg-[linear-gradient(135deg,rgba(255,255,255,0.92),rgba(247,250,248,0.94))] px-5 py-5 shadow-[0_28px_90px_rgba(8,20,14,0.08)] sm:px-6 sm:py-6">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-x-0 top-0 h-28 bg-[radial-gradient(circle_at_top,rgba(16,185,129,0.18),transparent_72%)]" />
              <div className="absolute right-[-6%] bottom-[-18%] size-56 rounded-full bg-emerald-500/8 blur-[110px]" />
              <div className="absolute left-[-8%] top-[-30%] size-48 rounded-full bg-[#f6c168]/10 blur-[110px]" />
              <div className="absolute inset-0 opacity-35 [background-image:linear-gradient(rgba(16,185,129,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.08)_1px,transparent_1px)] [background-position:center_center] [background-size:24px_24px]" />
            </div>

            <div className="relative flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
              <div className="space-y-5">
                <div className="flex items-center gap-4">
                  <HeaderBrand />
                  <div className="hidden h-10 w-px bg-border/70 sm:block" />
                  <div className="space-y-1">
                    <p className="text-xs font-semibold tracking-[0.24em] text-emerald-700 uppercase">
                      Admin Console
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Catalog operations stay isolated from the storefront, but the
                      motion, rhythm, and service layer remain shared.
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <div className="rounded-full border border-emerald-500/15 bg-white/75 px-4 py-2 text-sm text-foreground shadow-[0_10px_25px_rgba(0,0,0,0.03)] backdrop-blur-sm">
                    Protected writes only
                  </div>
                  <div className="rounded-full border border-border/70 bg-white/65 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm">
                    Separate navigation from customer account
                  </div>
                  <div className="rounded-full border border-border/70 bg-white/65 px-4 py-2 text-sm text-muted-foreground backdrop-blur-sm">
                    Docs-driven admin surface
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="flex min-w-[240px] items-center gap-4 rounded-[1.6rem] border border-emerald-500/15 bg-white/72 px-4 py-3 shadow-[0_16px_40px_rgba(0,0,0,0.04)] backdrop-blur-sm">
                  <Avatar className="size-14 border border-border/80 shadow-md">
                    <AvatarImage
                      src={avatar}
                      alt={currentUser.name}
                      referrerPolicy="no-referrer"
                    />
                    <AvatarFallback className="bg-emerald-500/10 font-semibold text-emerald-700">
                      {currentUser.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 space-y-1">
                    <p className="truncate text-base font-semibold tracking-tight text-foreground">
                      {currentUser.name}
                    </p>
                    <p className="truncate text-sm text-muted-foreground">
                      {currentUser.email}
                    </p>
                  </div>
                </div>

                <Button asChild variant="outline" className="rounded-full bg-white/70 backdrop-blur-sm">
                  <Link href="/">Back to Storefront</Link>
                </Button>
              </div>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-[300px_minmax(0,1fr)] lg:items-start">
            <aside className="space-y-4 lg:sticky lg:top-8">
              <div className="relative overflow-hidden rounded-[2rem] border border-emerald-500/12 bg-[linear-gradient(165deg,rgba(14,29,23,0.97),rgba(12,20,17,0.94))] p-5 text-white shadow-[0_30px_85px_rgba(0,0,0,0.2)]">
                <div className="pointer-events-none absolute inset-0">
                  <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgba(142,242,197,0.4)_1px,transparent_1px),linear-gradient(90deg,rgba(142,242,197,0.4)_1px,transparent_1px)] [background-size:22px_22px]" />
                  <div className="absolute top-[-18%] right-[-10%] size-40 rounded-full bg-emerald-400/16 blur-[90px]" />
                </div>

                <div className="relative space-y-4">
                  <p className="text-xs font-semibold tracking-[0.24em] uppercase text-[#8ef2c5]">
                    Access Pattern
                  </p>
                  <p className="text-sm leading-7 text-white/72">
                    Admin routes stay visually distinct and still rely on backend
                    authorization for every protected write.
                  </p>

                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                    <div className="rounded-[1.3rem] border border-white/8 bg-white/6 px-4 py-3">
                      <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-white/45">
                        Scope
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        Dashboard, products, categories
                      </p>
                    </div>
                    <div className="rounded-[1.3rem] border border-white/8 bg-white/6 px-4 py-3">
                      <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-white/45">
                        Policy
                      </p>
                      <p className="mt-2 text-sm font-medium text-white">
                        Customer menus stay separate
                      </p>
                    </div>
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
