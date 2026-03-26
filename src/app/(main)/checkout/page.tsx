import Link from "next/link";
import { ArrowRight, MapPinHouse, ShoppingBag, WalletCards } from "lucide-react";
import { redirect } from "next/navigation";

import { AccountPageHero } from "@/components/account/account-page-hero";
import { formatCurrency } from "@/components/account/account.utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addressService } from "@/features/address/services/address.service";
import { getCurrentAccessToken } from "@/features/auth/services/current-user.service";
import { cartService } from "@/features/cart/services/cart.service";

export default async function CheckoutPage() {
  const accessToken = await getCurrentAccessToken();

  if (!accessToken) {
    redirect("/login?redirectTo=/checkout");
  }

  const [cartResult, addressesResult] = await Promise.all([
    cartService.getCurrent(accessToken),
    addressService.getAll(accessToken),
  ]);

  const cart = cartResult.data;
  const addresses = addressesResult.data;
  const totalUnits = cart.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <div className="space-y-6 py-6 sm:py-10">
      <AccountPageHero
        badge="Checkout Prep"
        title="Confirm the last details before the order moves."
        description="Checkout stays protected behind account auth. Review the current cart, make sure delivery addresses exist, and continue once the final payment step is wired in."
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
                    Current cart state before final submission.
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
            </article>

            <article className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <MapPinHouse className="size-4" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Shipping Readiness
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Make sure a delivery address is ready before final order
                    submission.
                  </p>
                </div>
              </div>

              <div className="rounded-[1.5rem] border border-border/60 bg-background/55 px-4 py-4 text-sm leading-7 text-muted-foreground">
                You currently have{" "}
                <span className="font-semibold text-foreground">
                  {addresses.length}
                </span>{" "}
                saved address{addresses.length === 1 ? "" : "es"} available for
                checkout selection.
              </div>
            </article>
          </section>

          <aside className="space-y-4 xl:sticky xl:top-24">
            <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
              <div className="mb-4 flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                  <WalletCards className="size-4" />
                </span>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Next Step
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Final payment and order submission can land here next.
                  </p>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <Button asChild className="rounded-full">
                  <Link href="/cart">
                    Review Cart
                    <ArrowRight className="size-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" className="rounded-full">
                  <Link href="/addresses">Manage Addresses</Link>
                </Button>
              </div>
            </section>
          </aside>
        </div>
      )}
    </div>
  );
}
