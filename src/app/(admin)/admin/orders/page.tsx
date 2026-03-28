import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense, cache } from "react";
import {
  ArrowRight,
  Clock3,
  MapPinned,
  PackageOpen,
  ReceiptText,
  Truck,
} from "lucide-react";

import {
  formatAccountDateTime,
  formatCompactId,
  formatCurrency,
} from "@/components/account/account.utils";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import {
  AdminOrderInspectorSkeleton,
  AdminOrdersHeroBadgesSkeleton,
  AdminOrdersQueueSkeleton,
} from "@/components/shared/loading-skeletons";
import { Pagination } from "@/components/shared/pagination";
import { Badge } from "@/components/ui/badge";
import { requireAdminUser, requireCurrentAccessToken } from "@/features/auth/services/current-user.service";
import { buildSessionRefreshPath } from "@/features/auth/utils/auth-redirect";
import { AdminOrderQueueFilters } from "@/features/order/components/admin-order-queue-filters";
import { AdminOrderStatusForm } from "@/features/order/components/admin-order-status-form";
import { OrderStatusBadge } from "@/features/order/components/order-status-badge";
import { orderService } from "@/features/order/services/order.service";
import {
  ORDER_STATUS_META,
  normalizeOptionalOrderStatus,
  type OrderStatus,
} from "@/features/order/types/order-status";
import {
  buildAdminOrdersHref,
  buildAdminOrdersPaginationSearchParams,
} from "@/features/order/utils/admin-order-query";
import type {
  AdminOrderDetail,
  AdminOrderListResult,
} from "@/features/order/types/order.type";
import { EMPTY_ADMIN_ORDER_SUMMARY } from "@/features/order/types/order.type";
import { ApiError } from "@/lib/api/error";
import { cn } from "@/lib/utils";

const ADMIN_ORDERS_PER_PAGE = 8;

interface AdminOrdersPageProps {
  searchParams: Promise<{
    order?: string | string[] | undefined;
    page?: string | string[] | undefined;
    search?: string | string[] | undefined;
    status?: string | string[] | undefined;
  }>;
}

interface AdminOrdersDataRequestState {
  currentPage: number;
  requestPath: string;
  searchQuery: string;
  selectedStatus: OrderStatus | null;
}

interface AdminOrdersRequestState extends AdminOrdersDataRequestState {
  requestedOrderId: string | null;
}

const getFirstSearchParam = (
  value: string | string[] | undefined,
): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

const isUuidLike = (value: string): boolean => {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
};

const handleAdminOrdersApiError = (
  error: unknown,
  redirectPath: string,
): never => {
  if (error instanceof ApiError) {
    if (error.status === 401) {
      redirect(buildSessionRefreshPath(redirectPath));
    }

    if (error.status === 403) {
      redirect("/");
    }
  }

  throw error;
};

const getAdminOrdersPageData = cache(
  async (
    accessToken: string,
    currentPage: number,
    searchQuery: string,
    selectedStatus: OrderStatus | null,
    requestPath: string,
  ): Promise<AdminOrderListResult> => {
    try {
      const result = await orderService.getAdminAll(accessToken, {
        limit: ADMIN_ORDERS_PER_PAGE,
        page: currentPage,
        search: searchQuery || undefined,
        status: selectedStatus ?? undefined,
      });

      return result.data;
    } catch (error) {
      return handleAdminOrdersApiError(error, requestPath);
    }
  },
);

const getAdminOrderDetailData = cache(
  async (
    accessToken: string,
    orderId: string,
    requestPath: string,
  ): Promise<AdminOrderDetail | null> => {
    try {
      const result = await orderService.getAdminById(accessToken, orderId);

      return result.data;
    } catch (error) {
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }

      return handleAdminOrdersApiError(error, requestPath);
    }
  },
);

