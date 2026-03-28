import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";

interface PaginationProps {
  basePath: string;
  currentPage: number;
  searchParams?: Record<string, string>;
  totalPages: number;
}

const buildPageHref = (
  basePath: string,
  page: number,
  searchParams: Record<string, string> = {},
): string => {
  const params = new URLSearchParams(searchParams);

  if (page > 1) {
    params.set("page", String(page));
  } else {
    params.delete("page");
  }

  const queryString = params.toString();

  return queryString ? `${basePath}?${queryString}` : basePath;
};

const getVisiblePages = (
  currentPage: number,
  totalPages: number,
): number[] => {
  const maxVisible = 5;
  const pages: number[] = [];

  let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
  const end = Math.min(totalPages, start + maxVisible - 1);

  start = Math.max(1, end - maxVisible + 1);

  for (let index = start; index <= end; index++) {
    pages.push(index);
  }

  return pages;
};

export function Pagination({
  basePath,
  currentPage,
  searchParams = {},
  totalPages,
}: PaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  const hasPrevious = currentPage > 1;
  const hasNext = currentPage < totalPages;
  const visiblePages = getVisiblePages(currentPage, totalPages);

  return (
    <nav
      role="navigation"
      aria-label="Pagination"
      className="flex items-center justify-center gap-1.5"
    >
      <Button
        asChild={hasPrevious}
        variant="outline"
        size="icon"
        className="size-9 rounded-full"
        disabled={!hasPrevious}
        aria-label="Previous page"
      >
        {hasPrevious ? (
          <Link
            href={buildPageHref(basePath, currentPage - 1, searchParams)}
            scroll={false}
          >
            <ChevronLeft className="size-4" />
          </Link>
        ) : (
          <ChevronLeft className="size-4" />
        )}
      </Button>

      {visiblePages[0] !== undefined && visiblePages[0] > 1 ? (
        <>
          <Button
            asChild
            variant="outline"
            size="icon"
            className="size-9 rounded-full"
          >
            <Link href={buildPageHref(basePath, 1, searchParams)} scroll={false}>
              1
            </Link>
          </Button>
          {visiblePages[0] > 2 ? (
            <span className="px-1 text-sm text-muted-foreground">…</span>
          ) : null}
        </>
      ) : null}

      {visiblePages.map((page) => (
        <Button
          key={page}
          asChild={page !== currentPage}
          variant={page === currentPage ? "default" : "outline"}
          size="icon"
          className="size-9 rounded-full"
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page === currentPage ? (
            <span>{page}</span>
          ) : (
            <Link
              href={buildPageHref(basePath, page, searchParams)}
              scroll={false}
            >
              {page}
            </Link>
          )}
        </Button>
      ))}

      {visiblePages[visiblePages.length - 1] !== undefined &&
      visiblePages[visiblePages.length - 1]! < totalPages ? (
        <>
          {visiblePages[visiblePages.length - 1]! < totalPages - 1 ? (
            <span className="px-1 text-sm text-muted-foreground">…</span>
          ) : null}
          <Button
            asChild
            variant="outline"
            size="icon"
            className="size-9 rounded-full"
          >
            <Link
              href={buildPageHref(basePath, totalPages, searchParams)}
              scroll={false}
            >
              {totalPages}
            </Link>
          </Button>
        </>
      ) : null}

      <Button
        asChild={hasNext}
        variant="outline"
        size="icon"
        className="size-9 rounded-full"
        disabled={!hasNext}
        aria-label="Next page"
      >
        {hasNext ? (
          <Link
            href={buildPageHref(basePath, currentPage + 1, searchParams)}
            scroll={false}
          >
            <ChevronRight className="size-4" />
          </Link>
        ) : (
          <ChevronRight className="size-4" />
        )}
      </Button>
    </nav>
  );
}
