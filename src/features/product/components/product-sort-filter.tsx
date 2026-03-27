"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowDownNarrowWide } from "lucide-react";
import { useCallback } from "react";

import { cn } from "@/lib/utils";

interface ProductSortFilterProps {
  basePath: string;
}

const sortOptions = [
  { label: "Newest", value: "created_desc" },
  { label: "Oldest", value: "created_asc" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
] as const;

const selectClassName =
  "flex h-10 w-full max-w-[220px] rounded-full border border-input bg-transparent px-4 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 dark:bg-input/30";

export function ProductSortFilter({ basePath }: ProductSortFilterProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") ?? "created_desc";

  const handleSortChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>): void => {
      const nextParams = new URLSearchParams(searchParams.toString());

      if (event.target.value === "created_desc") {
        nextParams.delete("sort");
      } else {
        nextParams.set("sort", event.target.value);
      }

      nextParams.delete("page");

      const queryString = nextParams.toString();
      const nextUrl = queryString ? `${basePath}?${queryString}` : basePath;

      router.push(nextUrl);
    },
    [basePath, router, searchParams],
  );

  return (
    <div className="flex items-center gap-3">
      <ArrowDownNarrowWide className="size-4 text-muted-foreground" />
      <select
        value={currentSort}
        onChange={handleSortChange}
        className={cn(selectClassName)}
        aria-label="Sort products"
      >
        {sortOptions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}
