import MainContainer from "@/components/layout/header/main-container";
import { Skeleton } from "@/components/ui/skeleton";

const productCardKeys = Array.from({ length: 8 }, (_, index) => index);
const accountNavKeys = Array.from({ length: 5 }, (_, index) => index);
const detailStatKeys = Array.from({ length: 3 }, (_, index) => index);
const summaryCardKeys = Array.from({ length: 3 }, (_, index) => index);
const adminListKeys = Array.from({ length: 4 }, (_, index) => index);
const authHighlightKeys = Array.from({ length: 3 }, (_, index) => index);
const orderListKeys = Array.from({ length: 3 }, (_, index) => index);
const addressCardKeys = Array.from({ length: 4 }, (_, index) => index);

function HeroSkeleton() {
  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/6 bg-linear-to-br from-[#1a0f0d] via-[#0f0908] to-[#0a0706] px-6 py-8 text-white shadow-2xl sm:px-10 sm:py-10">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float absolute -top-16 -right-16 size-56 rounded-full bg-primary/15 blur-[90px]" />
        <div className="animate-float-delayed absolute -bottom-24 -left-16 size-64 rounded-full bg-[#f6c168]/8 blur-[100px]" />
      </div>

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
        <div className="space-y-5">
          <Skeleton className="h-8 w-36 rounded-full bg-white/12" />
          <div className="space-y-3">
            <Skeleton className="h-10 w-full max-w-xl rounded-full bg-white/12" />
            <Skeleton className="h-10 w-4/5 max-w-lg rounded-full bg-white/12" />
            <Skeleton className="h-5 w-full max-w-2xl rounded-full bg-white/10" />
            <Skeleton className="h-5 w-5/6 max-w-xl rounded-full bg-white/10" />
          </div>
          <div className="flex flex-wrap gap-3 pt-2">
            <Skeleton className="h-8 w-32 rounded-full bg-white/12" />
            <Skeleton className="h-8 w-40 rounded-full bg-white/10" />
          </div>
        </div>

        <div className="mx-auto aspect-square w-full max-w-[220px]">
          <div className="flex h-full w-full items-center justify-center rounded-full border border-white/10 bg-white/5">
            <Skeleton className="size-36 rounded-full bg-white/10" />
          </div>
        </div>
      </div>
    </section>
  );
}

function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm">
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <div className="space-y-3 p-4 sm:p-5">
        <Skeleton className="h-4 w-20 rounded-full" />
        <Skeleton className="h-5 w-5/6" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-6 w-28" />
      </div>
    </div>
  );
}

export function MainHeaderSkeleton() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 shadow-sm backdrop-blur-xl">
      <MainContainer>
        <div className="flex items-center justify-between gap-8 xl:gap-16">
          <Skeleton className="h-10 w-40 rounded-full" />
          <Skeleton className="hidden h-11 flex-1 rounded-full md:block" />
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="size-10 rounded-full" />
            <Skeleton className="hidden h-10 w-28 rounded-full sm:block" />
          </div>
        </div>
      </MainContainer>
    </header>
  );
}

export function CatalogPageSkeleton() {
  return (
    <div className="space-y-8">
      <div className="my-4 sm:hidden">
        <Skeleton className="h-11 w-full rounded-full" />
      </div>

      <HeroSkeleton />

      <CatalogContentSkeleton />
    </div>
  );
}

