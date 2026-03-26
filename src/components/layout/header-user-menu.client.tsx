"use client";

import Link from "next/link";
import { LogOut, MapPin, Package, User, type LucideIcon } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import type { HeaderUser } from "./header.types";

interface HeaderUserMenuItem {
  href: string;
  label: string;
  icon: LucideIcon;
}

interface HeaderUserMenuProps {
  user: HeaderUser;
}

const menuItems: readonly HeaderUserMenuItem[] = [
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

export function HeaderUserMenu({ user }: HeaderUserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="group relative h-10 w-10 rounded-full duration-300 hover:scale-105"
        >
          <Avatar className="h-10 w-10 border-2 border-border shadow-sm transition-colors group-hover:border-primary">
            <AvatarImage src={user.avatar} alt={user.name} />
            <AvatarFallback className="bg-primary/10 font-bold text-primary">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="mt-2 w-60 rounded-xl shadow-lg"
        align="end"
        forceMount
      >
        <DropdownMenuLabel className="p-3 font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-semibold leading-none">{user.name}</p>
            <p className="mt-1 text-xs leading-none text-muted-foreground">
              {user.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuGroup className="p-1">
          {menuItems.map((item: HeaderUserMenuItem) => {
            const Icon = item.icon;

            return (
              <DropdownMenuItem
                key={item.href}
                asChild
                className="mb-1 cursor-pointer rounded-lg transition-colors hover:bg-primary/10 hover:text-primary"
              >
                <Link
                  href={item.href}
                  className="flex w-full items-center py-2 text-foreground/80"
                >
                  <Icon className="mr-3 h-4 w-4" />
                  <span className="font-medium">{item.label}</span>
                </Link>
              </DropdownMenuItem>
            );
          })}
        </DropdownMenuGroup>
        <DropdownMenuSeparator className="bg-border/50" />
        <DropdownMenuItem className="m-1 cursor-pointer rounded-lg p-1 py-3 font-medium text-destructive transition-colors hover:bg-destructive/10">
          <LogOut className="mr-3 h-4 w-4" />
          <span>Log out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
