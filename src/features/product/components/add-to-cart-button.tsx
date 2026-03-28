"use client";

import { useRouter } from "next/navigation";
import { CheckCircle2, Loader2, Minus, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";

import { addToCartAction } from "@/features/cart/actions/add-to-cart.action";
import { Button } from "@/components/ui/button";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";

interface AddToCartButtonProps {
  maxStock: number;
  productId: string;
}

const SUCCESS_NOTICE_DISMISS_MS = 3000;
const SUCCESS_NOTICE_FADE_MS = 350;

export function AddToCartButton({ maxStock, productId }: AddToCartButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [quantity, setQuantity] = useState<number>(1);
  const [message, setMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [isSuccessNoticeVisible, setIsSuccessNoticeVisible] =
    useState<boolean>(false);
  const dismissTimerRef = useRef<number | null>(null);
  const fadeTimerRef = useRef<number | null>(null);
  const isOutOfStock = maxStock <= 0;

  useEffect(() => {
    return () => {
      if (dismissTimerRef.current !== null) {
        window.clearTimeout(dismissTimerRef.current);
      }

      if (fadeTimerRef.current !== null) {
        window.clearTimeout(fadeTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!message || !isSuccess) {
      return;
    }

    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current);
    }

    if (fadeTimerRef.current !== null) {
      window.clearTimeout(fadeTimerRef.current);
    }

    fadeTimerRef.current = window.setTimeout(() => {
      setIsSuccessNoticeVisible(false);
      fadeTimerRef.current = null;
    }, SUCCESS_NOTICE_DISMISS_MS - SUCCESS_NOTICE_FADE_MS);

    dismissTimerRef.current = window.setTimeout(() => {
      setMessage(null);
      setIsSuccess(false);
      dismissTimerRef.current = null;
    }, SUCCESS_NOTICE_DISMISS_MS);
  }, [isSuccess, message]);

  const handleDecrease = (): void => {
    setQuantity((current) => Math.max(1, current - 1));
  };

  const handleIncrease = (): void => {
    setQuantity((current) => Math.min(maxStock, current + 1));
  };

  const handleAddToCart = (): void => {
    if (dismissTimerRef.current !== null) {
      window.clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }

    if (fadeTimerRef.current !== null) {
      window.clearTimeout(fadeTimerRef.current);
      fadeTimerRef.current = null;
    }

    setMessage(null);
    setIsSuccess(false);
    setIsSuccessNoticeVisible(false);

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
      setIsSuccessNoticeVisible(result.success);

      if (result.success) {
        setQuantity(1);
        router.refresh();
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
          role={isSuccess ? "status" : "alert"}
          aria-live={isSuccess ? "polite" : "assertive"}
          className={
            isSuccess
              ? `flex items-center justify-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-center text-sm font-medium text-emerald-700 backdrop-blur-sm transition-all duration-300 dark:text-emerald-300 ${
                  isSuccessNoticeVisible
                    ? "translate-y-0 opacity-100"
                    : "-translate-y-1 opacity-0"
                }`
              : "rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-center text-sm font-medium text-destructive transition-all"
          }
        >
          {isSuccess ? (
            <>
              <CheckCircle2 className="size-4 shrink-0" />
              <span>{message}</span>
            </>
          ) : (
            message
          )}
        </div>
      ) : null}
    </div>
  );
}