export function CatalogContentSkeleton() {
  return (
    <>

      <section className="space-y-4">
        <div className="flex items-center gap-3">
          <Skeleton className="size-3 rounded-full" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="flex flex-wrap gap-2.5">
          {Array.from({ length: 6 }, (_, index) => (
            <Skeleton key={index} className="h-11 w-28 rounded-2xl" />
          ))}
        </div>
      </section>

      <div className="grid gap-8 xl:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden xl:block">
          <div className="sticky top-24 space-y-4">
            <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
              <Skeleton className="mb-4 h-4 w-28" />
              <div className="space-y-3">
                {Array.from({ length: 7 }, (_, index) => (
                  <Skeleton key={index} className="h-10 w-full rounded-xl" />
                ))}
              </div>
            </div>
          </div>
        </aside>

        <section className="space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <Skeleton className="h-5 w-52" />
            <Skeleton className="h-10 w-44 rounded-full" />
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {productCardKeys.map((key) => (
              <ProductCardSkeleton key={key} />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 pt-6">
            <Skeleton className="h-5 w-28" />
            <div className="flex gap-2">
              <Skeleton className="h-10 w-24 rounded-full" />
              <Skeleton className="h-10 w-24 rounded-full" />
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

export function ProductDetailPageSkeleton() {
  return (
    <div className="space-y-8 py-2 sm:py-6">
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-16" />
        <Skeleton className="size-3 rounded-full" />
        <Skeleton className="h-4 w-24" />
        <Skeleton className="size-3 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        <div className="space-y-4">
          <Skeleton className="aspect-square w-full rounded-[2rem]" />
          <div className="grid grid-cols-4 gap-3">
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton key={index} className="aspect-square rounded-2xl" />
            ))}
          </div>
        </div>

        <div className="space-y-7">
          <div className="space-y-3">
            <Skeleton className="h-7 w-28 rounded-full" />
            <Skeleton className="h-11 w-4/5" />
            <Skeleton className="h-11 w-2/3" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-10 w-36" />
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
          </div>

          <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />

          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-2/3" />
          </div>

          <div className="space-y-3">
            <Skeleton className="h-12 w-full rounded-full" />
            <Skeleton className="h-4 w-40" />
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {detailStatKeys.map((key) => (
              <div
                key={key}
                className="rounded-2xl border border-border/50 bg-card px-4 py-3"
              >
                <Skeleton className="mb-3 size-8 rounded-xl" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-3 w-20" />
              </div>
            ))}
          </div>

          <div className="rounded-2xl border border-border/40 bg-muted/30 p-4">
            <Skeleton className="h-4 w-44" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function ProductGallerySectionSkeleton() {
  return (
    <div className="space-y-4">
      <Skeleton className="aspect-square w-full rounded-[2rem]" />
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }, (_, index) => (
          <Skeleton key={index} className="aspect-square rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function CartPageSkeleton() {
  return (
    <div className="space-y-6 py-6 sm:py-10">
      <HeroSkeleton />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-4 border-b border-border/60 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-7 w-72" />
              <Skeleton className="h-4 w-80" />
            </div>
            <div className="flex flex-wrap gap-3">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-28 rounded-full" />
              <Skeleton className="h-9 w-28 rounded-full" />
            </div>
          </div>

          <div className="divide-y divide-border/60">
            {Array.from({ length: 3 }, (_, index) => (
              <article
                key={index}
                className="grid gap-5 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center"
              >
                <div className="flex min-w-0 gap-4">
                  <Skeleton className="size-18 rounded-[1.5rem]" />
                  <div className="min-w-0 flex-1 space-y-3">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        <Skeleton className="h-6 w-44" />
                        <Skeleton className="h-7 w-18 rounded-full" />
                        <Skeleton className="h-7 w-24 rounded-full" />
                      </div>
                      <Skeleton className="h-4 w-36" />
                    </div>
                    <Skeleton className="h-16 w-full rounded-[1.25rem]" />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-[auto_auto] lg:min-w-[17rem] lg:justify-end">
                  <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="mt-3 h-11 w-32 rounded-full" />
                  </div>
                  <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="mt-3 h-6 w-24" />
                    <Skeleton className="mt-2 h-4 w-20" />
                  </div>
                </div>

                <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-9 w-24 rounded-full" />
                </div>
              </article>
            ))}
          </div>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-24">
          <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
            <div className="mb-5 flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-4 w-44" />
              </div>
            </div>

            <div className="space-y-3">
              {Array.from({ length: 4 }, (_, index) => (
                <Skeleton key={index} className="h-14 w-full rounded-[1.25rem]" />
              ))}
            </div>

            <div className="mt-5 flex flex-col gap-3">
              <Skeleton className="h-11 w-full rounded-full" />
              <Skeleton className="h-11 w-full rounded-full" />
            </div>
          </section>

          <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
            <div className="mb-4 flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-36" />
                <Skeleton className="h-4 w-44" />
              </div>
            </div>

            <div className="space-y-3">
              <Skeleton className="h-18 w-full rounded-[1.25rem]" />
              <Skeleton className="h-18 w-full rounded-[1.25rem]" />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export function CheckoutPageSkeleton() {
  return (
    <div className="space-y-6 py-6 sm:py-10">
      <HeroSkeleton />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="grid gap-4">
          {Array.from({ length: 2 }, (_, index) => (
            <article
              key={index}
              className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]"
            >
              <div className="mb-4 flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-36" />
                  <Skeleton className="h-4 w-56" />
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {summaryCardKeys.map((key) => (
                  <div
                    key={key}
                    className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3"
                  >
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="mt-2 h-6 w-20" />
                  </div>
                ))}
              </div>
            </article>
          ))}
        </section>

        <aside className="space-y-4 xl:sticky xl:top-24">
          <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
            <div className="mb-4 flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-28" />
                <Skeleton className="h-4 w-44" />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Skeleton className="h-11 w-full rounded-full" />
              <Skeleton className="h-11 w-full rounded-full" />
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}

export function CatalogResultsSkeleton() {
  return (
    <div className="grid gap-8 xl:grid-cols-[240px_minmax(0,1fr)]">
      <aside className="hidden xl:block">
        <div className="sticky top-24 space-y-4">
          <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
            <Skeleton className="mb-4 h-4 w-28" />
            <div className="space-y-3">
              {Array.from({ length: 7 }, (_, index) => (
                <Skeleton key={index} className="h-10 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </aside>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Skeleton className="h-5 w-52" />
          <Skeleton className="h-10 w-44 rounded-full" />
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {productCardKeys.map((key) => (
            <ProductCardSkeleton key={key} />
          ))}
        </div>

        <div className="flex items-center justify-between gap-3 pt-6">
          <Skeleton className="h-5 w-28" />
          <div className="flex gap-2">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>
      </section>
    </div>
  );
}

export function CatalogResultsPanelSkeleton() {
  return (
    <div className="space-y-6">
      <Skeleton className="h-5 w-52" />

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {productCardKeys.map((key) => (
          <ProductCardSkeleton key={key} />
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 pt-6">
        <Skeleton className="h-5 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function AccountShellSkeleton() {
  return (
    <div className="py-6 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[280px_minmax(0,1fr)] lg:items-start">
        <aside className="space-y-4 lg:sticky lg:top-24">
          <div className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/90 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.08)]">
            <div className="space-y-4">
              <Skeleton className="size-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-36" />
                <Skeleton className="h-4 w-44" />
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-card/90 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
            <Skeleton className="mb-4 h-4 w-24" />
            <div className="space-y-3">
              {accountNavKeys.map((key) => (
                <Skeleton key={key} className="h-11 w-full rounded-xl" />
              ))}
            </div>
          </div>
        </aside>

        <div className="min-w-0">
          <AccountPageSkeleton />
        </div>
      </div>
    </div>
  );
}

export function AccountPageSkeleton() {
  return (
    <div className="space-y-6">
      <HeroSkeleton />

      <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)] sm:p-8">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] xl:items-start">
          <div className="space-y-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="rounded-[1.5rem] border border-border/70 bg-background/60 px-4 py-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="mt-2 h-5 w-52" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {Array.from({ length: 2 }, (_, index) => (
              <div
                key={index}
                className="rounded-[1.5rem] border border-border/70 bg-background/65 p-4"
              >
                <Skeleton className="mb-3 size-10 rounded-full" />
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-2 h-5 w-36" />
                <Skeleton className="mt-2 h-4 w-28" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="rounded-[1.75rem] border border-border/70 bg-background/70 p-5"
            >
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-4 h-11 w-full rounded-xl" />
              <Skeleton className="mt-3 h-11 w-full rounded-xl" />
              <Skeleton className="mt-4 h-10 w-32 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function ProfilePageSkeleton() {
  return (
    <div className="space-y-6">
      <HeroSkeleton />

      <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)] sm:p-8">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] xl:items-start">
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-56" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <div className="rounded-[1.5rem] border border-border/70 bg-background/60 px-4 py-4">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="mt-2 h-5 w-52" />
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            {Array.from({ length: 2 }, (_, index) => (
              <div
                key={index}
                className="rounded-[1.5rem] border border-border/70 bg-background/65 p-4"
              >
                <Skeleton className="mb-3 size-10 rounded-full" />
                <Skeleton className="h-4 w-28" />
                <Skeleton className="mt-2 h-5 w-40" />
                <Skeleton className="mt-2 h-4 w-32" />
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="rounded-[1.75rem] border border-border/70 bg-background/70 p-5"
            >
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-4 h-11 w-full rounded-xl" />
              <Skeleton className="mt-3 h-11 w-full rounded-xl" />
              <Skeleton className="mt-4 h-10 w-32 rounded-full" />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

export function AddressesPageSkeleton() {
  return (
    <div className="space-y-6">
      <HeroSkeleton />

      <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)] sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-4 w-full max-w-2xl" />
          </div>
          <Skeleton className="size-12 rounded-full" />
        </div>

        <div className="mt-8 grid gap-5 xl:grid-cols-2">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-32 w-full rounded-2xl xl:col-span-2" />
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {addressCardKeys.map((key) => (
          <article
            key={key}
            className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-2">
                <Skeleton className="h-6 w-40" />
                <Skeleton className="h-4 w-52" />
              </div>
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>

            <div className="mt-5 space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

export function OrdersPageSkeleton() {
  return (
    <div className="space-y-6">
      <HeroSkeleton />

      <div className="grid gap-4">
        {orderListKeys.map((key) => (
          <article
            key={key}
            className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]"
          >
            <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Skeleton className="h-6 w-36" />
                  <Skeleton className="h-7 w-20 rounded-full" />
                </div>
                <Skeleton className="h-4 w-40" />
              </div>

              <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                {summaryCardKeys.map((summaryKey) => (
                  <div
                    key={summaryKey}
                    className="rounded-[1.25rem] border border-border/60 bg-background/60 px-4 py-3"
                  >
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="mt-2 h-5 w-24" />
                  </div>
                ))}
              </div>
            </div>
          </article>
        ))}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-40" />
        <div className="flex gap-3">
          <Skeleton className="h-10 w-28 rounded-full" />
          <Skeleton className="h-10 w-24 rounded-full" />
        </div>
      </div>
    </div>
  );
}

export function SecurityPageSkeleton() {
  return (
    <div className="space-y-6">
      <HeroSkeleton />

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {Array.from({ length: 2 }, (_, index) => (
          <section
            key={index}
            className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)] sm:p-8"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-full max-w-md" />
              </div>
              <Skeleton className="size-12 rounded-full" />
            </div>

            <div className="mt-8 space-y-4">
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-11 w-full rounded-xl" />
              <Skeleton className="h-10 w-36 rounded-full" />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

export function AuthPageSkeleton() {
  return (
    <div className="py-6 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-border/70 bg-[linear-gradient(145deg,#2d1f1f_0%,#1a1617_45%,#0f0d0e_100%)] p-6 text-primary-foreground shadow-[0_40px_140px_rgba(0,0,0,0.6)] sm:p-10 lg:p-12">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute top-[-10%] right-[-10%] size-[50%] rounded-full bg-primary/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] size-[50%] rounded-full bg-[#c9ab79]/10 blur-[100px]" />
          </div>

          <div className="relative flex h-full flex-col justify-between gap-12">
            <div className="space-y-8">
              <Skeleton className="h-9 w-40 rounded-full bg-white/10" />
              <Skeleton className="h-16 w-40 bg-white/10" />
              <div className="space-y-4">
                <Skeleton className="h-12 w-full max-w-xl bg-white/12" />
                <Skeleton className="h-12 w-4/5 max-w-lg bg-white/12" />
                <Skeleton className="h-5 w-full max-w-lg bg-white/10" />
                <Skeleton className="h-5 w-5/6 max-w-md bg-white/10" />
              </div>
            </div>

            <div className="grid gap-4">
              {authHighlightKeys.map((key) => (
                <div
                  key={key}
                  className="rounded-[2rem] border border-white/8 bg-white/4 p-5"
                >
                  <div className="flex items-center gap-5">
                    <Skeleton className="size-12 rounded-[1.25rem] bg-white/10" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-5 w-40 bg-white/12" />
                      <Skeleton className="h-4 w-full bg-white/10" />
                      <Skeleton className="h-4 w-4/5 bg-white/10" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-8">
              <Skeleton className="h-4 w-32 bg-white/10" />
              <Skeleton className="h-5 w-28 bg-white/12" />
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)] sm:p-8">
          <div className="space-y-4">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-full max-w-md" />
          </div>

          <div className="mt-8 space-y-4">
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-11 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        </section>
      </div>
    </div>
  );
}

export function AdminShellSkeleton() {
  return (
    <div className="min-h-full">
      <header className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <MainContainer>
          <div className="flex items-center justify-between gap-4 py-3">
            <div className="flex items-center gap-4">
              <Skeleton className="h-10 w-36 rounded-full" />
              <Skeleton className="hidden h-7 w-24 rounded-full sm:block" />
            </div>

            <div className="flex items-center gap-3">
              <Skeleton className="hidden h-9 w-28 rounded-full sm:block" />
              <Skeleton className="h-10 w-36 rounded-full" />
              <Skeleton className="size-9 rounded-full" />
            </div>
          </div>
        </MainContainer>
      </header>

      <MainContainer>
        <div className="py-6 sm:py-8">
          <div className="grid gap-6 lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start">
            <aside className="hidden space-y-4 lg:block">
              <div className="rounded-2xl border border-border/50 bg-card p-4 shadow-sm">
                <Skeleton className="mb-4 h-4 w-28" />
                <div className="space-y-3">
                  {accountNavKeys.map((key) => (
                    <Skeleton key={key} className="h-10 w-full rounded-xl" />
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-border/40 bg-card p-4">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="mt-3 h-5 w-44" />
                <Skeleton className="mt-2 h-4 w-20" />
              </div>
            </aside>

            <div className="min-w-0">
              <AdminPageSkeleton />
            </div>
          </div>
        </div>
      </MainContainer>
    </div>
  );
}

export function AdminPageSkeleton() {
  return (
    <div className="space-y-6">
      <HeroSkeleton />

      <section className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_220px]">
          <div className="space-y-3">
            <Skeleton className="h-5 w-28" />
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-xl" />
          </div>
          <div className="space-y-3">
            <Skeleton className="h-10 w-full rounded-xl" />
            <Skeleton className="h-10 w-full rounded-full" />
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-8 w-56" />
          </div>

          <div className="flex flex-wrap gap-3 rounded-xl border border-border/40 bg-muted/30 p-3">
            <Skeleton className="h-10 w-56 rounded-xl" />
            <Skeleton className="h-10 w-44 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-full" />
          </div>
        </div>

        <div className="mt-6 space-y-3">
          {adminListKeys.map((key) => (
            <article
              key={key}
              className="rounded-xl border border-border/40 bg-muted/20 p-5"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="space-y-3">
                  <Skeleton className="h-6 w-48" />
                  <div className="grid gap-2 sm:grid-cols-3">
                    {summaryCardKeys.map((summaryKey) => (
                      <div
                        key={summaryKey}
                        className="rounded-lg border border-border/30 bg-card px-3 py-2"
                      >
                        <Skeleton className="h-4 w-16" />
                        <Skeleton className="mt-2 h-5 w-20" />
                      </div>
                    ))}
                  </div>
                </div>

                <Skeleton className="h-10 w-24 rounded-full" />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export function AdminDashboardPageSkeleton() {
  return (
    <div className="space-y-6">
      <HeroSkeleton />
      <AdminDashboardStatsSkeleton />
      <AdminRecentInventorySkeleton />
    </div>
  );
}

export function AdminProductCreateSectionSkeleton() {
  return (
    <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)] sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-8 w-56" />
          <Skeleton className="h-4 w-full max-w-2xl" />
        </div>
        <Skeleton className="size-12 rounded-full" />
      </div>

      <div className="mt-8 space-y-5">
        <div className="grid gap-5 xl:grid-cols-2">
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-36 w-full rounded-xl xl:col-span-2" />
          <Skeleton className="h-11 w-full rounded-xl" />
          <Skeleton className="h-11 w-full rounded-xl" />
        </div>
        <Skeleton className="h-10 w-36 rounded-full" />
      </div>
    </section>
  );
}

export function AdminProductDirectorySkeleton() {
  return (
    <section className="rounded-2xl border border-border/50 bg-card p-6 shadow-sm">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-56" />
        </div>

        <div className="flex flex-wrap gap-3 rounded-xl border border-border/40 bg-muted/30 p-3">
          <Skeleton className="h-10 w-56 rounded-xl" />
          <Skeleton className="h-10 w-44 rounded-xl" />
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-20 rounded-full" />
        </div>
      </div>

      <div className="mt-6 space-y-3">
        {adminListKeys.map((key) => (
          <article
            key={key}
            className="rounded-xl border border-border/40 bg-muted/20 p-5"
          >
            <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
              <div className="space-y-3">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-24" />
                <div className="grid gap-2 sm:grid-cols-3">
                  {summaryCardKeys.map((summaryKey) => (
                    <div
                      key={summaryKey}
                      className="rounded-lg border border-border/30 bg-card px-3 py-2"
                    >
                      <Skeleton className="h-4 w-16" />
                      <Skeleton className="mt-2 h-5 w-20" />
                    </div>
                  ))}
                </div>
              </div>

              <Skeleton className="h-10 w-24 rounded-full" />
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Skeleton className="h-4 w-28" />
        <div className="flex gap-2">
          <Skeleton className="h-10 w-24 rounded-full" />
          <Skeleton className="h-10 w-20 rounded-full" />
        </div>
      </div>
    </section>
  );
}

export function AdminDashboardStatsSkeleton() {
  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.55fr)_360px]">
      <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
        <div className="border-b border-border/60 px-6 py-6 sm:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div className="space-y-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-8 w-full max-w-md" />
              <Skeleton className="h-4 w-full max-w-2xl" />
            </div>
            <Skeleton className="h-8 w-48 rounded-full" />
          </div>
        </div>

        <div className="px-6 py-6 sm:px-8">
          <div className="grid gap-px overflow-hidden rounded-[1.6rem] border border-border/60 bg-border/60 md:grid-cols-2 2xl:grid-cols-4">
            {Array.from({ length: 4 }, (_, index) => (
              <div key={index} className="bg-background/98 px-5 py-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-9 w-20" />
                  </div>
                  <Skeleton className="size-11 rounded-2xl" />
                </div>
                <Skeleton className="mt-4 h-4 w-full" />
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <section className="rounded-[1.6rem] border border-border/60 bg-muted/15 p-5">
              <div className="flex items-center justify-between gap-4">
                <div className="space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-9 w-20" />
                </div>
                <Skeleton className="h-7 w-32 rounded-full" />
              </div>
              <Skeleton className="mt-5 h-3 w-full rounded-full" />
              <Skeleton className="mt-4 h-4 w-5/6" />
            </section>

            <section className="rounded-[1.6rem] border border-border/60 bg-background/96 p-5">
              <div className="space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-40" />
              </div>

              <div className="mt-5 space-y-3">
                {Array.from({ length: 3 }, (_, index) => (
                  <div
                    key={index}
                    className="rounded-[1.25rem] border border-border/60 bg-background/96 px-4 py-3.5"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="w-full space-y-2">
                        <Skeleton className="h-4 w-36" />
                        <Skeleton className="h-3 w-full" />
                      </div>
                      <Skeleton className="h-4 w-10" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>

      <aside className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
        <div className="space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-52" />
          <Skeleton className="h-4 w-full" />
        </div>

        <div className="mt-6 space-y-3">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={index}
              className="rounded-[1.4rem] border border-border/60 bg-muted/15 px-4 py-4"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="w-full space-y-2">
                  <Skeleton className="h-4 w-36" />
                  <Skeleton className="h-3 w-full" />
                </div>
                <Skeleton className="size-4 rounded-full" />
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-[1.5rem] border border-border/60 bg-muted/15 p-4">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="mt-3 h-6 w-40" />
          <Skeleton className="mt-2 h-4 w-full" />
        </div>
      </aside>
    </section>
  );
}

export function AdminRecentInventorySkeleton() {
  return (
    <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_340px]">
      <div className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
        <div className="flex flex-col gap-4 border-b border-border/60 px-6 py-6 lg:flex-row lg:items-end lg:justify-between sm:px-8">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-8 w-full max-w-md" />
            <Skeleton className="h-4 w-full max-w-2xl" />
          </div>
          <Skeleton className="h-9 w-44 rounded-full" />
        </div>

        <div className="divide-y divide-border/60">
          {Array.from({ length: 4 }, (_, index) => (
            <article
              key={index}
              className="grid gap-5 px-6 py-5 sm:px-8 lg:grid-cols-[84px_minmax(0,1fr)_auto] lg:items-center"
            >
              <Skeleton className="aspect-square rounded-[1.6rem]" />

              <div className="space-y-3">
                <div className="flex flex-col gap-3 xl:flex-row xl:items-start xl:justify-between">
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-36" />
                  </div>

                  <div className="space-y-2 xl:text-right">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-4 w-36" />
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Skeleton className="h-7 w-20 rounded-full" />
                  <Skeleton className="h-7 w-24 rounded-full" />
                  <Skeleton className="h-7 w-18 rounded-full" />
                </div>
              </div>

              <Skeleton className="h-8 w-20 rounded-full" />
            </article>
          ))}
        </div>
      </div>

      <aside className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
        <div className="border-b border-border/60 px-6 py-5">
          <div className="space-y-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-56" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>

        <div className="p-6">
          <div className="space-y-3">
            {Array.from({ length: 4 }, (_, index) => (
              <div
                key={index}
                className="rounded-[1.35rem] border border-border/60 bg-muted/15 px-4 py-3.5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="w-full space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-full" />
                  </div>
                  <Skeleton className="h-6 w-18 rounded-full" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-[1.5rem] border border-border/60 bg-background/96 p-4">
            <Skeleton className="h-3 w-24" />
            <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
              <Skeleton className="h-18 rounded-[1.2rem]" />
              <Skeleton className="h-18 rounded-[1.2rem]" />
            </div>
          </div>
        </div>
      </aside>
    </section>
  );
}