const resolveQueueSelectedOrderId = (
  ordersPage: AdminOrderListResult,
  requestedOrderId: string | null,
): string | null => {
  if (
    requestedOrderId &&
    ordersPage.items.some((order) => order.id === requestedOrderId)
  ) {
    return requestedOrderId;
  }

  return ordersPage.items[0]?.id ?? null;
};

function QueueSummaryCard({
  className,
  label,
  labelClassName,
  value,
  valueClassName,
}: {
  className?: string;
  label: string;
  labelClassName?: string;
  value: string;
  valueClassName?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-[1.2rem] border border-border/60 bg-background/72 px-4 py-3",
        className,
      )}
    >
      <p
        className={cn(
          "text-[10px] font-semibold tracking-[0.22em] uppercase text-muted-foreground",
          labelClassName,
        )}
      >
        {label}
      </p>
      <p
        className={cn(
          "mt-2 text-lg font-semibold tracking-tight text-foreground",
          valueClassName,
        )}
      >
        {value}
      </p>
    </div>
  );
}

async function HeroBadges({
  accessToken,
  requestState,
}: {
  accessToken: string;
  requestState: AdminOrdersDataRequestState;
}) {
  const ordersPage = await getAdminOrdersPageData(
    accessToken,
    requestState.currentPage,
    requestState.searchQuery,
    requestState.selectedStatus,
    requestState.requestPath,
  );

  return (
    <>
      <Badge
        variant="secondary"
        className="h-auto rounded-full bg-white/10 px-4 py-2 text-white"
      >
        {ordersPage.total} total orders
      </Badge>
      <Badge
        variant="secondary"
        className="h-auto rounded-full bg-white/8 px-4 py-2 text-white/90"
      >
        Page {ordersPage.page} of {ordersPage.totalPages}
      </Badge>
      {requestState.selectedStatus ? (
        <Badge
          variant="secondary"
          className="h-auto rounded-full bg-white/8 px-4 py-2 text-white/90"
        >
          Filter {requestState.selectedStatus}
        </Badge>
      ) : null}
      {requestState.searchQuery ? (
        <Badge
          variant="secondary"
          className="h-auto rounded-full bg-white/8 px-4 py-2 text-white/90"
        >
          Search “{requestState.searchQuery}”
        </Badge>
      ) : null}
      <Badge
        variant="secondary"
        className="h-auto rounded-full bg-white/8 px-4 py-2 text-white/90"
      >
        <Truck className="mr-1 size-3.5" />
        {ordersPage.summary.tracked} with tracking
      </Badge>
    </>
  );
}

