"use client";

import Link from "next/link";
import {
  ShoppingCart,
  Home,
  Store,
  LayoutGrid,
  User,
  Package,
  MapPin,
  LogOut,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./theme-toggle";
import { LogoSteakBox } from "@/components/shared/icons/logo-main";

export function Header() {
  // TODO: Replace with real auth state from global store/context later
  const isLoggedIn = true;
  const user = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  };
  const cartItemsCount = 3;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm transition-all duration-300">
      <div className="container mx-auto flex h-20 items-center justify-between px-4 lg:px-8">
        {/* Logo & Navigation */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-14 h-14 overflow-hidden rounded-md flex items-center justify-center bg-primary transition-transform duration-300 shadow-md">
              <LogoSteakBox className="w-10 h-10 text-primary-foreground transition-colors" />
            </div>
            <span className="hidden text-2xl font-bold tracking-tight lg:inline-block transition-colors duration-300 font-serif">
              Steak Box
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
            <Link
              href="/"
              className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <Home className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-1" />{" "}
              Home
            </Link>
            <Link
              href="/products"
              className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <Store className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-1" />{" "}
              Shop
            </Link>
            <Link
              href="/categories"
              className="group flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors duration-200"
            >
              <LayoutGrid className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-1" />{" "}
              Categories
            </Link>
          </nav>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-4">
          <ThemeToggle />

          <Link href="/cart">
            <Button
              variant="ghost"
              size="icon"
              className="relative rounded-full hover:bg-muted group transition-all duration-300 hover:scale-110"
            >
              <ShoppingCart className="h-5 w-5 group-hover:text-primary transition-colors" />
              {cartItemsCount > 0 && (
                <Badge className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center rounded-full p-0 text-xs bg-primary text-primary-foreground animate-in zoom-in">
                  {cartItemsCount}
                </Badge>
              )}
            </Button>
          </Link>

          {isLoggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full group transition-transform duration-300 hover:scale-105"
                >
                  <Avatar className="h-10 w-10 border-2 border-border group-hover:border-primary transition-colors shadow-sm">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary/10 text-primary font-bold">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-60 mt-2 shadow-lg rounded-xl border-border/50"
                align="end"
                forceMount
              >
                <DropdownMenuLabel className="font-normal p-3">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-semibold leading-none">
                      {user.name}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground mt-1">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuGroup className="p-1">
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer hover:text-primary hover:bg-primary/10 transition-colors rounded-lg mb-1"
                  >
                    <Link
                      href="/app/account/profile"
                      className="flex items-center w-full text-foreground/80 py-2"
                    >
                      <User className="mr-3 h-4 w-4" />
                      <span className="font-medium">Profile</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer hover:text-primary hover:bg-primary/10 transition-colors rounded-lg mb-1"
                  >
                    <Link
                      href="/app/account/orders"
                      className="flex items-center w-full text-foreground/80 py-2"
                    >
                      <Package className="mr-3 h-4 w-4" />
                      <span className="font-medium">My Orders</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    asChild
                    className="cursor-pointer hover:text-primary hover:bg-primary/10 transition-colors rounded-lg"
                  >
                    <Link
                      href="/app/account/addresses"
                      className="flex items-center w-full text-foreground/80 py-2"
                    >
                      <MapPin className="mr-3 h-4 w-4" />
                      <span className="font-medium">Addresses</span>
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem className="text-destructive cursor-pointer hover:text-destructive hover:bg-destructive/10 transition-colors p-1 m-1 py-3 rounded-lg font-medium">
                  <LogOut className="mr-3 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link href="/auth/login">
              <Button className="hover:bg-primary/90 transition-all duration-300 hover:shadow-md hover:scale-105 active:scale-95 font-medium px-6 rounded-full">
                Log In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
