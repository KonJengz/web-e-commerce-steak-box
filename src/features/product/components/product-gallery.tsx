"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Package } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  const [isAutoPaused, setIsAutoPaused] = useState<boolean>(false);
  const touchStartXRef = useRef<number | null>(null);
  const touchDeltaXRef = useRef<number>(0);
  const selectedImage = allImages[selectedIndex] ?? null;
  const hasMultipleImages = allImages.length > 1;
  const canNavigate = hasMultipleImages;

  const goToIndex = (index: number): void => {
    if (allImages.length === 0) {
      return;
    }

    setSelectedIndex((index + allImages.length) % allImages.length);
  };

  const goToNext = (): void => {
    if (!hasMultipleImages) {
      return;
    }

    setSelectedIndex((currentIndex) => (currentIndex + 1) % allImages.length);
  };

  const goToPrevious = (): void => {
    if (!hasMultipleImages) {
      return;
    }

    setSelectedIndex(
      (currentIndex) => (currentIndex - 1 + allImages.length) % allImages.length,
    );
  };

  useEffect(() => {
    if (!hasMultipleImages || isAutoPaused) {
      return;
    }

    const intervalId = window.setInterval(() => {
      setSelectedIndex((currentIndex) => (currentIndex + 1) % allImages.length);
    }, 4800);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [allImages.length, hasMultipleImages, isAutoPaused]);

  const handleTouchStart = (clientX: number): void => {
    touchStartXRef.current = clientX;
    touchDeltaXRef.current = 0;
    setIsAutoPaused(true);
  };

  const handleTouchMove = (clientX: number): void => {
    if (touchStartXRef.current === null) {
      return;
    }

    touchDeltaXRef.current = clientX - touchStartXRef.current;
  };

  const handleTouchEnd = (): void => {
    const swipeDistance = touchDeltaXRef.current;

    touchStartXRef.current = null;
    touchDeltaXRef.current = 0;
    setIsAutoPaused(false);

    if (!hasMultipleImages) {
      return;
    }

    if (swipeDistance <= -45) {
      goToNext();
      return;
    }

    if (swipeDistance >= 45) {
      goToPrevious();
    }
  };

  if (allImages.length === 0) {
    return (
      <div className="flex aspect-square w-full items-center justify-center rounded-[2rem] border border-border/70 bg-linear-to-br from-muted/60 to-muted/30">
        <Package className="size-20 text-muted-foreground/25" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="group relative overflow-hidden rounded-[2rem] border border-border/70 bg-linear-to-br from-muted/60 via-muted/35 to-muted/15 shadow-[0_30px_80px_rgba(0,0,0,0.08)]"
        onMouseEnter={() => setIsAutoPaused(true)}
        onMouseLeave={() => setIsAutoPaused(false)}
        onTouchStart={(event) => handleTouchStart(event.touches[0]?.clientX ?? 0)}
        onTouchMove={(event) => handleTouchMove(event.touches[0]?.clientX ?? 0)}
        onTouchEnd={handleTouchEnd}
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-10 h-28 bg-linear-to-b from-black/18 via-black/6 to-transparent" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-28 bg-linear-to-t from-black/18 via-black/6 to-transparent" />

        <div className="relative aspect-square">
          <div
            className="flex h-full transition-transform duration-700 ease-[cubic-bezier(0.22,1,0.36,1)]"
            style={{ transform: `translate3d(-${selectedIndex * 100}%, 0, 0)` }}
          >
            {allImages.map((image, index) => (
              <div key={image.id} className="relative h-full min-w-full">
                <Image
                  loader={cloudinaryLoader}
                  src={image.imageUrl}
                  alt={`${productName} - Image ${index + 1}`}
                  fill
                  priority={index === 0}
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
            ))}
          </div>

          {!selectedImage ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Package className="size-20 text-muted-foreground/25" />
            </div>
          ) : null}
        </div>

        {hasMultipleImages ? (
          <>
            <div className="absolute top-4 right-4 z-20 rounded-full border border-white/15 bg-black/35 px-3 py-1 text-xs font-medium tracking-[0.18em] text-white/85 uppercase backdrop-blur-md">
              {selectedIndex + 1} / {allImages.length}
            </div>

            <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center">
              <div className="flex items-center gap-2 rounded-full border border-white/12 bg-black/28 px-3 py-2 backdrop-blur-md">
                {allImages.map((image, index) => (
                  <button
                    key={`${image.id}-dot`}
                    type="button"
                    onClick={() => goToIndex(index)}
                    className={cn(
                      "h-2 rounded-full transition-all duration-300",
                      index === selectedIndex
                        ? "w-7 bg-white"
                        : "w-2 bg-white/45 hover:bg-white/70",
                    )}
                    aria-label={`Go to image ${index + 1}`}
                    aria-pressed={index === selectedIndex}
                  />
                ))}
              </div>
            </div>

            <button
              type="button"
              onClick={goToPrevious}
              className="absolute top-1/2 left-4 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/32 text-white/90 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-black/45 md:inline-flex"
              aria-label="Previous image"
              disabled={!canNavigate}
            >
              <ChevronLeft className="size-5" />
            </button>
            <button
              type="button"
              onClick={goToNext}
              className="absolute top-1/2 right-4 z-20 hidden size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-black/32 text-white/90 backdrop-blur-md transition-all duration-300 hover:scale-105 hover:bg-black/45 md:inline-flex"
              aria-label="Next image"
              disabled={!canNavigate}
            >
              <ChevronRight className="size-5" />
            </button>
          </>
        ) : null}
      </div>

      {hasMultipleImages ? (
        <div className="flex gap-3 overflow-x-auto pb-1">
          {allImages.map((image, index) => (
            <button
              key={image.id}
              type="button"
              onClick={() => goToIndex(index)}
              className={cn(
                "relative size-16 shrink-0 overflow-hidden rounded-[1.1rem] border transition-all duration-300 sm:size-20",
                index === selectedIndex
                  ? "border-primary shadow-[0_0_0_3px_rgba(224,90,69,0.18)]"
                  : "border-border/50 opacity-75 hover:border-primary/40 hover:opacity-100",
              )}
              aria-label={`View image ${index + 1}`}
              aria-pressed={index === selectedIndex}
            >
              <Image
                loader={cloudinaryLoader}
                src={image.imageUrl}
                alt={`${productName} - Thumbnail ${index + 1}`}
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