function QueueSection({
  currentPage,
  ordersPage,
  searchQuery,
  selectedOrderId,
  selectedStatus,
}: {
  currentPage: number;
  ordersPage: AdminOrderListResult;
  searchQuery: string;
  selectedOrderId: string | null;
  selectedStatus: OrderStatus | null;
}) {
  const queueSummary = ordersPage.summary ?? EMPTY_ADMIN_ORDER_SUMMARY;

  return (
    <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
      <div className="grid gap-6 border-b border-border/60 pb-6 xl:grid-cols-[minmax(0,1fr)_15rem] xl:items-start">
        <div className="max-w-3xl space-y-3">
          <div className="flex items-center gap-2">
            <div className="glow-dot" />
            <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-muted-foreground">
              Orders Queue
            </p>
          </div>
          <div className="space-y-2">
            <h2 className="max-w-2xl text-2xl font-semibold tracking-tight text-foreground sm:text-[2.2rem] sm:leading-[1.04]">
              Scan the live queue and open one order at a time
            </h2>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-[15px]">
              Use the right-hand inspector to confirm payment, stamp shipping,
              and correct tracking without leaving the queue.
            </p>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1 xl:self-stretch">
          <QueueSummaryCard
            className="min-h-[7.5rem] sm:min-w-0 xl:min-h-[6.9rem]"
            label="Pending"
            labelClassName="whitespace-nowrap tracking-[0.18em]"
            value={String(queueSummary.pending)}
            valueClassName="text-3xl leading-none tabular-nums"
          />
          <QueueSummaryCard
            className="min-h-[7.5rem] sm:min-w-0 xl:min-h-[6.9rem]"
            label="Paid"
            labelClassName="whitespace-nowrap tracking-[0.18em]"
            value={String(queueSummary.paid)}
            valueClassName="text-3xl leading-none tabular-nums"
          />
          <QueueSummaryCard
            className="min-h-[7.5rem] sm:min-w-0 xl:min-h-[6.9rem]"
            label="Shipped"
            labelClassName="whitespace-nowrap tracking-[0.18em]"
            value={String(queueSummary.shipped)}
            valueClassName="text-3xl leading-none tabular-nums"
          />
        </div>
      </div>

      <div className="mt-5">
        <AdminOrderQueueFilters summary={queueSummary} />
      </div>

      <div className="mt-5 space-y-3">
        {ordersPage.items.length > 0 ? (
          ordersPage.items.map((order) => {
            const isSelected = order.id === selectedOrderId;

            return (
              <Link
                key={order.id}
                href={buildAdminOrdersHref({
                  currentPage,
                  searchQuery,
                  selectedOrderId: order.id,
                  status: selectedStatus,
                })}
                scroll={false}
                className={cn(
                  "block rounded-[1.6rem] border px-5 py-5 transition-all duration-200",
                  isSelected
                    ? "border-primary/25 bg-primary/6 shadow-[0_18px_50px_rgba(0,0,0,0.07)]"
                    : "border-border/60 bg-muted/18 hover:border-border/80 hover:bg-muted/30",
                )}
              >
                <div className="flex flex-col gap-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0 space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">
                        {order.userName} · {order.userEmail}
                      </p>
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-lg font-semibold tracking-tight text-foreground">
                          Order {formatCompactId(order.id)}
                        </h3>
                        <OrderStatusBadge status={order.status} />
                      </div>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span>{formatAccountDateTime(order.updatedAt)}</span>
                      <ArrowRight className="size-4" />
                    </div>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <QueueSummaryCard
                      label="Total"
                      value={formatCurrency(order.totalAmount)}
                    />
                    <QueueSummaryCard
                      label="Placed"
                      value={formatAccountDateTime(order.createdAt)}
                    />
                    <QueueSummaryCard
                      label="Tracking"
                      value={order.trackingNumber ?? "Pending"}
                    />
                  </div>
                </div>
              </Link>
            );
          })
        ) : (
          <div className="rounded-[1.6rem] border border-dashed border-border/60 bg-muted/20 px-5 py-12 text-center">
            <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full border border-border/60 bg-background/80 text-primary">
              <ReceiptText className="size-6" />
            </div>
            <h3 className="mt-5 text-xl font-semibold tracking-tight text-foreground">
              No orders have landed yet
            </h3>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
              As soon as checkout creates orders, the admin queue will appear
              here for payment and fulfillment work.
            </p>
          </div>
        )}
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-muted-foreground">
          Page {ordersPage.page} of {ordersPage.totalPages}
        </p>
        <Pagination
          basePath="/admin/orders"
          currentPage={currentPage}
          searchParams={buildAdminOrdersPaginationSearchParams({
            searchQuery,
            status: selectedStatus,
          })}
          totalPages={ordersPage.totalPages}
        />
      </div>
    </section>
  );
}

async function QueueSectionBoundary({
  accessToken,
  requestState,
}: {
  accessToken: string;
  requestState: AdminOrdersRequestState;
}) {
  const ordersPage = await getAdminOrdersPageData(
    accessToken,
    requestState.currentPage,
    requestState.searchQuery,
    requestState.selectedStatus,
    requestState.requestPath,
  );
  const selectedOrderId = resolveQueueSelectedOrderId(
    ordersPage,
    requestState.requestedOrderId,
  );

  return (
    <QueueSection
      currentPage={requestState.currentPage}
      ordersPage={ordersPage}
      searchQuery={requestState.searchQuery}
      selectedOrderId={selectedOrderId}
      selectedStatus={requestState.selectedStatus}
    />
  );
}

