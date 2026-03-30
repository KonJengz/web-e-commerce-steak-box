"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import { clearCartAction } from "@/features/cart/actions/clear-cart.action";
import { useCartState } from "@/features/cart/components/cart-state-provider";

export function CartClearButton() {
  const router = useRouter();
  const { setCart } = useCartState();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleClearCart = (): void => {
    const confirmed = window.confirm(
      "Clear the entire cart? All staged items will be removed.",
    );

    if (!confirmed) {
      return;
    }

    setMessage(null);

    startTransition(async () => {
      const result = await clearCartAction();

      if (!result.success) {
        setMessage(result.message ?? "Unable to clear the cart.");

        if (result.requiresLogin) {
          router.replace(buildLoginRedirectPath("/cart"));
        }

        return;
      }

      setCart(result.cart ?? null);
    });
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="rounded-full border-destructive/30 text-destructive hover:bg-destructive/8 hover:text-destructive"
        disabled={isPending}
        onClick={handleClearCart}
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin" />
            Clearing...
          </>
        ) : (
          <>
            <Trash2 className="size-4" />
            Clear Cart
          </>
        )}
      </Button>

      {message ? (
        <p className="max-w-xs text-xs leading-5 text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  );
}
