import Image from "next/image";
import Link from "next/link";
import { Package, ArrowUpRight } from "lucide-react";

import { formatCurrency } from "@/components/account/account.utils";
import { Badge } from "@/components/ui/badge";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import type { ProductSummary } from "@/features/product/types/product.type";
import { buildProductPath } from "@/features/product/utils/product-path";

interface ProductCardProps {
  product: ProductSummary;
}

export function ProductCard({ product }: ProductCardProps) {
  const isOutOfStock = product.stock <= 0;
  const hasDescription = product.description.trim().length > 0;

  return (
    <Link
      href={buildProductPath(product.slug)}
      className="group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card shadow-sm transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:shadow-primary/8 hover:border-primary/20"
    >
      {/* Hover glow */}
      <div className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: "linear-gradient(135deg, rgba(224,90,69,0.08), transparent 60%)",
        }}
      />

      {/* Image area */}
      <div className="relative aspect-4/3 overflow-hidden bg-linear-to-br from-muted/80 to-muted/40">
        {product.imageUrl ? (
          <Image
            loader={cloudinaryLoader}
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className="object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center transition-transform duration-700 group-hover:scale-110">
            <Package className="size-12 text-muted-foreground/25" />
          </div>
        )}

        {/* Badges overlay */}
        <div className="absolute top-3 left-3 flex flex-col gap-2">
          {product.categoryName ? (
            <Badge
              variant="secondary"
              className="rounded-full bg-background/80 px-3 py-1 text-[11px] font-medium shadow-sm backdrop-blur-md"
            >
              {product.categoryName}
            </Badge>
          ) : null}
        </div>

        {isOutOfStock ? (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70 backdrop-blur-sm">
            <Badge
              variant="destructive"
              className="rounded-full px-4 py-1.5 text-sm font-semibold shadow-lg"
            >
              Out of Stock
            </Badge>
          </div>
        ) : null}

        {/* Hover arrow */}
        <div className="absolute right-3 bottom-3 flex size-8 items-center justify-center rounded-full bg-primary text-primary-foreground opacity-0 shadow-lg transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0 translate-x-2">
          <ArrowUpRight className="size-4" />
        </div>

        {/* Shimmer on hover */}
        <div className="pointer-events-none absolute inset-0 -translate-x-full bg-linear-to-r from-transparent via-white/6 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
      </div>

      {/* Details */}
      <div className="flex flex-1 flex-col gap-3 p-4 sm:p-5">
        <div className="flex-1 space-y-2">
          <h3 className="line-clamp-2 text-sm font-semibold tracking-tight text-foreground transition-colors group-hover:text-primary sm:text-base">
            {product.name}
          </h3>
          {hasDescription ? (
            <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
              {product.description}
            </p>
          ) : null}
          {!isOutOfStock ? (
            <p className="text-xs text-muted-foreground">
              {product.stock} in stock
            </p>
          ) : null}
        </div>

        <div className="flex items-end justify-between gap-3">
          <p className="text-lg font-bold tracking-tight text-foreground">
            {formatCurrency(product.currentPrice)}
          </p>
        </div>
      </div>
    </Link>
  );
}
