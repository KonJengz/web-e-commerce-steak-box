import Link from "next/link";
import {
  ArrowLeft,
  CreditCard,
  ExternalLink,
  MapPinned,
  Package2,
  ReceiptText,
  Truck,
  TriangleAlert,
} from "lucide-react";
import { notFound } from "next/navigation";

import { AccountPageHero } from "@/components/account/account-page-hero";
import {
  formatAccountDateTime,
  formatCompactId,
  formatCurrency,
} from "@/components/account/account.utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addressService } from "@/features/address/services/address.service";
import { executeProtectedRequestOrRedirect } from "@/features/auth/services/current-user.service";
import { OrderPaymentSlipForm } from "@/features/order/components/order-payment-slip-form";
import { OrderStatusBadge } from "@/features/order/components/order-status-badge";
import { orderService } from "@/features/order/services/order.service";
import {
  canCustomerUploadPaymentSlip,
  getOrderStatusLabel,
  ORDER_STATUS_META,
} from "@/features/order/types/order-status";
import { buildAccountOrderPath } from "@/features/order/utils/order-path";
import { buildProductPath } from "@/features/product/utils/product-path";
import { ApiError } from "@/lib/api/error";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ step?: string | string[] }>;
}

const getSearchParam = (value: string | string[] | undefined): string => {
  if (Array.isArray(value)) {
    return value[0] ?? "";
  }

  return value ?? "";
};

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderDetailPageProps) {
  const [resolvedParams, resolvedSearchParams] = await Promise.all([
    params,
    searchParams,
  ]);
  const orderId = resolvedParams.id;
  const redirectPath = buildAccountOrderPath(orderId);
  const shouldFocusPayment = getSearchParam(resolvedSearchParams.step) === "payment";
  let orderResult;
  let addressesResult;

  try {
    [orderResult, addressesResult] = await executeProtectedRequestOrRedirect(
      async (accessToken) =>
        Promise.all([
          orderService.getById(accessToken, orderId),
          addressService.getAll(accessToken),
        ]),
      redirectPath,
    );
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }

    throw error;
  }

  const order = orderResult.data;
  const addresses = addressesResult.data;
  const shippingAddress =
    addresses.find((address) => address.id === order.shippingAddressId) ?? null;
  const totalUnits = order.items.reduce((total, item) => total + item.quantity, 0);
  const canUploadSlip = canCustomerUploadPaymentSlip(order.status);

  return (
    <div className="space-y-6">
      <AccountPageHero
        badge="Order Detail"
        title={`Order ${formatCompactId(order.id)}`}
        description="Review the live order state, upload or replace the payment slip when allowed, and keep tabs on shipping updates from the admin team."
        variant="orders"
      >
        <OrderStatusBadge status={order.status} />
        <Badge variant="outline" className="rounded-full border-white/20 px-3 py-1 text-white/80">
          {formatCurrency(order.totalAmount)}
        </Badge>
        <Badge variant="outline" className="rounded-full border-white/20 px-3 py-1 text-white/80">
          {totalUnits} unit{totalUnits === 1 ? "" : "s"}
        </Badge>
      </AccountPageHero>

      <div className="flex items-center justify-between gap-3">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/orders">
            <ArrowLeft className="size-4" />
            Back to Orders
          </Link>
        </Button>
        <p className="text-sm text-muted-foreground">
          Last updated {formatAccountDateTime(order.updatedAt)}
        </p>
      </div>

      {shouldFocusPayment && canUploadSlip ? (
        <section className="rounded-[2rem] border border-primary/20 bg-primary/10 p-5 shadow-[0_22px_70px_rgba(0,0,0,0.05)]">
          <div className="flex items-start gap-3">
            <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
              <CreditCard className="size-4" />
            </span>
            <div className="space-y-1">
              <h2 className="text-base font-semibold text-foreground">
                Payment slip is the next step
              </h2>
              <p className="text-sm leading-6 text-muted-foreground">
                Upload the transfer proof below so the order can move into{" "}
                {getOrderStatusLabel("PAYMENT_REVIEW")}.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="space-y-4">
          <article className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                <Package2 className="size-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Order Items
                </h2>
                <p className="text-sm text-muted-foreground">
                  Snapshot of every item locked into this order.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {order.items.map((item) => {
                const lineTotal = Number(item.priceAtPurchase) * item.quantity;

                return (
                  <div
                    key={item.id}
                    className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-4"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="space-y-1">
                        {item.productSlug ? (
                          <Link
                            href={buildProductPath(item.productSlug)}
                            className="text-sm font-semibold text-foreground transition-colors hover:text-primary"
                          >
                            {item.productNameAtPurchase}
                          </Link>
                        ) : (
                          <p className="text-sm font-semibold text-foreground">
                            {item.productNameAtPurchase}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} × {formatCurrency(item.priceAtPurchase)}
                        </p>
                      </div>

                      <p className="text-sm font-semibold text-foreground">
                        {formatCurrency(lineTotal)}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                <MapPinned className="size-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Delivery & Fulfillment
                </h2>
                <p className="text-sm text-muted-foreground">
                  Shipping target, tracking, and order state all in one place.
                </p>
              </div>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-4">
                <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                  Shipping Address
                </p>
                {shippingAddress ? (
                  <div className="mt-3 space-y-2 text-sm leading-6 text-muted-foreground">
                    <p className="font-semibold text-foreground">
                      {shippingAddress.recipientName}
                    </p>
                    <p>
                      {shippingAddress.addressLine}, {shippingAddress.city}{" "}
                      {shippingAddress.postalCode}
                    </p>
                    {shippingAddress.phone ? <p>{shippingAddress.phone}</p> : null}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    The saved address could not be resolved anymore. The order still
                    keeps its original shipping reference internally.
                  </p>
                )}
              </div>

              <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-4">
                <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                  Tracking
                </p>
                {order.trackingNumber ? (
                  <div className="mt-3 inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/8 px-3 py-1.5 text-sm font-medium text-foreground">
                    <Truck className="size-4 text-primary" />
                    {order.trackingNumber}
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-muted-foreground">
                    Tracking will appear here once the order is marked as shipped.
                  </p>
                )}
              </div>

              <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-4">
                <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                  Created
                </p>
                <p className="mt-3 text-sm font-medium text-foreground">
                  {formatAccountDateTime(order.createdAt)}
                </p>
              </div>

              <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-4">
                <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground">
                  Payment Submitted
                </p>
                <p className="mt-3 text-sm font-medium text-foreground">
                  {order.paymentSubmittedAt
                    ? formatAccountDateTime(order.paymentSubmittedAt)
                    : "Not uploaded yet"}
                </p>
              </div>
            </div>
          </article>
        </section>

        <aside className="space-y-4 xl:sticky xl:top-24">
          <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                <ReceiptText className="size-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Payment Slip
                </h2>
                <p className="text-sm text-muted-foreground">
                  {ORDER_STATUS_META[order.status].description}
                </p>
              </div>
            </div>

            {order.status === "PAYMENT_FAILED" ? (
              <div className="mb-4 rounded-[1.25rem] border border-amber-500/20 bg-amber-500/10 px-4 py-3 text-sm leading-6 text-amber-900 dark:text-amber-100">
                Admin could not confirm this payment yet. Upload a clearer or newer
                slip to move the order back into review.
              </div>
            ) : null}

            {order.status === "CANCELLED" ? (
              <div className="mb-4 rounded-[1.25rem] border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive">
                This order is closed. If you still need the items, create a new
                order from the cart.
              </div>
            ) : null}

            {canUploadSlip ? (
              <OrderPaymentSlipForm
                orderId={order.id}
                paymentSlipUrl={order.paymentSlipUrl}
                redirectPath={redirectPath}
              />
            ) : (
              <div className="space-y-3">
                {order.paymentSlipUrl ? (
                  <Button asChild variant="outline" className="w-full rounded-full">
                    <Link href={order.paymentSlipUrl} target="_blank" rel="noreferrer">
                      View Uploaded Slip
                      <ExternalLink className="size-4" />
                    </Link>
                  </Button>
                ) : null}
                <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3 text-sm leading-6 text-muted-foreground">
                  Payment slips can no longer be changed while the order is in{" "}
                  <span className="font-semibold text-foreground">
                    {getOrderStatusLabel(order.status)}
                  </span>
                  .
                </div>
              </div>
            )}
          </section>

          <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                <TriangleAlert className="size-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Status Guide
                </h2>
                <p className="text-sm text-muted-foreground">
                  Know what the current state means for the next action.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-sm leading-6 text-muted-foreground">
              <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                <span className="font-semibold text-foreground">Pending</span> means
                the order exists but still needs a payment slip.
              </div>
              <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                <span className="font-semibold text-foreground">Payment Review</span>{" "}
                means admin is checking the transfer proof.
              </div>
              <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                <span className="font-semibold text-foreground">Paid</span> and later
                states mean fulfillment is in the admin team&apos;s hands.
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
