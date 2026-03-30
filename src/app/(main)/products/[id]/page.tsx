import type { Metadata } from "next";
import Link from "next/link";
import {
  ArrowLeft,
  Box,
  ChevronRight,
  Info,
  Shield,
  Truck,
  Check,
} from "lucide-react";
import { notFound, permanentRedirect } from "next/navigation";
import { cache, Suspense } from "react";

import {
  formatAccountDateTime,
  formatCurrency,
} from "@/components/account/account.utils";
import { ProductGallerySectionSkeleton } from "@/components/shared/loading-skeletons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildCategoryPath } from "@/features/category/utils/category-path";
import { AddToCartButton } from "@/features/product/components/add-to-cart-button";
import { ProductGallery } from "@/features/product/components/product-gallery";
import { productService } from "@/features/product/services/product.service";
import type { ProductImage } from "@/features/product/types/product.type";
import { buildProductPath } from "@/features/product/utils/product-path";
import { ApiError } from "@/lib/api/error";

interface ProductDetailPageProps {
  params: Promise<{ id: string }>;
}

const getProduct = cache(async (identifier: string) => {
  return (await productService.getByIdentifier(identifier)).data;
});

const getProductImages = cache(async (identifier: string) => {
  return (await productService.getImages(identifier)).data;
});

interface ProductGallerySectionProps {
  imagesPromise: Promise<ProductImage[]>;
  primaryImageUrl?: string | null;
  productName: string;
}

async function ProductGallerySection({
  imagesPromise,
  primaryImageUrl,
  productName,
}: ProductGallerySectionProps) {
  const images = await imagesPromise;

  return (
    <ProductGallery
      images={images}
      productName={productName}
      primaryImageUrl={primaryImageUrl}
    />
  );
}

export async function generateMetadata({
  params,
}: ProductDetailPageProps): Promise<Metadata> {
  const resolvedParams = await params;

  try {
    const product = await getProduct(resolvedParams.id);

    return {
      alternates: {
        canonical: buildProductPath(product.slug),
      },
      title: `${product.name} — Steak Box`,
      description: product.description
        ? product.description.slice(0, 160)
        : `Shop ${product.name} at Steak Box. Premium quality, delivered fresh.`,
    };
  } catch {
    return {
      title: "Product Not Found — Steak Box",
    };
  }
}

export default async function ProductDetailPage({
  params,
}: ProductDetailPageProps) {
  const resolvedParams = await params;
  const requestedIdentifier = resolvedParams.id;
  let product;

  try {
    product = await getProduct(requestedIdentifier);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  if (requestedIdentifier !== product.slug) {
    permanentRedirect(buildProductPath(product.slug));
  }

  const imagesPromise = getProductImages(product.slug);
  const isOutOfStock = product.stock <= 0;

  const trustSignals = [
    { icon: Truck, title: "Fast Delivery", description: "Within 2-3 days" },
    { icon: Shield, title: "Quality Certified", description: "Premium grade" },
    { icon: Box, title: "Cold-Chain", description: "Temperature safe" },
  ];

  return (
    <div className="py-2 sm:py-6">
      {/* Breadcrumb */}
      <nav
        aria-label="Breadcrumb"
        className="animate-fade-in mb-8 flex items-center gap-1.5 text-sm text-muted-foreground"
      >
        <Link href="/" className="transition-colors hover:text-foreground">
          Products
        </Link>
        <ChevronRight className="size-3.5" />
        {product.categoryName && product.categoryId ? (
          <>
            <Link
              href={buildCategoryPath(product.categoryId)}
              className="transition-colors hover:text-foreground"
            >
              {product.categoryName}
            </Link>
            <ChevronRight className="size-3.5" />
          </>
        ) : null}
        <span className="font-medium text-foreground">{product.name}</span>
      </nav>

      {/* Main layout */}
      <div className="grid gap-10 lg:grid-cols-2 lg:gap-14">
        {/* Gallery */}
        <div className="animate-slide-in-left">
          <Suspense fallback={<ProductGallerySectionSkeleton />}>
            <ProductGallerySection
              imagesPromise={imagesPromise}
              productName={product.name}
              primaryImageUrl={product.imageUrl}
            />
          </Suspense>
        </div>

        {/* Product Info */}
        <div className="animate-slide-in-right space-y-7">
          {/* Title & Category */}
          <div className="space-y-3">
            {product.categoryName && product.categoryId ? (
              <Link href={buildCategoryPath(product.categoryId)}>
                <Badge
                  variant="secondary"
                  className="rounded-full px-3 py-1 text-xs font-medium transition-colors hover:bg-secondary/80"
                >
                  {product.categoryName}
                </Badge>
              </Link>
            ) : null}
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
              {product.name}
            </h1>
          </div>

          {/* Price */}
          <div className="space-y-3">
            <p className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {formatCurrency(product.currentPrice)}
            </p>
            <div className="flex items-center gap-3">
              <Badge
                variant={isOutOfStock ? "destructive" : "secondary"}
                className={
                  isOutOfStock
                    ? "rounded-full px-3 py-1"
                    : "rounded-full bg-emerald-500/12 px-3 py-1 text-emerald-700 dark:text-emerald-300"
                }
              >
                {isOutOfStock ? "Out of Stock" : (
                  <><Check className="mr-1 size-3" />{product.stock} in stock</>
                )}
              </Badge>
              {product.isActive ? null : (
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  Inactive
                </Badge>
              )}
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-linear-to-r from-transparent via-border to-transparent" />

          {/* Description */}
          {product.description ? (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-muted-foreground">
                Description
              </h2>
              <p className="whitespace-pre-line text-sm leading-7 text-foreground/80">
                {product.description}
              </p>
            </div>
          ) : null}

          {/* Add to Cart */}
          {product.isActive ? (
            <AddToCartButton
              productId={product.id}
              maxStock={product.stock}
            />
          ) : null}

          {/* Trust signals */}
          <div className="stagger-children grid gap-3 sm:grid-cols-3">
            {trustSignals.map((signal) => {
              const Icon = signal.icon;

              return (
                <div
                  key={signal.title}
                  className="hover-lift flex items-center gap-3 rounded-2xl border border-border/50 bg-card px-4 py-3"
                >
                  <div className="rounded-xl bg-primary/10 p-2">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-foreground">
                      {signal.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      {signal.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Product meta */}
          <div className="rounded-2xl border border-border/40 bg-muted/30 p-4">
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Info className="size-3.5" />
                <span>
                  Product ID:{" "}
                  <span className="font-mono text-foreground/60">
                    {product.id}
                  </span>
                </span>
              </div>
              <p>Listed {formatAccountDateTime(product.createdAt)}</p>
              <p>Last updated {formatAccountDateTime(product.updatedAt)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Back link */}
      <div className="mt-14">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/">
            <ArrowLeft className="size-4" />
            Back to Products
          </Link>
        </Button>
      </div>
    </div>
  );
}
