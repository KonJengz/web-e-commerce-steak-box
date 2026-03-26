import Link from "next/link";
import {
  ArrowRight,
  Boxes,
  Package,
  ShoppingCart,
  Sparkles,
} from "lucide-react";
import { redirect } from "next/navigation";

import { AccountPageHero } from "@/components/account/account-page-hero";
import {
  formatAccountDateTime,
  formatCurrency,
} from "@/components/account/account.utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentAccessToken } from "@/features/auth/services/current-user.service";
import { cartService } from "@/features/cart/services/cart.service";

const getLineTotal = (currentPrice: string, quantity: number): number => {
  const amount = Number(currentPrice);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return amount * quantity;
};

export default async function CartPage() {
  const accessToken = await getCurrentAccessToken();

  if (!accessToken) {
    redirect("/login");
  }

  const cart = (await cartService.getCurrent(accessToken)).data;
  const totalUnits = cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="space-y-6">
      <AccountPageHero
        badge="Cart Board"
        title="Stage your next box before checkout."
        description="Review the products waiting in your cart, watch stock and activity status, and keep the order total in view before you move forward."
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
      </AccountPageHero>

      {cart.items.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-border/70 bg-card/80 p-8 text-center shadow-[0_22px_70px_rgba(0,0,0,0.05)]">
          <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <ShoppingCart className="size-6" />
          </div>
          <h1 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
            Your cart is empty
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            Start building your next Steak Box. Once products land here,
            you&apos;ll see quantities, pricing, and activity status in one
            place.
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
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
          <section className="space-y-4">
            {cart.items.map((item) => (
              <article
                key={item.id}
                className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.06)]"
              >
                <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
                  <Avatar className="size-18 rounded-[1.5rem] border border-border/70 bg-background/70">
                    <AvatarImage
                      src={item.productImageUrl ?? undefined}
                      alt={item.productName}
                      className="rounded-[1.5rem]"
                    />
                    <AvatarFallback className="rounded-[1.5rem] bg-primary/10 text-primary">
                      <Package className="size-5" />
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0 flex-1 space-y-4">
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                      <div className="space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h2 className="text-lg font-semibold tracking-tight text-foreground">
                            {item.productName}
                          </h2>
                          <Badge className="rounded-full px-2.5 py-1">
                            Qty {item.quantity}
                          </Badge>
                          <Badge
                            variant={item.isActive ? "outline" : "destructive"}
                            className="rounded-full px-2.5 py-1"
                          >
                            {item.isActive ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                        <p className="text-sm leading-6 text-muted-foreground">
                          Product ID: {item.productId}
                        </p>
                      </div>

                      <div className="rounded-[1.25rem] border border-border/60 bg-background/60 px-4 py-3 text-right">
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                          Line Total
                        </p>
                        <p className="mt-2 text-lg font-semibold text-foreground">
                          {formatCurrency(getLineTotal(item.currentPrice, item.quantity))}
                        </p>
                      </div>
                    </div>

                    <div className="grid gap-3 sm:grid-cols-3">
                      <div className="rounded-[1.25rem] border border-border/60 bg-background/60 px-4 py-3">
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                          Unit Price
                        </p>
                        <p className="mt-2 text-sm font-medium text-foreground">
                          {formatCurrency(item.currentPrice)}
                        </p>
                      </div>
                      <div className="rounded-[1.25rem] border border-border/60 bg-background/60 px-4 py-3">
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                          Stock
                        </p>
                        <p className="mt-2 text-sm font-medium text-foreground">
                          {item.stock} available
                        </p>
                      </div>
                      <div className="rounded-[1.25rem] border border-border/60 bg-background/60 px-4 py-3">
                        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                          Updated
                        </p>
                        <p className="mt-2 text-sm font-medium text-foreground">
                          {formatAccountDateTime(item.updatedAt)}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
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
                    Snapshot of the current order draft.
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
                <div className="flex items-center justify-between rounded-[1.25rem] border border-primary/20 bg-primary/10 px-4 py-3">
                  <span className="text-sm font-medium text-foreground">
                    Cart total
                  </span>
                  <span className="text-lg font-semibold text-foreground">
                    {formatCurrency(cart.totalAmount)}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <Sparkles className="size-4" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Next Move
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Keep browsing or prepare delivery details.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button asChild className="rounded-full">
                  <Link href="/">
                    Continue Shopping
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/addresses">Review Addresses</Link>
                </Button>
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
