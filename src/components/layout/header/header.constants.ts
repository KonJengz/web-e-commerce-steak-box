import { MapPin, Package, User } from "lucide-react";

import type { HeaderUserMenuItem } from "./header.types";

export const headerUserMenuItems: readonly HeaderUserMenuItem[] = [
  {
    href: "/app/account/profile",
    label: "Profile",
    icon: User,
  },
  {
    href: "/app/account/orders",
    label: "My Orders",
    icon: Package,
  },
  {
    href: "/app/account/addresses",
    label: "Addresses",
    icon: MapPin,
  },
];
