"use client";

import { useRouter } from "next/navigation";
import { Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useState, useTransition } from "react";

import { addToCartAction } from "@/features/cart/actions/add-to-cart.action";
import { Button } from "@/components/ui/button";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";

interface AddToCartButtonProps {
  maxStock: number;
  productId: string;
}

export function AddToCartButton({ maxStock, productId }: AddToCartButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState<number>(1);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const isOutOfStock = maxStock <= 0;

  const handleDecrease = (): void => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const handleIncrease = (): void => {
    setQuantity((current) => Math.min(maxStock, current + 1));
  };

  const handleAddToCart = (): void => {
    setMessage(null);
    setIsSuccess(false);

    startTransition(async () => {
      const result = await addToCartAction({
        productId,
        quantity,
      });

      if (result.requiresLogin) {
        router.push(buildLoginRedirectPath(`/products/${productId}`));
        return;
      }

      setMessage(result.message ?? null);
      setIsSuccess(result.success);

      if (result.success) {
        setQuantity(1);
      }
    });
  };

  if (isOutOfStock) {
    return (
      <Button
        size="lg"
        className="h-14 w-full rounded-full text-base font-semibold"
        disabled
      >
        Out of Stock
      </Button>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quantity Selector */}
      <div className="flex items-center gap-4">
        <span className="text-sm font-medium text-muted-foreground">Qty</span>
        <div className="flex items-center gap-1 rounded-full border border-border/70 bg-background/60 p-1">
          <button
            type="button"
            onClick={handleDecrease}
            disabled={quantity <= 1 || isPending}
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            aria-label="Decrease quantity"
          >
            <Minus className="size-4" />
          </button>
          <span className="min-w-[3ch] text-center text-sm font-semibold tabular-nums text-foreground">
            {quantity}
          </span>
          <button
            type="button"
            onClick={handleIncrease}
            disabled={quantity >= maxStock || isPending}
            className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
            aria-label="Increase quantity"
          >
            <Plus className="size-4" />
          </button>
        </div>
        <span className="text-xs text-muted-foreground">
          {maxStock} available
        </span>
      </div>

      {/* Add to Cart Button */}
      <Button
        size="lg"
        className="h-14 w-full rounded-full text-base font-semibold shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 active:scale-[0.98]"
        disabled={isPending}
        onClick={handleAddToCart}
      >
        {isPending ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            Adding...
          </>
        ) : (
          <>
            <ShoppingCart className="size-5" />
            Add to Cart
          </>
        )}
      </Button>

      {/* Feedback message */}
      {message ? (
        <div
          className={`rounded-2xl border px-4 py-3 text-center text-sm font-medium transition-all ${
            isSuccess
              ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border-destructive/25 bg-destructive/10 text-destructive"
          }`}
        >
          {message}
        </div>
      ) : null}
    </div>
  );
}
