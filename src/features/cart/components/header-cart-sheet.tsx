"use client";

import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  ShoppingCart,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";

import {
  formatAccountDateTime,
  formatCurrency,
} from "@/components/account/account.utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import { HeaderCartItemCard } from "@/features/cart/components/header-cart-item-card";
import type { Cart } from "@/features/cart/types/cart.type";
import { buildCartOverview } from "@/features/cart/utils/cart-summary";

interface HeaderCartSheetProps {
  cart: Cart | null;
  isLoggedIn: boolean;
}

const MAX_PREVIEW_ITEMS = 4;

const formatCartBadgeCount = (value: number): string => {
  if (value > 99) {
    return "99+";
  }

  return String(value);
};

export function HeaderCartSheet({
  cart,
  isLoggedIn,
}: HeaderCartSheetProps) {
  const [open, setOpen] = useState<boolean>(false);
  const items = cart?.items ?? [];
  const overview = buildCartOverview(items);
  const previewItems = items.slice(0, MAX_PREVIEW_ITEMS);
  const hiddenItemCount = Math.max(items.length - previewItems.length, 0);
  const cartTotalAmount = cart?.totalAmount ?? "0";
  const cartUpdatedAt = cart?.updatedAt ?? previewItems[0]?.updatedAt ?? "";

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          className="group relative h-10 rounded-full px-2.5 sm:px-3.5"
          aria-label="Open cart drawer"
        >
          <span className="inline-flex size-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary/15">
            <ShoppingCart className="size-4" />
          </span>
          <span className="hidden text-xs font-medium text-foreground sm:inline">
            Cart
          </span>
          {overview.totalUnits > 0 ? (
            <Badge className="absolute -top-1 right-0 flex h-5 min-w-5 items-center justify-center rounded-full px-1 text-[10px]">
              {formatCartBadgeCount(overview.totalUnits)}
            </Badge>
          ) : null}
        </Button>
      </SheetTrigger>

      <SheetContent
        side="right"
        className="w-full gap-0 border-border/70 bg-background/96 p-0 sm:max-w-md"
      >
        <SheetHeader className="gap-3 border-b border-border/60 px-5 py-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <SheetTitle>Cart Snapshot</SheetTitle>
              <SheetDescription className="mt-1 leading-6">
                Quick cart review without leaving the current page.
              </SheetDescription>
            </div>
            <span className="inline-flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Boxes className="size-5" />
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary" className="rounded-full px-3 py-1">
              {overview.distinctItems} line{overview.distinctItems === 1 ? "" : "s"}
            </Badge>
            <Badge variant="outline" className="rounded-full px-3 py-1">
              {overview.totalUnits} unit{overview.totalUnits === 1 ? "" : "s"}
            </Badge>
            {overview.blockerCount > 0 ? (
              <Badge className="rounded-full border border-amber-500/20 bg-amber-500/12 px-3 py-1 text-amber-700 dark:text-amber-300">
                {overview.blockerCount} need attention
              </Badge>
            ) : null}
          </div>
        </SheetHeader>

        {!isLoggedIn ? (
          <div className="flex flex-1 flex-col justify-between px-5 py-6">
            <div className="space-y-4">
              <div className="inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <ShoppingCart className="size-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  Sign in to stage a cart
                </h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  Cart, checkout, and saved address flow stay behind your account
                  session.
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-border/60 bg-card/70 p-4 text-sm leading-6 text-muted-foreground">
                Once you sign in, the header cart turns into a live order draft
                with quantity changes, blockers, and a fast route to checkout.
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button asChild className="rounded-full">
                <Link
                  href={buildLoginRedirectPath("/cart")}
                  onClick={() => setOpen(false)}
                >
                  Login to Continue
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/cart" onClick={() => setOpen(false)}>
                  Open Cart Page
                </Link>
              </Button>
            </div>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col justify-between px-5 py-6">
            <div className="space-y-4">
              <div className="inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="size-6" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold tracking-tight text-foreground">
                  Cart is clear
                </h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  Add products and this drawer will turn into a compact order
                  workspace.
                </p>
              </div>
              <div className="rounded-[1.4rem] border border-border/60 bg-card/70 p-4 text-sm leading-6 text-muted-foreground">
                Quantity controls, line totals, and blocker warnings are ready as
                soon as items land in the cart.
              </div>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <Button asChild className="rounded-full">
                <Link href="/" onClick={() => setOpen(false)}>
                  Continue Shopping
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/cart" onClick={() => setOpen(false)}>
                  Open Full Cart
                </Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="border-b border-border/60 px-5 py-4">
              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-4 rounded-[1.3rem] border border-border/60 bg-card/75 px-4 py-3">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                      Cart total
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Current draft value across all active lines.
                    </p>
                  </div>
                  <p className="text-base font-semibold text-foreground">
                    {formatCurrency(cartTotalAmount)}
                  </p>
                </div>
                <div className="flex items-start justify-between gap-4 rounded-[1.3rem] border border-border/60 bg-card/75 px-4 py-3">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                      Last updated
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Freshness of the cart snapshot in this drawer.
                    </p>
                  </div>
                  <p className="max-w-[10rem] text-right text-sm font-medium text-foreground">
                    {formatAccountDateTime(cartUpdatedAt)}
                  </p>
                </div>
                <div className="flex items-start justify-between gap-4 rounded-[1.3rem] border border-border/60 bg-card/75 px-4 py-3">
                  <div>
                    <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                      Checkout
                    </p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Ready only when stock and availability blockers are clear.
                    </p>
                  </div>
                  <Badge
                    className={
                      overview.canCheckout
                        ? "rounded-full border border-emerald-500/20 bg-emerald-500/12 px-3 py-1 text-emerald-700 dark:text-emerald-300"
                        : "rounded-full border border-amber-500/20 bg-amber-500/12 px-3 py-1 text-amber-700 dark:text-amber-300"
                    }
                  >
                    {overview.canCheckout ? "Ready now" : "Blocked"}
                  </Badge>
                </div>
              </div>

              {overview.blockerCount > 0 ? (
                <div className="mt-3 flex items-start gap-3 rounded-[1.3rem] border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-900 dark:text-amber-100">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  <p>
                    Some lines need attention before checkout. Open the full cart
                    to adjust stock-sensitive items.
                  </p>
                </div>
              ) : null}
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
              <div className="space-y-3">
                {previewItems.map((item) => (
                  <HeaderCartItemCard key={item.id} item={item} />
                ))}
              </div>

              {hiddenItemCount > 0 ? (
                <p className="mt-4 text-sm text-muted-foreground">
                  + {hiddenItemCount} more line
                  {hiddenItemCount === 1 ? "" : "s"} in the full cart
                </p>
              ) : null}
            </div>

            <div className="border-t border-border/60 px-5 py-5">
              <div className="flex flex-col gap-3">
                {overview.canCheckout ? (
                  <Button asChild className="rounded-full">
                    <Link href="/checkout" onClick={() => setOpen(false)}>
                      Proceed to Checkout
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button type="button" className="rounded-full" disabled>
                    Resolve blockers to checkout
                  </Button>
                )}

                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/cart" onClick={() => setOpen(false)}>
                    Open Full Cart
                  </Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
