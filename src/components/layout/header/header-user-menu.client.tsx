"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LogOut, Loader2 } from "lucide-react";

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

import { logoutAction } from "@/features/auth/actions/logout.action";
import { headerAdminMenuItem, headerUserMenuItems } from "./header.constants";
import type { HeaderUser, HeaderUserMenuItem } from "./header.types";

interface HeaderUserMenuProps {
  user: HeaderUser;
}

export function HeaderUserMenu({ user }: HeaderUserMenuProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const adminMenuItems: HeaderUserMenuItem[] =
    user.role === "ADMIN" ? [headerAdminMenuItem] : [];

  const handleLogout = (): void => {
    startTransition(async () => {
      await logoutAction();
      router.refresh();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="group relative rounded-full duration-300 h-10 w-10"
          disabled={isPending}
        >
          <Avatar className="h-9 w-9 border-border shadow-sm transition-colors sm:h-10 sm:w-10">
            <AvatarImage
              src={user.avatar}
              alt={user.name}
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className="bg-primary/10 font-bold text-primary">
              {user.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          {isPending && (
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-background/50">
              <Loader2 className="h-4 w-4 animate-spin text-primary" />
            </div>
          )}
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
        {adminMenuItems.length > 0 ? (
          <>
            <DropdownMenuGroup className="p-1">
              {adminMenuItems.map((item: HeaderUserMenuItem) => {
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
          </>
        ) : null}
        <DropdownMenuGroup className="p-1">
          {headerUserMenuItems.map((item: HeaderUserMenuItem) => {
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
        <DropdownMenuItem
          className="m-1 cursor-pointer rounded-lg p-1 py-3 font-medium text-destructive transition-colors hover:bg-destructive/10"
          onClick={handleLogout}
          disabled={isPending}
        >
          {isPending ? (
            <Loader2 className="mr-3 h-4 w-4 animate-spin" />
          ) : (
            <LogOut className="mr-3 h-4 w-4" />
          )}
          <span>{isPending ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
