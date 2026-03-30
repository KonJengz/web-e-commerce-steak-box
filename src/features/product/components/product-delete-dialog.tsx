"use client";

import { Package, Trash2, TriangleAlert } from "lucide-react";

import {
  formatAccountDate,
  formatCompactId,
  formatCurrency,
} from "@/components/account/account.utils";
import {
  adminDestructiveButtonClassName,
  adminOutlineButtonClassName,
} from "@/components/ui/admin-action-styles";
import {
  adminInactiveBadgeClassName,
  adminMutedBadgeClassName,
  adminOutlineBadgeClassName,
  adminSuccessBadgeClassName,
} from "@/components/ui/admin-badge-styles";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminErrorNoticeClassName } from "@/components/ui/admin-notice-styles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { ProductSummary } from "@/features/product/types/product.type";

interface ProductDeleteDialogProps {
  isPending: boolean;
  message?: string | null;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
  product: ProductSummary;
}

export function ProductDeleteDialog({
  isPending,
  message,
  onConfirm,
  onOpenChange,
  open,
  product,
}: ProductDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[34rem] border-border/60 bg-card/98 p-0">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-linear-to-r from-transparent via-destructive/40 to-transparent" />
        <div className="pointer-events-none absolute -top-10 right-10 size-32 rounded-full bg-destructive/10 blur-3xl motion-safe:animate-pulse-glow" />
        <div className="pointer-events-none absolute -bottom-16 left-4 size-36 rounded-full bg-amber-500/6 blur-3xl motion-safe:animate-float-slow" />

        <DialogHeader className="gap-3 border-b border-border/50 px-6 py-5">
          <div className="flex items-start gap-4 pr-8">
            <div className="relative flex size-14 shrink-0 items-center justify-center">
              <div className="absolute inset-[-0.55rem] rounded-[1.6rem] border border-destructive/15 opacity-70 motion-safe:animate-pulse-glow" />
              <div className="absolute inset-0 rounded-[1.35rem] bg-destructive/10 blur-md motion-safe:animate-pulse-glow" />
              <div className="absolute inset-0 rounded-[1.25rem] border border-destructive/20 bg-linear-to-br from-destructive/14 via-destructive/7 to-transparent" />
              <div className="absolute size-2 rounded-full bg-amber-300/80 shadow-[0_0_12px_rgba(253,224,71,0.55)] motion-safe:animate-orbit" />
              <div className="relative flex size-14 items-center justify-center rounded-[1.25rem] border border-destructive/20 bg-card/92 text-destructive">
                <Trash2 className="size-5" />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="glow-dot bg-destructive/80" />
                <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-destructive/90">
                  Delete Product
                </p>
              </div>
              <DialogTitle className="text-xl font-semibold tracking-tight">
                Remove this product from the catalog?
              </DialogTitle>
              <DialogDescription className="max-w-md leading-6">
                This permanently removes the product record from the admin
                directory. Use this only when the SKU should no longer exist in
                the catalog.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div className="relative overflow-hidden rounded-[1.5rem] border border-border/60 bg-background/65 p-4">
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/35 to-transparent" />
            <div className="flex items-start gap-4">
              <div className="flex size-14 shrink-0 items-center justify-center rounded-[1.2rem] border border-border/60 bg-muted/30 text-primary">
                <Package className="size-5" />
              </div>

              <div className="min-w-0 flex-1 space-y-3">
                <div className="space-y-1">
                  <p className="text-base font-semibold tracking-tight text-foreground">
                    {product.name}
                  </p>
                  <p className="font-mono text-xs text-muted-foreground/70">
                    {formatCompactId(product.id)}
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    {product.description.trim() || "No description saved for this product."}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge
                    variant="secondary"
                    className={
                      product.isActive
                        ? adminSuccessBadgeClassName
                        : adminInactiveBadgeClassName
                    }
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                  <Badge variant="outline" className={adminOutlineBadgeClassName}>
                    {product.categoryName ?? "Uncategorized"}
                  </Badge>
                  <Badge variant="secondary" className={adminMutedBadgeClassName}>
                    {formatCurrency(product.currentPrice)}
                  </Badge>
                  <Badge variant="outline" className={adminOutlineBadgeClassName}>
                    Updated {formatAccountDate(product.updatedAt)}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          <div className="relative overflow-hidden rounded-[1.4rem] border border-destructive/15 bg-linear-to-r from-destructive/8 via-destructive/5 to-amber-500/6 px-4 py-3">
            <div className="pointer-events-none absolute inset-y-0 left-0 w-24 bg-linear-to-r from-white/18 via-white/8 to-transparent opacity-70 motion-safe:animate-shimmer" />
            <div className="relative flex items-start gap-3 text-sm leading-6 text-muted-foreground">
              <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive motion-safe:animate-bounce-subtle">
                <TriangleAlert className="size-3.5" />
              </div>
              <p>
                Deleting this product removes it from the admin catalog view
                immediately. This action cannot be undone.
              </p>
            </div>
          </div>

          {message ? <div className={adminErrorNoticeClassName}>{message}</div> : null}
        </div>

        <DialogFooter className="border-t border-border/50 bg-background/50 px-6 py-5 sm:justify-between">
          <Button
            type="button"
            variant="outline"
            className={adminOutlineButtonClassName}
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Keep product
          </Button>
          <Button
            type="button"
            variant="destructive"
            className={adminDestructiveButtonClassName}
            disabled={isPending}
            onClick={onConfirm}
          >
            <Trash2 className="size-4" />
            {isPending ? "Deleting..." : "Delete product"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