function SelectedOrderInspector({
  currentPage,
  order,
  searchQuery,
  selectedStatus,
}: {
  currentPage: number;
  order: AdminOrderDetail | null;
  searchQuery: string;
  selectedStatus: OrderStatus | null;
}) {
  if (!order) {
    return (
      <aside className="2xl:sticky 2xl:top-24">
        <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 text-center shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
          <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full border border-border/60 bg-background/80 text-primary">
            <PackageOpen className="size-6" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
            Select an order
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            Choose an order from the queue to inspect line items, confirm
            payment, and publish its tracking number.
          </p>
        </section>
      </aside>
    );
  }

  const redirectPath = buildAdminOrdersHref({
    currentPage,
    searchQuery,
    selectedOrderId: order.id,
    status: selectedStatus,
  });

  return (
    <aside className="space-y-4 2xl:sticky 2xl:top-24">
      <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
        <div className="space-y-4 border-b border-border/60 pb-5">
          <div className="flex flex-wrap items-center gap-2">
            <OrderStatusBadge status={order.status} />
            <Badge variant="outline" className="rounded-full">
              {ORDER_STATUS_META[order.status].description}
            </Badge>
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Order {formatCompactId(order.id)}
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              {order.userName} · {order.userEmail}
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <QueueSummaryCard
            label="Total"
            value={formatCurrency(order.totalAmount)}
          />
          <QueueSummaryCard
            label="Tracking"
            value={order.trackingNumber ?? "Pending"}
          />
          <QueueSummaryCard
            label="Placed"
            value={formatAccountDateTime(order.createdAt)}
          />
          <QueueSummaryCard
            label="Updated"
            value={formatAccountDateTime(order.updatedAt)}
          />
        </div>

        <div className="mt-5 grid gap-3">
          <div className="rounded-[1.25rem] border border-border/60 bg-muted/20 px-4 py-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.24em] uppercase text-muted-foreground">
              <MapPinned className="size-3.5" />
              Shipping Reference
            </div>
            <p className="mt-2 text-sm font-medium text-foreground">
              {order.shippingAddressId
                ? formatCompactId(order.shippingAddressId)
                : "No shipping address attached"}
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-border/60 bg-muted/20 px-4 py-3">
            <div className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.24em] uppercase text-muted-foreground">
              <Clock3 className="size-3.5" />
              Fulfillment Note
            </div>
            <p className="mt-2 text-sm leading-6 text-foreground">
              Tracking emails are sent automatically after the tracking number
              changes. Cancelling an order restores stock to inventory.
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="glow-dot" />
            <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-muted-foreground">
              Order Lines
            </p>
          </div>
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Snapshot at purchase time
          </h2>
        </div>

        <div className="mt-5 space-y-3">
          {order.items.map((item) => (
            <article
              key={item.id}
              className="rounded-[1.25rem] border border-border/60 bg-muted/20 px-4 py-4"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0 space-y-1">
                  <h3 className="text-base font-semibold tracking-tight text-foreground">
                    {item.productNameAtPurchase}
                  </h3>
                  <p className="font-mono text-xs text-muted-foreground/70">
                    {formatCompactId(item.productId)}
                  </p>
                </div>
                <div className="text-sm font-medium text-muted-foreground">
                  Qty {item.quantity}
                </div>
              </div>
              <div className="mt-4 flex items-center justify-between gap-4 text-sm">
                <span className="text-muted-foreground">
                  Unit {formatCurrency(item.priceAtPurchase)}
                </span>
                <span className="font-semibold text-foreground">
                  {formatCurrency(
                    Number(item.priceAtPurchase) * Number(item.quantity),
                  )}
                </span>
              </div>
            </article>
          ))}
        </div>
      </section>

      <AdminOrderStatusForm
        key={`${order.id}:${order.status}:${order.updatedAt}:${order.trackingNumber ?? ""}`}
        order={order}
        redirectPath={redirectPath}
      />
    </aside>
  );
}

