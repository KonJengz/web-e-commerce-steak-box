"use client";

import Image from "next/image";
import { Package } from "lucide-react";
import { useState } from "react";

import cloudinaryLoader from "@/lib/cloudinary-loader";
import type { ProductImage } from "@/features/product/types/product.type";
import { cn } from "@/lib/utils";

interface ProductGalleryProps {
  images: ProductImage[];
  productName: string;
  primaryImageUrl?: string | null;
}

export function ProductGallery({
  images,
  productName,
  primaryImageUrl,
}: ProductGalleryProps) {
  const allImages =
    images.length > 0
      ? images
      : primaryImageUrl
        ? [
            {
              createdAt: "",
              id: "primary",
              imagePublicId: "",
              imageUrl: primaryImageUrl,
              isPrimary: true,
              productId: "",
              sortOrder: 0,
            },
          ]
        : [];

  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const selectedImage = allImages[selectedIndex];

  if (allImages.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-[2rem] border border-border/70 bg-linear-to-br from-muted/60 to-muted/30">
        <Package className="size-20 text-muted-foreground/25" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Main Image */}
      <div className="relative aspect-square overflow-hidden rounded-[2rem] border border-border/70 bg-linear-to-br from-muted/60 to-muted/30">
        {selectedImage ? (
          <Image
            loader={cloudinaryLoader}
            src={selectedImage.imageUrl}
            alt={productName}
            fill
            sizes="(max-width: 768px) 100vw, 50vw"
            className="object-cover transition-transform duration-500 hover:scale-105"
            priority
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Package className="size-20 text-muted-foreground/25" />
          </div>
        )}
      </div>

      {/* Thumbnail Strip */}
      {allImages.length > 1 ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {allImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-xl border-2 transition-all duration-200 sm:size-20",
                index === selectedIndex
                  ? "border-primary ring-2 ring-primary/30"
                  : "border-border/50 hover:border-primary/40",
              )}
              aria-label={`View image ${index + 1}`}
              aria-pressed={index === selectedIndex}
            >
              <Image
                loader={cloudinaryLoader}
                src={image.imageUrl}
                alt={`${productName} - Image ${index + 1}`}
                fill
                sizes="80px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
