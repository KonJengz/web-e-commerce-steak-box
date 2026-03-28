import {
  Boxes,
  LayoutDashboard,
  ReceiptText,
  Tags,
  type LucideIcon,
} from "lucide-react";

export interface AdminNavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

export const adminNavItems: readonly AdminNavItem[] = [
  {
    href: "/admin/dashboard",
    icon: LayoutDashboard,
    label: "Dashboard",
  },
  {
    href: "/admin/products",
    icon: Boxes,
    label: "Products",
  },
  {
    href: "/admin/orders",
    icon: ReceiptText,
    label: "Orders",
  },
  {
    href: "/admin/categories",
    icon: Tags,
    label: "Categories",
  },
];
