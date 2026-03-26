import Link from "next/link";
import { ShoppingCart } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

import { HeaderNavigation } from "./header-navigation";
import type { HeaderUser } from "./header.types";
import { HeaderUserMenu } from "./header-user-menu.client";
import { ThemeToggle } from "./theme-toggle";

export function Header() {
  // TODO: Replace with real auth state from a server-side session.
  const isLoggedIn: boolean = true;
  const user: HeaderUser = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  };
  const cartItemsCount: number = 3;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/60 transition-all duration-300">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
        <HeaderNavigation />

        <div className="flex items-center gap-4">
          <ThemeToggle />

          <Button
            asChild
            variant="ghost"
            size="icon"
            className="group relative rounded-full duration-300"
          >
            <Link href="/cart" aria-label="Open cart">
              <ShoppingCart className="size-5 group-hover:text-primary" />
              {cartItemsCount > 0 ? (
                <Badge className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary p-0 text-xs text-primary-foreground animate-in zoom-in">
                  {cartItemsCount}
                </Badge>
              ) : null}
            </Link>
          </Button>

          {isLoggedIn ? (
            <HeaderUserMenu user={user} />
          ) : (
            <Button
              asChild
              className="rounded-full px-6 duration-300 hover:bg-primary/90 hover:scale-105 hover:shadow-md active:scale-95"
            >
              <Link href="/auth/login">Log In</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
