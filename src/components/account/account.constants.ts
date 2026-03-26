import {
  MapPin,
  Package,
  User,
  type LucideIcon,
} from "lucide-react";

export interface AccountNavItem {
  href: string;
  icon: LucideIcon;
  label: string;
}

export const accountNavItems: readonly AccountNavItem[] = [
  {
    href: "/profile",
    icon: User,
    label: "Profile",
  },
  {
    href: "/orders",
    icon: Package,
    label: "Orders",
  },
  {
    href: "/addresses",
    icon: MapPin,
    label: "Addresses",
  },
];
