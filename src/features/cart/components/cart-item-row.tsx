"use client";

import { Loader2, Minus, Package, Plus, RefreshCcw, Trash2, TriangleAlert } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import {
  formatAccountDateTime,
  formatCurrency,
} from "@/components/account/account.utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import { CartRemoveItemDialog } from "@/features/cart/components/cart-remove-item-dialog";
import { removeCartItemAction } from "@/features/cart/actions/remove-cart-item.action";
import { updateCartItemAction } from "@/features/cart/actions/update-cart-item.action";
import type { CartItem } from "@/features/cart/types/cart.type";
import { getCartLineTotal } from "@/features/cart/utils/cart-line";

interface CartItemRowProps {
  item: CartItem;
}

export function CartItemRow({ item }: CartItemRowProps) {
  const router = useRouter();
  const [pendingQuantity, setPendingQuantity] = useState<number | null>(null);
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);
  const [removeMessage, setRemoveMessage] = useState<string | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState<boolean>(false);
  const [isUpdating, startUpdateTransition] = useTransition();
  const [isRemoving, startRemoveTransition] = useTransition();
  const displayQuantity = pendingQuantity ?? item.quantity;

  const hasStockIssue = item.stock < item.quantity;
  const isUnavailable = !item.isActive || item.stock <= 0;
  const canIncrease = item.isActive && item.stock > 0 && displayQuantity < item.stock;
  const canDecrease = displayQuantity > 1;
  const lineTotal = useMemo(() => {
    return getCartLineTotal(item.currentPrice, displayQuantity);
  }, [displayQuantity, item.currentPrice]);

  const handleQuantityUpdate = (nextQuantity: number): void => {
    if (nextQuantity === item.quantity || nextQuantity < 0) {
      return;
    }

    setInlineMessage(null);
    setPendingQuantity(nextQuantity);

    startUpdateTransition(async () => {
      const result = await updateCartItemAction({
        productId: item.productId,
        quantity: nextQuantity,
      });

      if (!result.success) {
        setPendingQuantity(null);
        setInlineMessage(result.message ?? "Unable to update this line item.");

        if (result.requiresLogin) {
          router.replace(buildLoginRedirectPath("/cart"));
        }

        return;
      }

      setPendingQuantity(null);
      router.refresh();
    });
  };

  const handleRemove = (): void => {
    setRemoveMessage(null);

    startRemoveTransition(async () => {
      const result = await removeCartItemAction({
        productId: item.productId,
      });

      if (!result.success) {
        setRemoveMessage(result.message ?? "Unable to remove this item.");

        if (result.requiresLogin) {
          router.replace(buildLoginRedirectPath("/cart"));
        }

        return;
      }

      setIsRemoveDialogOpen(false);
      router.refresh();
    });
  };

  return (
    <article className="grid gap-5 px-6 py-5 lg:grid-cols-[minmax(0,1fr)_auto_auto] lg:items-center">
      <div className="flex min-w-0 gap-4">
        <Avatar className="size-18 rounded-[1.5rem] border border-border/60 bg-background/70">
          <AvatarImage
            src={item.productImageUrl ?? undefined}
            alt={item.productName}
            className="rounded-[1.5rem] object-cover"
          />
          <AvatarFallback className="rounded-[1.5rem] bg-primary/10 text-primary">
            <Package className="size-5" />
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 space-y-3">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
                {item.productName}
              </h2>
              <Badge
                variant={item.isActive ? "secondary" : "destructive"}
                className="rounded-full px-2.5 py-1"
              >
                {item.isActive ? "Active" : "Inactive"}
              </Badge>
              {hasStockIssue ? (
                <Badge
                  variant="outline"
                  className="rounded-full border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-amber-700 dark:text-amber-300"
                >
                  Stock changed
                </Badge>
              ) : null}
            </div>
            <p className="text-sm text-muted-foreground">
              Updated {formatAccountDateTime(item.updatedAt)}
            </p>
          </div>

          {isUnavailable ? (
            <div className="flex items-start gap-3 rounded-[1.25rem] border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm leading-6 text-destructive">
              <TriangleAlert className="mt-0.5 size-4 shrink-0" />
              <p>
                {item.isActive
                  ? "This item is out of stock right now. Remove it before checkout."
                  : "This product is no longer active. Remove it before checkout."}
              </p>
            </div>
          ) : hasStockIssue ? (
            <div className="flex flex-col gap-3 rounded-[1.25rem] border border-amber-500/25 bg-amber-500/8 px-4 py-3 text-sm leading-6 text-amber-800 dark:text-amber-200 sm:flex-row sm:items-center sm:justify-between">
              <p>
                Only {item.stock} unit{item.stock === 1 ? "" : "s"} left. Reduce
                this line before checkout.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full border-amber-500/30 bg-transparent"
                disabled={isUpdating || isRemoving}
                onClick={() => handleQuantityUpdate(item.stock)}
              >
                <RefreshCcw className="size-4" />
                Use {item.stock}
              </Button>
            </div>
          ) : null}

          {inlineMessage ? (
            <p className="text-sm leading-6 text-destructive">
              {inlineMessage}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-[auto_auto] lg:min-w-[17rem] lg:justify-end">
        <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
            Quantity
          </p>
          <div className="mt-2 flex items-center gap-1 rounded-full border border-border/70 bg-card p-1">
            <button
              type="button"
              onClick={() => handleQuantityUpdate(displayQuantity - 1)}
              disabled={!canDecrease || isUpdating || isRemoving}
              className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              aria-label={`Decrease quantity for ${item.productName}`}
            >
              <Minus className="size-4" />
            </button>
            <span className="min-w-[3ch] text-center text-sm font-semibold tabular-nums text-foreground">
              {isUpdating ? <Loader2 className="mx-auto size-4 animate-spin" /> : displayQuantity}
            </span>
            <button
              type="button"
              onClick={() => handleQuantityUpdate(displayQuantity + 1)}
              disabled={!canIncrease || isUpdating || isRemoving}
              className="inline-flex size-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
              aria-label={`Increase quantity for ${item.productName}`}
            >
              <Plus className="size-4" />
            </button>
          </div>
        </div>

        <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3 text-left sm:text-right">
          <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
            Line Total
          </p>
          <p className="mt-2 text-base font-semibold text-foreground">
            {formatCurrency(lineTotal)}
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            {formatCurrency(item.currentPrice)} each
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 lg:flex-col lg:items-end">
        <div className="text-sm text-muted-foreground">
          {item.stock} available
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="rounded-full border-destructive/25 text-destructive hover:bg-destructive/8 hover:text-destructive"
          disabled={isRemoving || isUpdating}
          onClick={() => {
            setRemoveMessage(null);
            setIsRemoveDialogOpen(true);
          }}
        >
          {isRemoving ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Removing...
            </>
          ) : (
            <>
              <Trash2 className="size-4" />
              Remove
            </>
          )}
        </Button>
      </div>

      <CartRemoveItemDialog
        open={isRemoveDialogOpen}
        onOpenChange={(open) => {
          setIsRemoveDialogOpen(open);

          if (!open) {
            setRemoveMessage(null);
          }
        }}
        item={item}
        isPending={isRemoving}
        message={removeMessage}
        onConfirm={handleRemove}
      />
    </article>
  );
}
