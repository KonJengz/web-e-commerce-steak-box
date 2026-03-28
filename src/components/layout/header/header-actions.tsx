import Link from "next/link";
import { LogIn } from "lucide-react";

import { Button } from "@/components/ui/button";

import type { HeaderUser } from "@/components/layout/header/header.types";
import { HeaderUserMenu } from "@/components/layout/header/header-user-menu.client";
import { ThemeToggle } from "@/components/layout/header/theme-toggle";
import { HeaderCartSheet } from "@/features/cart/components/header-cart-sheet";
import type { Cart } from "@/features/cart/types/cart.type";

interface HeaderActionsProps {
  cart: Cart | null;
  isLoggedIn: boolean;
  user: HeaderUser | null;
}

export function HeaderActions({
  cart,
  isLoggedIn,
  user,
}: HeaderActionsProps) {
  return (
    <div className="flex items-center justify-end gap-2 sm:gap-2">
      <ThemeToggle />

      <HeaderCartSheet cart={cart} isLoggedIn={isLoggedIn} />

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
