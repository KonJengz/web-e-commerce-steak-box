"use client";

import { AlertTriangle, CheckCircle2, PackageX } from "lucide-react";
import { INVENTORY_THRESHOLDS } from "@/lib/inventory-config";

interface StockStatusNoticeProps {
  stock: number;
}

export function StockStatusNotice({ stock }: StockStatusNoticeProps) {
  if (stock <= INVENTORY_THRESHOLDS.CRITICAL) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-destructive/20 bg-destructive/8 p-4 text-destructive">
        <PackageX className="size-5 shrink-0" />
        <div className="space-y-0.5">
          <p className="text-sm font-semibold leading-none">Out of Stock</p>
          <p className="text-xs opacity-80">
            This item is currently unavailable. Check back soon!
          </p>
        </div>
      </div>
    );
  }

  if (stock <= INVENTORY_THRESHOLDS.LOW) {
    return (
      <div className="flex items-center gap-3 rounded-2xl border border-amber-500/20 bg-amber-500/8 p-4 text-amber-700 dark:text-amber-400">
        <AlertTriangle className="size-5 shrink-0 animate-pulse" />
        <div className="space-y-0.5">
          <p className="text-sm font-semibold leading-none">
            Limited Availability
          </p>
          <p className="text-xs opacity-90">
            Only <span className="font-bold underline">{stock}</span> left in stock - order soon!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/20 bg-emerald-500/8 p-4 text-emerald-700 dark:text-emerald-400">
      <CheckCircle2 className="size-5 shrink-0" />
      <div className="space-y-0.5">
        <p className="text-sm font-semibold leading-none">Ready to Ship</p>
        <p className="text-xs opacity-90">
          In stock and ready for immediate delivery.
        </p>
      </div>
    </div>
  );
}
