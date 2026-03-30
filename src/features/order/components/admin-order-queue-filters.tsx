"use client";

import { Search, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, useTransition } from "react";

import {
  adminGhostButtonClassName,
  adminSegmentedCountActiveClassName,
  adminSegmentedCountClassName,
  adminSegmentedCountInactiveClassName,
  adminSegmentedStandaloneOptionActiveClassName,
  adminSegmentedStandaloneOptionClassName,
  adminSegmentedStandaloneOptionInactiveClassName,
} from "@/components/ui/admin-action-styles";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  EMPTY_ADMIN_ORDER_SUMMARY,
  type AdminOrderSummary,
} from "@/features/order/types/order.type";
import {
  getOrderStatusLabel,
  normalizeOptionalOrderStatus,
  ORDER_STATUS_VALUES,
  type OrderStatus,
} from "@/features/order/types/order-status";
import { buildAdminOrdersHref } from "@/features/order/utils/admin-order-query";
import { cn } from "@/lib/utils";

const SEARCH_DEBOUNCE_MS = 600;

const orderStatusFilterValues = ["ALL", ...ORDER_STATUS_VALUES] as const;

type OrderStatusFilterValue = (typeof orderStatusFilterValues)[number];

const isAllFilter = (
  value: OrderStatusFilterValue,
): value is "ALL" => {
  return value === "ALL";
};

const normalizeOrderStatusFilterValue = (
  value: string | null | undefined,
): OrderStatusFilterValue => {
  return normalizeOptionalOrderStatus(value) ?? "ALL";
};

interface AdminOrderQueueFiltersProps {
  summary?: AdminOrderSummary | null;
}

const getOrderStatusCount = (
  summary: AdminOrderSummary,
  status: OrderStatusFilterValue,
): number => {
  if (isAllFilter(status)) {
    return summary.all;
  }

  switch (status) {
    case "PENDING":
      return summary.pending;
    case "PAID":
      return summary.paid;
    case "SHIPPED":
      return summary.shipped;
    case "DELIVERED":
      return summary.delivered;
    case "CANCELLED":
      return summary.cancelled;
  }
};

export function AdminOrderQueueFilters({
  summary,
}: AdminOrderQueueFiltersProps) {
  const safeSummary = summary ?? EMPTY_ADMIN_ORDER_SUMMARY;
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentSearch = searchParams.get("search") ?? "";
  const currentStatus = normalizeOrderStatusFilterValue(
    searchParams.get("status"),
  );
  const debounceTimerRef = useRef<number | null>(null);
  const lastSubmittedSearchRef = useRef(currentSearch);
  const lastSubmittedStatusRef = useRef<OrderStatusFilterValue>(currentStatus);
  const [query, setQuery] = useState(currentSearch);
  const [selectedStatus, setSelectedStatus] =
    useState<OrderStatusFilterValue>(currentStatus);

  const navigateWithFilters = useCallback(
    ({
      searchQuery,
      status,
    }: {
      searchQuery: string;
      status: OrderStatusFilterValue;
    }): void => {
      const normalizedStatus: OrderStatus | null = isAllFilter(status)
        ? null
        : status;
      const nextUrl = buildAdminOrdersHref({
        currentPage: 1,
        searchQuery,
        selectedOrderId: null,
        status: normalizedStatus,
      });
      const currentUrl = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      if (nextUrl === currentUrl) {
        return;
      }

      lastSubmittedSearchRef.current = searchQuery.trim();
      lastSubmittedStatusRef.current = status;

      startTransition(() => {
        router.replace(nextUrl, { scroll: false });
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const previousSubmittedSearch = lastSubmittedSearchRef.current;
    const previousSubmittedStatus = lastSubmittedStatusRef.current;

    lastSubmittedSearchRef.current = currentSearch;
    lastSubmittedStatusRef.current = currentStatus;

    setQuery((previousQuery) => {
      return previousQuery.trim() === previousSubmittedSearch
        ? currentSearch
        : previousQuery;
    });
    setSelectedStatus((previousStatus) => {
      return previousStatus === previousSubmittedStatus
        ? currentStatus
        : previousStatus;
    });
  }, [currentSearch, currentStatus]);

  useEffect(() => {
    const trimmedQuery = query.trim();

    if (trimmedQuery === currentSearch) {
      return;
    }

    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      navigateWithFilters({
        searchQuery: query,
        status: selectedStatus,
      });
      debounceTimerRef.current = null;
    }, SEARCH_DEBOUNCE_MS);

    return () => {
      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentSearch, navigateWithFilters, query, selectedStatus]);

  const handleStatusChange = useCallback(
    (status: OrderStatusFilterValue): void => {
      setSelectedStatus(status);

      if (debounceTimerRef.current !== null) {
        window.clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }

      navigateWithFilters({
        searchQuery: query,
        status,
      });
    },
    [navigateWithFilters, query],
  );

  const handleClear = useCallback((): void => {
    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    setQuery("");
    setSelectedStatus("ALL");
    lastSubmittedSearchRef.current = "";
    lastSubmittedStatusRef.current = "ALL";

    startTransition(() => {
      router.replace(pathname, { scroll: false });
    });
  }, [pathname, router]);

  const hasActiveFilters = currentSearch.length > 0 || !isAllFilter(currentStatus);

  return (
    <div className="space-y-4 rounded-[1.6rem] border border-border/60 bg-muted/16 p-4 sm:p-5">
      <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_15rem] xl:items-center">
        <div className="relative min-w-0 flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
            }}
            placeholder="Search by customer, email, tracking, or exact order ID"
            className="h-11 border-border/60 bg-background/80 pl-9"
            aria-label="Search orders"
          />
        </div>

        <div className="flex items-center justify-between gap-3 xl:border-l xl:border-border/50 xl:pl-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold tracking-[0.18em] uppercase text-muted-foreground">
              Queue Filters
            </p>
            <p className="text-xs text-muted-foreground">
              {isPending ? "Refreshing results..." : "Search and status stay synced."}
            </p>
          </div>
          {hasActiveFilters ? (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className={adminGhostButtonClassName}
              onClick={handleClear}
            >
              <X className="size-4" />
              Clear
            </Button>
          ) : (
            <span className="text-xs text-muted-foreground/70">
              All states visible
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-2.5">
        {orderStatusFilterValues.map((status) => {
          const isActive = selectedStatus === status;
          const label = isAllFilter(status)
            ? "All"
            : getOrderStatusLabel(status);
          const count = getOrderStatusCount(safeSummary, status);

          return (
            <button
              key={status}
              type="button"
              className={cn(
                adminSegmentedStandaloneOptionClassName,
                isActive
                  ? adminSegmentedStandaloneOptionActiveClassName
                  : adminSegmentedStandaloneOptionInactiveClassName,
              )}
              onClick={() => {
                handleStatusChange(status);
              }}
            >
              <span>{label}</span>
              <span
                className={cn(
                  adminSegmentedCountClassName,
                  isActive
                    ? adminSegmentedCountActiveClassName
                    : adminSegmentedCountInactiveClassName,
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
