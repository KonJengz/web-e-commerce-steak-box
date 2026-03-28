import type { OrderStatus } from "@/features/order/types/order-status";

interface BuildAdminOrdersHrefOptions {
  currentPage: number;
  searchQuery?: string;
  selectedOrderId?: string | null;
  status?: OrderStatus | null;
}

export const buildAdminOrdersHref = ({
  currentPage,
  searchQuery = "",
  selectedOrderId,
  status,
}: BuildAdminOrdersHrefOptions): string => {
  const nextSearchParams = new URLSearchParams();
  const trimmedSearchQuery = searchQuery.trim();

  if (selectedOrderId) {
    nextSearchParams.set("order", selectedOrderId);
  }

  if (status) {
    nextSearchParams.set("status", status);
  }

  if (trimmedSearchQuery) {
    nextSearchParams.set("search", trimmedSearchQuery);
  }

  if (currentPage > 1) {
    nextSearchParams.set("page", String(currentPage));
  }

  const queryString = nextSearchParams.toString();

  return queryString ? `/admin/orders?${queryString}` : "/admin/orders";
};

export const buildAdminOrdersPaginationSearchParams = ({
  searchQuery = "",
  status,
}: {
  searchQuery?: string;
  status?: OrderStatus | null;
}): Record<string, string> => {
  const trimmedSearchQuery = searchQuery.trim();

  return {
    ...(trimmedSearchQuery ? { search: trimmedSearchQuery } : {}),
    ...(status ? { status } : {}),
  };
};
