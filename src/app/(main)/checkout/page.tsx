import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowRight,
  CreditCard,
  MapPinHouse,
  ShoppingBag,
  TriangleAlert,
} from "lucide-react";

import { AccountPageHero } from "@/components/account/account-page-hero";
import {
  formatAccountDateTime,
  formatCurrency,
} from "@/components/account/account.utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addressService } from "@/features/address/services/address.service";
import { executeProtectedRequestOrRedirect } from "@/features/auth/services/current-user.service";
import { cartService } from "@/features/cart/services/cart.service";
import { CheckoutSubmitForm } from "@/features/order/components/checkout-submit-form";
import { buildCartOverview } from "@/features/cart/utils/cart-summary";
import { buildProductPath } from "@/features/product/utils/product-path";
import { PRIVATE_ROUTE_ROBOTS } from "@/lib/metadata";

export const metadata: Metadata = {
  robots: PRIVATE_ROUTE_ROBOTS,
  title: "Checkout — Steak Box",
};

export default async function CheckoutPage() {
  const [cartResult, addressesResult] = await executeProtectedRequestOrRedirect(
    async (accessToken) =>
      Promise.all([
        cartService.getCurrent(accessToken),
        addressService.getAll(accessToken),
      ]),
    "/checkout",
  );

  const cart = cartResult.data;
  const addresses = addressesResult.data;
  const overview = buildCartOverview(cart.items);
  const totalUnits = overview.totalUnits;
  const defaultAddress =
    addresses.find((address) => address.isDefault) ?? addresses[0] ?? null;
  const canCreateOrder = overview.canCheckout && addresses.length > 0;

  return (
    <div className="space-y-6 py-6 sm:py-10">
      <AccountPageHero
        badge="Checkout Queue"
        title="Lock the order, then move straight into payment review."
        description="Checkout now creates the order snapshot immediately, reserves stock, and sends you to upload the payment slip so admin can confirm the transfer."
        variant="cart"
      >
        <Badge className="rounded-full px-3 py-1">
          {totalUnits} item{totalUnits === 1 ? "" : "s"}
        </Badge>
        <Badge
          variant="outline"
          className="rounded-full border-white/20 px-3 py-1 text-white/80"
        >
          Total {formatCurrency(cart.totalAmount)}
        </Badge>
        {overview.blockerCount > 0 ? (
          <Badge className="rounded-full border border-amber-400/20 bg-amber-400/12 px-3 py-1 text-amber-100">
            {overview.blockerCount} blocker
            {overview.blockerCount === 1 ? "" : "s"}
          </Badge>
        ) : null}
      </AccountPageHero>

      {cart.items.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-border/70 bg-card/80 p-8 text-center shadow-[0_22px_70px_rgba(0,0,0,0.05)]">
          <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingBag className="size-6" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
            Nothing to checkout yet
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            Add products to your cart first, then come back here to continue
            the purchase flow.
          </p>
          <div className="mt-6">
            <Button asChild className="rounded-full">
              <Link href="/cart">
                Back to Cart
                <ArrowRight className="size-4" />
              </Link>
            </Button>
          </div>
        </section>
      ) : (
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
          <section className="grid gap-4">
            <article className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <ShoppingBag className="size-4" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Order Snapshot
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    This is the exact draft that will be converted into an order.
                  </p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                    Items
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {totalUnits}
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                    Products
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {cart.items.length}
                  </p>
                </div>
                <div className="rounded-[1.25rem] border border-primary/20 bg-primary/10 px-4 py-3">
                  <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                    Total
                  </p>
                  <p className="mt-2 text-lg font-semibold text-foreground">
                    {formatCurrency(cart.totalAmount)}
                  </p>
                </div>
              </div>

              <div className="mt-5 space-y-3">
                {cart.items.map((item) => {
                  const lineTotal = Number(item.currentPrice) * item.quantity;
                  const hasBlocker = !item.isActive || item.stock < item.quantity;

                  return (
                    <div
                      key={item.id}
                      className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-4"
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="space-y-1">
                          <Link
                            href={buildProductPath(item.productSlug)}
                            className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                          >
                            {item.productName}
                          </Link>
                          <p className="text-sm text-muted-foreground">
                            {item.quantity} × {formatCurrency(item.currentPrice)}
                          </p>
                        </div>

                        <div className="space-y-2 text-right">
                          <p className="text-sm font-semibold text-foreground">
                            {formatCurrency(lineTotal)}
                          </p>
                          {hasBlocker ? (
                            <Badge className="rounded-full border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300">
                              Needs attention
                            </Badge>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </article>

            <article className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <MapPinHouse className="size-4" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Delivery Address
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Orders can only be created against one of your saved addresses.
                  </p>
                </div>
              </div>

              {addresses.length === 0 ? (
                <div className="rounded-[1.5rem] border border-dashed border-border/60 bg-background/55 px-4 py-4 text-sm leading-7 text-muted-foreground">
                  No delivery address is saved yet. Add one before you place the
                  order.
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="rounded-[1.5rem] border border-border/60 bg-background/55 px-4 py-4 text-sm leading-7 text-muted-foreground">
                    You currently have{" "}
                    <span className="font-semibold text-foreground">
                      {addresses.length}
                    </span>{" "}
                    saved address{addresses.length === 1 ? "" : "es"} ready for
                    checkout.
                  </div>
                  {defaultAddress ? (
                    <div className="rounded-[1.5rem] border border-primary/15 bg-primary/8 px-4 py-4">
                      <div className="flex items-center gap-2">
                        <Badge className="rounded-full px-3 py-1">Default</Badge>
                        <p className="text-sm font-semibold text-foreground">
                          {defaultAddress.recipientName}
                        </p>
                      </div>
                      <p className="mt-3 text-sm leading-7 text-muted-foreground">
                        {defaultAddress.addressLine}, {defaultAddress.city}{" "}
                        {defaultAddress.postalCode}
                      </p>
                    </div>
                  ) : null}
                </div>
              )}
            </article>

            <article className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <CreditCard className="size-4" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Payment Flow
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    After the order is created, upload the transfer slip on the
                    order detail page.
                  </p>
                </div>
              </div>

              <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                  Step 1. Create the order and reserve stock immediately.
                </div>
                <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                  Step 2. Upload a payment slip so the order moves into payment
                  review.
                </div>
                <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                  Step 3. Admin confirms payment, then updates shipping and
                  tracking.
                </div>
              </div>
            </article>
          </section>

          <aside className="space-y-4 xl:sticky xl:top-24">
            {addresses.length > 0 ? (
              <CheckoutSubmitForm
                addresses={addresses}
                canSubmit={canCreateOrder}
                redirectPath="/checkout"
                totalAmount={cart.totalAmount}
                totalUnits={totalUnits}
              />
            ) : (
              <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
                <div className="space-y-3">
                  <h2 className="text-lg font-semibold text-foreground">
                    Add a delivery address first
                  </h2>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Checkout cannot create an order until one saved address is
                    available for shipping.
                  </p>
                  <Button asChild className="rounded-full">
                    <Link href="/addresses">
                      Manage Addresses
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                </div>
              </section>
            )}

            {overview.blockerCount > 0 ? (
              <section className="rounded-[2rem] border border-amber-500/20 bg-amber-500/10 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
                <div className="flex items-start gap-3 text-sm leading-6 text-amber-900 dark:text-amber-100">
                  <TriangleAlert className="mt-0.5 size-4 shrink-0" />
                  <div>
                    <p className="font-semibold">Resolve checkout blockers</p>
                    <p className="mt-1">
                      Inactive or over-stock lines must be corrected in the cart
                      before the order can be created.
                    </p>
                  </div>
                </div>
              </section>
            ) : null}

            <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    Cart updated
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {formatAccountDateTime(cart.updatedAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                  <span className="text-sm text-muted-foreground">
                    Addresses ready
                  </span>
                  <span className="text-sm font-medium text-foreground">
                    {addresses.length}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-[1.25rem] border border-primary/20 bg-primary/10 px-4 py-3">
                  <span className="text-sm font-medium text-foreground">
                    Order total
                  </span>
                  <span className="text-lg font-semibold text-foreground">
                    {formatCurrency(cart.totalAmount)}
                  </span>
                </div>
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
