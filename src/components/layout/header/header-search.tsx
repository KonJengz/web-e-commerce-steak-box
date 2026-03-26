"use client";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export function HeaderSearch() {
  return (
    <div className="w-full">
      <div className="relative bg-muted rounded-full">
        <Input
          id="header-search"
          type="search"
          placeholder="Search ribeye, wagyu, dry-aged..."
          className="pr-12 rounded-full py-5 pl-4"
        />
        <Button
          type="button"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full size-8 grid place-items-center"
          aria-label="Search"
        >
          <Search className="size-5" />
        </Button>
      </div>
    </div>
  );
}