async function SelectedOrderInspectorBoundary({
  accessToken,
  requestState,
}: {
  accessToken: string;
  requestState: AdminOrdersRequestState;
}) {
  const ordersPage = await getAdminOrdersPageData(
    accessToken,
    requestState.currentPage,
    requestState.searchQuery,
    requestState.selectedStatus,
    requestState.requestPath,
  );
  const selectedOrderId = resolveQueueSelectedOrderId(
    ordersPage,
    requestState.requestedOrderId,
  );
  const order = selectedOrderId
    ? await getAdminOrderDetailData(
        accessToken,
        selectedOrderId,
        requestState.requestPath,
      )
    : null;

  return (
    <SelectedOrderInspector
      currentPage={requestState.currentPage}
      order={order}
      searchQuery={requestState.searchQuery}
      selectedStatus={requestState.selectedStatus}
    />
  );
}

export default async function AdminOrdersPage({
  searchParams,
}: AdminOrdersPageProps) {
  const resolvedSearchParams = await searchParams;
  const pageValue = Number.parseInt(
    getFirstSearchParam(resolvedSearchParams.page),
    10,
  );
  const currentPage = Number.isFinite(pageValue) && pageValue > 0 ? pageValue : 1;
  const selectedOrderParam = getFirstSearchParam(resolvedSearchParams.order);
  const searchQuery = getFirstSearchParam(resolvedSearchParams.search);
  const selectedStatus = normalizeOptionalOrderStatus(
    getFirstSearchParam(resolvedSearchParams.status),
  );
  const requestedOrderId = isUuidLike(selectedOrderParam)
    ? selectedOrderParam
    : null;
  const requestPath = buildAdminOrdersHref({
    currentPage,
    searchQuery,
    selectedOrderId: requestedOrderId,
    status: selectedStatus,
  });

  await requireAdminUser(requestPath);
  const accessToken = await requireCurrentAccessToken(requestPath);
  const requestState: AdminOrdersRequestState = {
    currentPage,
    requestPath,
    requestedOrderId,
    searchQuery,
    selectedStatus,
  };
  const listBoundaryKey = JSON.stringify({
    currentPage,
    searchQuery,
    selectedStatus: selectedStatus ?? "ALL",
  });
  const inspectorBoundaryKey = JSON.stringify({
    currentPage,
    requestedOrderId: requestedOrderId ?? "auto",
    searchQuery,
    selectedStatus: selectedStatus ?? "ALL",
  });

  return (
    <div className="space-y-6">
      <AdminPageHero
        badge="Orders"
        title="Run payment confirmation and shipping from one quiet queue"
        description="Open one order, move it through the allowed status path, and publish tracking without bouncing between screens."
        variant="orders"
      >
        <Suspense
          key={listBoundaryKey}
          fallback={<AdminOrdersHeroBadgesSkeleton />}
        >
          <HeroBadges accessToken={accessToken} requestState={requestState} />
        </Suspense>
      </AdminPageHero>

      <div className="grid gap-6 2xl:grid-cols-[minmax(0,1.15fr)_minmax(360px,0.85fr)]">
        <Suspense
          key={listBoundaryKey}
          fallback={<AdminOrdersQueueSkeleton />}
        >
          <QueueSectionBoundary
            accessToken={accessToken}
            requestState={requestState}
          />
        </Suspense>
        <Suspense
          key={inspectorBoundaryKey}
          fallback={<AdminOrderInspectorSkeleton />}
        >
          <SelectedOrderInspectorBoundary
            accessToken={accessToken}
            requestState={requestState}
          />
        </Suspense>
      </div>
    </div>
  );
}
