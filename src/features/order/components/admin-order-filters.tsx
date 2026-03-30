"use client";

import { Search, X } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState, useTransition } from "react";

import { Input } from "@/components/ui/input";
import { 
  ORDER_STATUS_VALUES, 
  getOrderStatusLabel 
} from "@/features/order/types/order-status";
import { cn } from "@/lib/utils";

const ALL_STATUS = "ALL" as const;

export function AdminOrderFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentStatus = searchParams.get("status") || ALL_STATUS;
  const currentQuery = searchParams.get("query") || "";
  const [searchValue, setSearchValue] = useState(currentQuery);

  const handleFilterChange = useCallback((params: { status?: string; query?: string }) => {
    const nextSearchParams = new URLSearchParams(searchParams.toString());

    if (params.status !== undefined) {
      if (params.status === ALL_STATUS) {
        nextSearchParams.delete("status");
      } else {
        nextSearchParams.set("status", params.status);
      }
      nextSearchParams.delete("page");
    }

    if (params.query !== undefined) {
      if (params.query.trim()) {
        nextSearchParams.set("query", params.query.trim());
      } else {
        nextSearchParams.delete("query");
      }
      nextSearchParams.delete("page");
    }

    startTransition(() => {
      router.push(`/admin/orders?${nextSearchParams.toString()}`);
    });
  }, [router, searchParams]);

  // Sync search state with URL params
  useEffect(() => {
    setSearchValue(currentQuery);
  }, [currentQuery]);

  // Debounced search
  useEffect(() => {
    if (searchValue === currentQuery) return;

    const timeoutId = setTimeout(() => {
      handleFilterChange({ query: searchValue });
    }, 400);

    return () => clearTimeout(timeoutId);
  }, [searchValue, currentQuery, handleFilterChange]);

  return (
    <div className="space-y-6">
      {/* Search Input */}
      <div className="relative group">
        <Search className={cn(
          "absolute left-4 top-1/2 -translate-y-1/2 size-4 transition-colors",
          isPending ? "text-primary animate-pulse" : "text-muted-foreground/50 group-focus-within:text-primary"
        )} />
        <Input
          placeholder="Search by ID, Name, Email or Tracking Number..."
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          className="h-14 rounded-2xl border-border/40 bg-card/60 pl-11 pr-11 shadow-sm transition-all focus:bg-card focus:ring-primary/20"
        />
        {searchValue && (
          <button
            onClick={() => setSearchValue("")}
            className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-muted-foreground/40 hover:bg-muted hover:text-muted-foreground"
          >
            <X className="size-3.5" />
          </button>
        )}
      </div>

      {/* Status Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 rounded-[2rem] border border-border/40 bg-muted/30 p-1.5">
        <button
          onClick={() => handleFilterChange({ status: ALL_STATUS })}
          className={cn(
            "rounded-full px-5 py-2.5 text-xs font-semibold tracking-wide transition-all uppercase",
            currentStatus === ALL_STATUS
              ? "bg-background text-foreground shadow-sm shadow-black/5"
              : "text-muted-foreground/70 hover:bg-background/40 hover:text-foreground"
          )}
        >
          All Orders
        </button>
        {ORDER_STATUS_VALUES.map((status) => (
          <button
            key={status}
            onClick={() => handleFilterChange({ status })}
            className={cn(
              "rounded-full px-5 py-2.5 text-xs font-semibold tracking-wide transition-all uppercase whitespace-nowrap",
              currentStatus === status
                ? "bg-background text-foreground shadow-sm shadow-black/5"
                : "text-muted-foreground/70 hover:bg-background/40 hover:text-foreground"
            )}
          >
            {getOrderStatusLabel(status)}
          </button>
        ))}
      </div>
    </div>
  );
}
