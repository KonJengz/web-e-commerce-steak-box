import type { LucideIcon } from "lucide-react";
import type { UserRole } from "@/features/user/types/user.type";

export interface HeaderUser {
  name: string;
  email: string;
  avatar: string;
  role: UserRole;
}

export interface HeaderNavItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

export interface HeaderUserMenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
}
