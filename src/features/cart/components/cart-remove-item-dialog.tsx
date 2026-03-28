"use client";

import { Trash2, TriangleAlert } from "lucide-react";

import { formatCurrency } from "@/components/account/account.utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { CartItem } from "@/features/cart/types/cart.type";
import { getCartLineTotal } from "@/features/cart/utils/cart-line";

interface CartRemoveItemDialogProps {
  isPending: boolean;
  item: CartItem;
  message?: string | null;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

export function CartRemoveItemDialog({
  isPending,
  item,
  message,
  onConfirm,
  onOpenChange,
  open,
}: CartRemoveItemDialogProps) {
  const lineTotal = getCartLineTotal(item.currentPrice, item.quantity);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[30rem] border-border/60 bg-card/98 p-0">
        <DialogHeader className="gap-3 border-b border-border/50 px-6 py-5">
          <div className="space-y-1 pr-8">
            <DialogTitle className="text-xl font-semibold tracking-tight">
              Remove this item from the cart?
            </DialogTitle>
            <DialogDescription className="max-w-md leading-6">
              This clears the current line from the draft order. You can add
              the product back later from the catalog.
            </DialogDescription>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div className="flex items-start gap-4 rounded-[1.5rem] border border-border/60 bg-background/65 p-4">
            <Avatar className="size-16 rounded-[1.1rem] border border-border/60 bg-background/70">
              <AvatarImage
                src={item.productImageUrl ?? undefined}
                alt={item.productName}
                className="rounded-[1.1rem] object-cover"
              />
              <AvatarFallback className="rounded-[1.1rem] bg-primary/10 font-semibold text-primary">
                {item.productName.charAt(0)}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1 space-y-2">
              <div>
                <p className="truncate text-base font-semibold text-foreground">
                  {item.productName}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  Qty {item.quantity} · {formatCurrency(item.currentPrice)} each
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  Line total {formatCurrency(lineTotal)}
                </Badge>
                {!item.isActive || item.stock < item.quantity ? (
                  <Badge className="rounded-full border border-amber-500/20 bg-amber-500/10 px-3 py-1 text-amber-700 dark:text-amber-300">
                    Already needs review
                  </Badge>
                ) : null}
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-[1.4rem] border border-destructive/15 bg-destructive/6 px-4 py-3 text-sm leading-6 text-muted-foreground">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p>
              Removing this line updates the cart total immediately and may change
              checkout readiness if this is the last blocker-free item.
            </p>
          </div>

          {message ? (
            <div className="rounded-[1.25rem] border border-destructive/20 bg-destructive/8 px-4 py-3 text-sm leading-6 text-destructive">
              {message}
            </div>
          ) : null}
        </div>

        <DialogFooter className="border-t border-border/50 bg-background/50 px-6 py-5 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Keep item
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-full"
            disabled={isPending}
            onClick={onConfirm}
          >
            <Trash2 className="size-4" />
            {isPending ? "Removing..." : "Remove item"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
