import type { LucideIcon } from "lucide-react";

export interface HeaderUser {
  name: string;
  email: string;
  avatar: string;
}

export interface HeaderNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}
