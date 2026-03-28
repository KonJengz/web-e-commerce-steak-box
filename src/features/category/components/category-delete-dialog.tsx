"use client";

import { Trash2, TriangleAlert } from "lucide-react";

import { formatAccountDate } from "@/components/account/account.utils";
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
import type { Category } from "@/features/category/types/category.type";

interface CategoryDeleteDialogProps {
  category: Category;
  isPending: boolean;
  linkedProductCount: number;
  message?: string | null;
  onConfirm: () => void;
  onOpenChange: (open: boolean) => void;
  open: boolean;
}

const getLinkedProductLabel = (count: number): string => {
  return `${count} linked product${count === 1 ? "" : "s"}`;
};

export function CategoryDeleteDialog({
  category,
  isPending,
  linkedProductCount,
  message,
  onConfirm,
  onOpenChange,
  open,
}: CategoryDeleteDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[32rem] border-border/60 bg-card/98 p-0">
        <DialogHeader className="gap-3 border-b border-border/50 px-6 py-5">
          <div className="flex items-start gap-4 pr-8">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-[1.2rem] border border-destructive/20 bg-destructive/8 text-destructive">
              <Trash2 className="size-5" />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <div className="glow-dot bg-destructive/80" />
                <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-destructive/90">
                  Delete Category
                </p>
              </div>
              <DialogTitle className="text-xl font-semibold tracking-tight">
                Remove this category from the catalog?
              </DialogTitle>
              <DialogDescription className="max-w-md leading-6">
                This permanently deletes the taxonomy record. Products assigned
                to this category must be moved out before deletion.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 px-6 py-5">
          <div className="rounded-[1.5rem] border border-border/60 bg-background/65 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0 space-y-2">
                <p className="text-base font-semibold tracking-tight text-foreground">
                  {category.name}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  {category.description || "No description saved for this category."}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="rounded-full px-3 py-1">
                  Updated {formatAccountDate(category.updatedAt)}
                </Badge>
                <Badge
                  variant="secondary"
                  className="rounded-full border border-border/60 bg-muted/25 px-3 py-1"
                >
                  {getLinkedProductLabel(linkedProductCount)}
                </Badge>
              </div>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-[1.4rem] border border-destructive/15 bg-destructive/6 px-4 py-3 text-sm leading-6 text-muted-foreground">
            <TriangleAlert className="mt-0.5 size-4 shrink-0 text-destructive" />
            <p>
              Deleting this category clears it from admin taxonomy management
              immediately. This action cannot be undone.
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
            Keep category
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="rounded-full"
            disabled={isPending}
            onClick={onConfirm}
          >
            <Trash2 className="size-4" />
            {isPending ? "Deleting..." : "Delete category"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
