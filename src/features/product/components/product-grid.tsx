import Link from "next/link";
import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ProductCard } from "@/features/product/components/product-card";
import type { ProductSummary } from "@/features/product/types/product.type";

interface ProductGridProps {
  emptyMessage?: string;
  products: ProductSummary[];
}

export function ProductGrid({
  emptyMessage = "No products found.",
  products,
}: ProductGridProps) {
  if (products.length === 0) {
    return (
      <section className="rounded-[2rem] border border-dashed border-border/70 bg-card/80 p-8 text-center shadow-[0_22px_70px_rgba(0,0,0,0.05)]">
        <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <ShoppingBag className="size-6" />
        </div>
        <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
          {emptyMessage}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
          Try adjusting your search or filter options to find what you&apos;re
          looking for.
        </p>
        <div className="mt-6">
          <Button asChild className="rounded-full">
            <Link href="/">Browse All Products</Link>
          </Button>
        </div>
      </section>
    );
  }

  return (
    <div className="stagger-children grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
