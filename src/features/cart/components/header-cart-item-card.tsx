"use client";

import Link from "next/link";
import { Loader2, Minus, Package, Plus, Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { usePathname, useRouter } from "next/navigation";

import { formatCurrency } from "@/components/account/account.utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import { CartRemoveItemDialog } from "@/features/cart/components/cart-remove-item-dialog";
import { useCartState } from "@/features/cart/components/cart-state-provider";
import { removeCartItemAction } from "@/features/cart/actions/remove-cart-item.action";
import { updateCartItemAction } from "@/features/cart/actions/update-cart-item.action";
import type { CartItem } from "@/features/cart/types/cart.type";
import { getCartLineTotal } from "@/features/cart/utils/cart-line";
import { buildProductPath } from "@/features/product/utils/product-path";

interface HeaderCartItemCardProps {
  item: CartItem;
}

export function HeaderCartItemCard({ item }: HeaderCartItemCardProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { setCart } = useCartState();
  const [pendingQuantity, setPendingQuantity] = useState<number | null>(null);
  const [inlineMessage, setInlineMessage] = useState<string | null>(null);
  const [removeMessage, setRemoveMessage] = useState<string | null>(null);
  const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState<boolean>(false);
  const [isUpdating, startUpdateTransition] = useTransition();
  const [isRemoving, startRemoveTransition] = useTransition();
  const displayQuantity = pendingQuantity ?? item.quantity;
  const hasIssue = !item.isActive || item.stock < item.quantity;
  const canIncrease = item.isActive && item.stock > 0 && displayQuantity < item.stock;
  const canDecrease = displayQuantity > 1;

  const handleQuantityUpdate = (nextQuantity: number): void => {
    if (nextQuantity === item.quantity || nextQuantity < 1) {
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
        setInlineMessage(result.message ?? "Unable to update this item.");

        if (result.requiresLogin) {
          router.replace(buildLoginRedirectPath("/cart"));
        }

        return;
      }

      setPendingQuantity(null);
      setCart(result.cart ?? null);

      if (pathname === "/checkout") {
        router.refresh();
      }
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
      setCart(result.cart ?? null);

      if (pathname === "/checkout") {
        router.refresh();
      }
    });
  };

  return (
    <>
      <article className="rounded-[1.35rem] border border-border/60 bg-card/75 px-3.5 py-3.5">
        <div className="flex items-start gap-3">
          <Avatar className="size-14 rounded-[1rem] border border-border/60 bg-background/70">
            <AvatarImage
              src={item.productImageUrl ?? undefined}
              alt={item.productName}
              className="rounded-[1rem] object-cover"
            />
            <AvatarFallback className="rounded-[1rem] bg-primary/10 text-primary">
              <Package className="size-4" />
            </AvatarFallback>
          </Avatar>

          <div className="min-w-0 flex-1 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link
                  href={buildProductPath(item.productSlug)}
                  className="block truncate text-sm font-semibold text-foreground transition-colors hover:text-primary"
                >
                  {item.productName}
                </Link>
                <p className="mt-1 text-xs text-muted-foreground">
                  {formatCurrency(item.currentPrice)} each
                </p>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {formatCurrency(getCartLineTotal(item.currentPrice, displayQuantity))}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1 rounded-full border border-border/70 bg-background/80 p-1">
                <button
                  type="button"
                  onClick={() => handleQuantityUpdate(displayQuantity - 1)}
                  disabled={!canDecrease || isUpdating || isRemoving}
                  className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                  aria-label={`Decrease quantity for ${item.productName}`}
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="min-w-[2.5ch] text-center text-sm font-semibold tabular-nums text-foreground">
                  {isUpdating ? (
                    <Loader2 className="mx-auto size-3.5 animate-spin" />
                  ) : (
                    displayQuantity
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => handleQuantityUpdate(displayQuantity + 1)}
                  disabled={!canIncrease || isUpdating || isRemoving}
                  className="inline-flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:pointer-events-none disabled:opacity-40"
                  aria-label={`Increase quantity for ${item.productName}`}
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              <Badge variant="outline" className="rounded-full px-2.5 py-1">
                {item.stock} available
              </Badge>

              {hasIssue ? (
                <Badge className="rounded-full border border-amber-500/20 bg-amber-500/12 px-2.5 py-1 text-amber-700 dark:text-amber-300">
                  Needs review
                </Badge>
              ) : null}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="ml-auto rounded-full px-3 text-destructive hover:bg-destructive/8 hover:text-destructive"
                disabled={isUpdating || isRemoving}
                onClick={() => {
                  setRemoveMessage(null);
                  setIsRemoveDialogOpen(true);
                }}
              >
                {isRemoving ? (
                  <>
                    <Loader2 className="size-3.5 animate-spin" />
                    Removing
                  </>
                ) : (
                  <>
                    <Trash2 className="size-3.5" />
                    Remove
                  </>
                )}
              </Button>
            </div>

            {inlineMessage ? (
              <p className="text-xs leading-6 text-destructive">
                {inlineMessage}
              </p>
            ) : null}
          </div>
        </div>
      </article>

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
    </>
  );
}
