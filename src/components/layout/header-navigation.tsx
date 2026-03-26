import Link from "next/link";
import { Home, LayoutGrid, Store } from "lucide-react";

import { LogoSteakBox } from "@/components/shared/icons/logo-main";

import type { HeaderNavItem } from "./header.types";

const navigationItems: readonly HeaderNavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: Home,
  },
  {
    href: "/products",
    label: "Shop",
    icon: Store,
  },
  {
    href: "/categories",
    label: "Categories",
    icon: LayoutGrid,
  },
];

export function HeaderNavigation() {
  return (
    <div className="flex items-center gap-8">
      <Link href="/" className="flex items-center gap-3">
        <LogoSteakBox className="w-11" />
        <span className="hidden text-2xl font-serif font-bold tracking-tight lg:inline-block">
          Steak Box
        </span>
      </Link>

      <nav className="hidden items-center gap-6 text-sm font-medium md:flex">
        {navigationItems.map((item: HeaderNavItem) => {
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-2 text-muted-foreground transition-colors duration-200 hover:text-primary"
            >
              <Icon className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-1" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
