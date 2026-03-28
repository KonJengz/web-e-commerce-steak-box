import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  ShoppingCart,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import { AccountPageHero } from "@/components/account/account-page-hero";
import {
  formatAccountDateTime,
  formatCurrency,
} from "@/components/account/account.utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentAccessToken } from "@/features/auth/services/current-user.service";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import { CartClearButton } from "@/features/cart/components/cart-clear-button";
import { CartItemRow } from "@/features/cart/components/cart-item-row";
import { cartService } from "@/features/cart/services/cart.service";
import { buildCartOverview } from "@/features/cart/utils/cart-summary";

export default async function CartPage() {
  const accessToken = await getCurrentAccessToken();
  const cart = accessToken ? (await cartService.getCurrent(accessToken)).data : null;
  const overview = buildCartOverview(cart?.items ?? []);
  const totalUnits = overview.totalUnits;
  const blockerCount = overview.blockerCount;
  const canCheckout = Boolean(cart && overview.canCheckout);

  return (
    <div className="space-y-6">
      <AccountPageHero
        badge="Cart Workspace"
        title="Review the draft before checkout."
        description="Adjust quantities, remove unavailable products, and keep the order summary clean before the next step."
        variant="cart"
      >
        {cart ? (
          <>
              <Badge className="rounded-full px-3 py-1">
              {overview.distinctItems} product
              {overview.distinctItems === 1 ? "" : "s"}
            </Badge>
            <Badge
              variant="outline"
              className="rounded-full border-white/20 px-3 py-1 text-white/80"
            >
              {totalUnits} unit{totalUnits === 1 ? "" : "s"}
            </Badge>
            {blockerCount > 0 ? (
              <Badge className="rounded-full border border-amber-400/20 bg-amber-400/12 px-3 py-1 text-amber-100">
                {blockerCount} need attention
              </Badge>
            ) : (
              <Badge className="rounded-full border border-emerald-400/20 bg-emerald-400/12 px-3 py-1 text-emerald-100">
                Ready for checkout
              </Badge>
            )}
          </>
        ) : (
          <>
            <Badge className="rounded-full px-3 py-1">Guest Cart</Badge>
            <Badge
              variant="outline"
              className="rounded-full border-white/20 px-3 py-1 text-white/80"
            >
              Login required for checkout
            </Badge>
          </>
        )}
      </AccountPageHero>

      {!cart ? (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="rounded-[2rem] border border-dashed border-border/70 bg-card/80 p-8 text-center shadow-[0_22px_70px_rgba(0,0,0,0.05)]">
            <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
              <ShoppingCart className="size-6" />
            </div>
            <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
              Sign in when you&apos;re ready to checkout
            </h1>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              Guests can inspect the cart, but checkout, addresses, and order
              creation stay behind your account session.
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              <Button asChild className="rounded-full">
                <Link href={buildLoginRedirectPath("/checkout")}>
                  Login to Checkout
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/">Continue Shopping</Link>
              </Button>
            </div>
          </section>

          <aside className="space-y-4 xl:sticky xl:top-24">
            <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
              <div className="mb-5 flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <Boxes className="size-4" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Checkout Policy
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Guest browsing is open. Checkout requires sign-in.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3 text-sm leading-6 text-muted-foreground">
                  Sign in unlocks delivery addresses, payment flow, and order
                  creation.
                </div>
                <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3 text-sm leading-6 text-muted-foreground">
                  After login, the app can send you straight back to checkout.
                </div>
              </div>
            </section>
          </aside>
        </div>
      ) : cart.items.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-border/70 bg-card/80 p-8 text-center shadow-[0_22px_70px_rgba(0,0,0,0.05)]">
          <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingCart className="size-6" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
            Your cart is empty
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            Start building your next Steak Box. Quantity controls, removal, and
            checkout summary will appear here as soon as products land in the
            cart.
          </p>
          <div className="mt-6">
            <Button asChild className="rounded-full">
              <Link href="/">
                Continue Shopping
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
            <div className="flex flex-col gap-4 border-b border-border/60 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
              <div className="space-y-1">
                <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-muted-foreground">
                  Order Draft
                </p>
                <h2 className="text-xl font-bold tracking-tight text-foreground">
                  Tune quantities and resolve blockers
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  Each row is live. Adjust quantity, remove items, or clean the
                  cart before you continue.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Badge variant="secondary" className="rounded-full px-3 py-1">
                  {cart.items.length} lines
                </Badge>
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  Total {formatCurrency(cart.totalAmount)}
                </Badge>
                <CartClearButton />
              </div>
            </div>

            {blockerCount > 0 ? (
              <div className="border-b border-border/60 bg-amber-500/8 px-6 py-4">
                <div className="flex items-start gap-3 text-sm leading-6 text-amber-900 dark:text-amber-100">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  <p>
                    {blockerCount} cart item{blockerCount === 1 ? "" : "s"} need
                    attention before checkout. Remove inactive products or adjust
                    quantities that exceed live stock.
                  </p>
                </div>
              </div>
            ) : null}

            <div className="divide-y divide-border/60">
              {cart.items.map((item) => (
                <CartItemRow key={item.id} item={item} />
              ))}
            </div>
          </section>

          <aside className="space-y-4 xl:sticky xl:top-24">
            <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
              <div className="mb-5 flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <Boxes className="size-4" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Cart Summary
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Fast snapshot of the current order draft.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    Distinct products
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {cart.items.length}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    Total units
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {totalUnits}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    Last updated
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {formatAccountDateTime(cart.updatedAt)}
                  </span>
                </div>
                {blockerCount > 0 ? (
                  <div className="flex items-center justify-between rounded-[1.25rem] border border-amber-500/20 bg-amber-500/10 px-4 py-3">
                    <span className="text-sm font-medium text-foreground">
                      Need attention
                    </span>
                    <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">
                      {blockerCount}
                    </span>
                  </div>
                ) : null}
                <div className="flex items-center justify-between rounded-[1.25rem] border border-primary/20 bg-primary/10 px-4 py-3">
                  <span className="text-sm font-medium text-foreground">
                    Cart total
                  </span>
                  <span className="text-lg font-semibold text-foreground">
                    {formatCurrency(cart.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="mt-5 flex flex-col gap-3">
                {canCheckout ? (
                  <Button asChild className="rounded-full">
                    <Link href="/checkout">
                      Proceed to Checkout
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    className="rounded-full"
                    disabled
                  >
                    Resolve blockers to checkout
                  </Button>
                )}
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/">Continue Shopping</Link>
                </Button>
              </div>
            </section>

            <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Best Checkout Flow
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Keep the cart clean before shipping details.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                  Review stock-sensitive items here first so checkout stays
                  focused on address and payment.
                </div>
                <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                  Destructive actions stay secondary. Quantity edits should be
                  faster than deleting and re-adding products.
                </div>
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
