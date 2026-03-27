"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { adminNavItems } from "@/components/admin/admin.constants";
import { cn } from "@/lib/utils";

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="space-y-1">
      {adminNavItems.map((item) => {
        const Icon = item.icon;
        const isActive =
          pathname === item.href || pathname.startsWith(`${item.href}/`);

        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all duration-200",
              isActive
                ? "bg-primary/10 text-primary shadow-sm"
                : "text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            <span
              className={cn(
                "inline-flex size-8 items-center justify-center rounded-lg transition-colors",
                isActive
                  ? "bg-primary/15 text-primary"
                  : "bg-muted text-muted-foreground",
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
