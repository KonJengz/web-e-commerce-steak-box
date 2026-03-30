import type { Metadata } from "next";
import { Suspense, cache } from "react";

import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { 
  AdminProductDirectorySkeleton 
} from "@/components/shared/loading-skeletons";
import { 
  adminHeroPrimaryBadgeClassName 
} from "@/components/ui/admin-badge-styles";
import { Badge } from "@/components/ui/badge";
import { executeWithAdminServerAuthRetry } from "@/features/auth/services/server-auth-execution.service";
import { AdminOrderFilters } from "@/features/order/components/admin-order-filters";
import { AdminOrderList } from "@/features/order/components/admin-order-list";
import { orderService } from "@/features/order/services/order.service";
import { normalizeOrderStatus } from "@/features/order/types/order-status";
import { BASE_PRIVATE_METADATA } from "@/lib/metadata";
import { Pagination } from "@/components/shared/pagination";

export const metadata: Metadata = {
  ...BASE_PRIVATE_METADATA,
  title: "Order Queue Management",
};

interface AdminOrdersPageProps {
  searchParams: Promise<{
    page?: string | string[] | undefined;
    query?: string | string[] | undefined;
    status?: string | string[] | undefined;
  }>;
}

const getFirstParam = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) return value[0] ?? "";
  return value ?? "";
};

const getAdminOrders = cache(
  async (page: number, status: string | undefined, query: string | undefined) => {
    return executeWithAdminServerAuthRetry((accessToken) =>
      orderService.getAdminAll(accessToken, {
        limit: 10,
        page,
        search: query || undefined,
        status: status ? normalizeOrderStatus(status) : undefined,
      })
    );
  }
);

async function AdminOrdersHeroCount({
  page,
  status,
  query,
}: {
  page: number;
  status?: string;
  query?: string;
}) {
  const result = await getAdminOrders(page, status, query);
  const { total } = result.data;

  return (
    <Badge
      variant="secondary"
      className={adminHeroPrimaryBadgeClassName}
    >
      {total} active orders in queue
    </Badge>
  );
}

async function AdminOrdersContent({
  page,
  status,
  query,
}: {
  page: number;
  status?: string;
  query?: string;
}) {
  const result = await getAdminOrders(page, status, query);
  const { items, totalPages } = result.data;

  return (
    <div className="space-y-8">
      <AdminOrderList orders={items} />
      
      {totalPages > 1 && (
        <div className="flex justify-center pt-4">
          <Pagination 
            currentPage={page} 
            totalPages={totalPages} 
            basePath="/admin/orders"
            searchParams={{
              ...(status ? { status } : {}),
              ...(query ? { query } : {}),
            }}
          />
        </div>
      )}
    </div>
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const resolvedSearchParams = await searchParams;
  
  const pageStr = getFirstParam(resolvedSearchParams.page);
  const page = Number.parseInt(pageStr, 10) || 1;
  const status = getFirstParam(resolvedSearchParams.status) || undefined;
  const query = getFirstParam(resolvedSearchParams.query) || undefined;

  const searchState = { page, status, query };

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHero
        badge="Order Queue"
        title="Administer the fulfillment cycle"
        description="Search, filter, and drill into order details to approve payments and fulfill shipments with tracking snapshots."
        variant="orders"
      >
        <Suspense fallback={
          <Badge variant="secondary" className="h-6 w-24 animate-pulse bg-white/10" />
        }>
          <AdminOrdersHeroCount {...searchState} />
        </Suspense>
      </AdminPageHero>

      <section className="space-y-6">
        <AdminOrderFilters />

        <Suspense fallback={<AdminProductDirectorySkeleton />}>
          <AdminOrdersContent {...searchState} />
        </Suspense>
      </section>
    </div>
  );
}
