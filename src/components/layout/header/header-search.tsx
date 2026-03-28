"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const SEARCH_DEBOUNCE_MS = 600;

export function HeaderSearch() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const debounceTimerRef = useRef<number | null>(null);
  const currentQuery = searchParams.get("search") ?? "";
  const lastSubmittedQueryRef = useRef(currentQuery);
  const [query, setQuery] = useState(currentQuery);

  const submitSearch = useCallback(
    (nextQuery: string): void => {
      const nextParams = new URLSearchParams(searchParams.toString());
      const trimmedQuery = nextQuery.trim();
      const basePath = pathname.startsWith("/categories/") ? pathname : "/";

      if (trimmedQuery) {
        nextParams.set("search", trimmedQuery);
      } else {
        nextParams.delete("search");
      }

      nextParams.delete("page");

      const queryString = nextParams.toString();
      const nextUrl = queryString ? `${basePath}?${queryString}` : basePath;
      const currentUrl = searchParams.toString()
        ? `${pathname}?${searchParams.toString()}`
        : pathname;

      if (nextUrl === currentUrl) {
        return;
      }

      lastSubmittedQueryRef.current = trimmedQuery;

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
    const previousSubmittedQuery = lastSubmittedQueryRef.current;
    lastSubmittedQueryRef.current = currentQuery;

    setQuery((previousQuery) => {
      return previousQuery.trim() === previousSubmittedQuery
        ? currentQuery
        : previousQuery;
    });
  }, [currentQuery]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();

    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = null;
    }

    submitSearch(query);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const nextQuery = event.target.value;

    setQuery(nextQuery);

    if (debounceTimerRef.current !== null) {
      window.clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = window.setTimeout(() => {
      submitSearch(nextQuery);
      debounceTimerRef.current = null;
    }, SEARCH_DEBOUNCE_MS);
  };

  return (
    <div className="w-full">
      <form className="relative bg-muted rounded-full" onSubmit={handleSubmit}>
        <Input
          id="header-search"
          name="search"
          type="search"
          placeholder="Search ribeye, wagyu, dry-aged..."
          className="pr-12 rounded-full py-5 pl-4"
          value={query}
          onChange={handleChange}
          aria-busy={isPending}
        />
        <Button
          type="submit"
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full size-8 grid place-items-center"
          aria-label="Search"
        >
          <Search className="size-5" />
        </Button>
      </form>
    </div>
  );
}
