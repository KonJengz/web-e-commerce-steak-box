import Link from "next/link";
import { ArrowLeft, ArrowRight, Package2, ReceiptText } from "lucide-react";

import { AccountPageHero } from "@/components/account/account-page-hero";
import {
  formatAccountDate,
  formatCompactId,
  formatCurrency,
} from "@/components/account/account.utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { executeProtectedRequestOrRedirect } from "@/features/auth/services/current-user.service";
import { OrderStatusBadge } from "@/features/order/components/order-status-badge";
import { orderService } from "@/features/order/services/order.service";
import { getOrderStatusLabel } from "@/features/order/types/order-status";

interface OrdersPageProps {
  searchParams: Promise<{ page?: string | string[] }>;
}

export default async function OrdersPage({
  searchParams,
}: OrdersPageProps) {
  const resolvedSearchParams = await searchParams;
  const pageParam = resolvedSearchParams.page;
  const pageValue = typeof pageParam === "string" ? pageParam : pageParam?.[0];
  const pageNumber = Number(pageValue);
  const currentPage =
    Number.isFinite(pageNumber) && pageNumber > 0 ? Math.floor(pageNumber) : 1;
  const ordersPage = await executeProtectedRequestOrRedirect(
    async (accessToken) =>
      (
        await orderService.getAll(accessToken, {
          limit: 6,
          page: currentPage,
        })
      ).data,
    `/orders${currentPage > 1 ? `?page=${currentPage}` : ""}`,
  );
  const hasPreviousPage = ordersPage.page > 1;
  const hasNextPage = ordersPage.page < ordersPage.totalPages;

  return (
    <div className="space-y-6">
      <AccountPageHero
        badge="Order Ledger"
        title="Track every box that has left the kitchen."
        description="Review your recent orders, check totals, and monitor fulfillment status without digging through email receipts."
        variant="orders"
      >
        <Badge className="rounded-full px-3 py-1">
          {ordersPage.total} total order{ordersPage.total === 1 ? "" : "s"}
        </Badge>
        <Badge variant="outline" className="rounded-full border-white/20 px-3 py-1 text-white/80">
          Page {ordersPage.page} of {ordersPage.totalPages}
        </Badge>
      </AccountPageHero>

      {ordersPage.items.length === 0 ? (
        <section className="rounded-[2rem] border border-dashed border-border/70 bg-card/80 p-8 text-center shadow-[0_22px_70px_rgba(0,0,0,0.05)]">
          <div className="mx-auto inline-flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Package2 className="size-6" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-foreground">
            No orders yet
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm leading-7 text-muted-foreground">
            Your order history will appear here once checkout completes. We&apos;ll
            keep the newest boxes at the top of the list.
          </p>
          <div className="mt-6">
            <Button asChild className="rounded-full">
              <Link href="/">Start Shopping</Link>
            </Button>
          </div>
        </section>
      ) : (
        <>
          <div className="grid gap-4">
            {ordersPage.items.map((order) => (
              <article
                key={order.id}
                className="overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]"
              >
                <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        Order {formatCompactId(order.id)}
                      </h2>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground">
                      Placed on {formatAccountDate(order.createdAt)}
                    </p>
                  </div>

                  <div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
                    <div className="rounded-[1.25rem] border border-border/60 bg-background/60 px-4 py-3">
                      <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                        Total
                      </p>
                      <p className="mt-2 text-base font-semibold text-foreground">
                        {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-border/60 bg-background/60 px-4 py-3">
                      <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                        Shipping
                      </p>
                      <p className="mt-2 text-sm font-medium text-foreground">
                        {order.shippingAddressId ? "Address attached" : "Not set"}
                      </p>
                    </div>
                    <div className="rounded-[1.25rem] border border-border/60 bg-background/60 px-4 py-3">
                      <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                        Receipt
                      </p>
                      <div className="mt-2 inline-flex items-center gap-2 text-sm font-medium text-foreground">
                        <ReceiptText className="size-4 text-primary" />
                        {order.paymentSubmittedAt
                          ? `Slip submitted on ${formatAccountDate(order.paymentSubmittedAt)}`
                          : `Status: ${getOrderStatusLabel(order.status)}`}
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {ordersPage.totalPages > 1 ? (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-muted-foreground">
                Showing page {ordersPage.page} of {ordersPage.totalPages}
              </p>

              <div className="flex gap-3">
                {hasPreviousPage ? (
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href={`/orders?page=${ordersPage.page - 1}`}>
                      <ArrowLeft className="size-4" />
                      Previous
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="rounded-full" disabled>
                    <ArrowLeft className="size-4" />
                    Previous
                  </Button>
                )}
                {hasNextPage ? (
                  <Button asChild variant="outline" className="rounded-full">
                    <Link href={`/orders?page=${ordersPage.page + 1}`}>
                      Next
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                ) : (
                  <Button variant="outline" className="rounded-full" disabled>
                    Next
                    <ArrowRight className="size-4" />
                  </Button>
                )}
              </div>
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
