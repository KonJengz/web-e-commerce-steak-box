import type { Metadata } from "next";
import Link from "next/link";
import { MapPinHouse } from "lucide-react";

import { BASE_PRIVATE_METADATA } from "@/lib/metadata";

import { AccountPageHero } from "@/components/account/account-page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AddressCard } from "@/features/address/components/address-card";
import { AddressCreateForm } from "@/features/address/components/address-create-form";
import { addressService } from "@/features/address/services/address.service";
import { executeProtectedRequestOrRedirect } from "@/features/auth/services/current-user.service";

export const metadata: Metadata = {
  ...BASE_PRIVATE_METADATA,
  title: "My Addresses",
};

export default async function AddressesPage() {
  const addresses = await executeProtectedRequestOrRedirect(
    async (accessToken) => (await addressService.getAll(accessToken)).data,
    "/addresses",
  );
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
        <Badge
          variant="outline"
          className="rounded-full border-white/20 px-3 py-1 text-white/80"
        >
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
            <AddressCard key={address.id} address={address} />
          ))}
        </div>
      )}
    </div>
  );
}
