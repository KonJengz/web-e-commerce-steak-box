import { LayoutDashboard } from "lucide-react";

import { accountNavItems } from "@/components/account/account.constants";

import type { HeaderUserMenuItem } from "./header.types";

export const headerUserMenuItems: readonly HeaderUserMenuItem[] = accountNavItems;

export const headerAdminMenuItem: HeaderUserMenuItem = {
  href: "/admin/dashboard",
  icon: LayoutDashboard,
  label: "Admin",
};
