"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { accountNavItems } from "@/components/account/account.constants";
import { cn } from "@/lib/utils";

export function AccountSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-2">
      {accountNavItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-[1.25rem] border px-4 py-3 text-sm font-medium transition-all",
              isActive
                ? "border-primary/40 bg-primary/12 text-foreground shadow-[0_18px_40px_rgba(214,123,52,0.12)]"
                : "border-border/70 bg-background/55 text-muted-foreground hover:border-primary/20 hover:bg-muted/60 hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "inline-flex size-9 items-center justify-center rounded-full border transition-colors",
                isActive
                  ? "border-primary/30 bg-primary/15 text-primary"
                  : "border-border/70 bg-background text-muted-foreground",
              )}
            >
              <Icon className="size-4" />
            </span>
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
