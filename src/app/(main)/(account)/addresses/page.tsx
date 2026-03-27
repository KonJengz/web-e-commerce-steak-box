import Link from "next/link";
import { MapPinHouse, Navigation, Star } from "lucide-react";
import { redirect } from "next/navigation";

import { AccountPageHero } from "@/components/account/account-page-hero";
import { formatAccountDate } from "@/components/account/account.utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddressCreateForm } from "@/features/address/components/address-create-form";
import { addressService } from "@/features/address/services/address.service";
import { getCurrentAccessToken } from "@/features/auth/services/current-user.service";

export default async function AddressesPage() {
  const accessToken = await getCurrentAccessToken();

  if (!accessToken) {
    redirect("/login");
  }

  const addresses = (await addressService.getAll(accessToken)).data;
  const sortedAddresses = [...addresses].sort((left, right) => {
    if (left.isDefault !== right.isDefault) {
      return Number(right.isDefault) - Number(left.isDefault);
    }

    return right.createdAt.localeCompare(left.createdAt);
  });

  return (
    <div className="space-y-6">
      <AccountPageHero
        badge="Delivery Grid"
        title="Pin every drop-off point with confidence."
        description="Your saved addresses are ready for checkout. Default destinations float to the top so you can move through future orders faster."
        variant="addresses"
      >
        <Badge className="rounded-full px-3 py-1">
          {sortedAddresses.length} saved location
          {sortedAddresses.length === 1 ? "" : "s"}
        </Badge>
        <Badge variant="outline" className="rounded-full border-white/20 px-3 py-1 text-white/80">
          Default first
        </Badge>
      </AccountPageHero>

      <AddressCreateForm hasAddresses={sortedAddresses.length > 0} />

      {sortedAddresses.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-border/70 bg-card/80 p-8 text-center shadow-[0_22px_70px_rgba(0,0,0,0.05)]">
          <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <MapPinHouse className="size-6" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
            No saved addresses yet
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            Add your first delivery destination above and it will be ready for
            checkout right away.
          </p>
          <div className="mt-6">
            <Button asChild className="rounded-full">
              <Link href="/">Browse Products</Link>
            </Button>
          </div>
        </section>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {sortedAddresses.map((address) => (
            <article
              key={address.id}
              className="group overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold tracking-tight text-foreground">
                      {address.recipientName}
                    </h2>
                    {address.isDefault ? (
                      <Badge className="rounded-full px-2.5 py-1">
                        Default
                      </Badge>
                    ) : null}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Saved on {formatAccountDate(address.createdAt)}
                  </p>
                </div>

                <span className="inline-flex size-11 items-center justify-center rounded-full border border-border/70 bg-background/70 text-primary">
                  {address.isDefault ? (
                    <Star className="size-4" />
                  ) : (
                    <Navigation className="size-4" />
                  )}
                </span>
              </div>

              <div className="mt-5 space-y-3 rounded-[1.5rem] border border-border/60 bg-background/60 p-4">
                <p className="text-sm leading-7 text-foreground">
                  {address.addressLine}
                </p>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                  <span>{address.city}</span>
                  <span>{address.postalCode}</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {address.phone ?? "No phone number saved"}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
