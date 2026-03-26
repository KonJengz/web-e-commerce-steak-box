import Link from "next/link";
import { LogIn, ShoppingCart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import type { HeaderUser } from "@/components/layout/header/header.types";
import { HeaderUserMenu } from "@/components/layout/header/header-user-menu.client";
import { ThemeToggle } from "@/components/layout/header/theme-toggle";

interface HeaderActionsProps {
  cartItemsCount: number;
  isLoggedIn: boolean;
  user: HeaderUser | null;
}

export function HeaderActions({
  cartItemsCount,
  isLoggedIn,
  user,
}: HeaderActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2 sm:gap-2">
      <ThemeToggle />

      <Button
        asChild
        variant="ghost"
        size="icon"
        className="group relative size-9 rounded-full sm:size-10"
      >
        <Link href="/cart" aria-label="Open cart">
          <ShoppingCart className="size-5 group-hover:text-primary transition-all" />
          {cartItemsCount > 0 ? (
            <Badge className="absolute right-0 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary p-0 text-[10px] text-primary-foreground">
              {cartItemsCount}
            </Badge>
          ) : null}
        </Link>
      </Button>

      {isLoggedIn && user ? (
        <HeaderUserMenu user={user} />
      ) : (
        <Button
          asChild
          className="rounded-full px-4 duration-200 hover:bg-primary/90 hover:scale-105 hover:shadow-md active:scale-95"
        >
          <Link href="/login">
            <LogIn className="size-4 group-hover:text-primary transition-all" />
            <span>Login</span>
          </Link>
        </Button>
      )}
    </div>
  );
}
