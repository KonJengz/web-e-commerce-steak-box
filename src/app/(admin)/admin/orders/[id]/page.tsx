import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { 
  ArrowLeft, 
  ExternalLink, 
  ImageOff, 
  Info, 
  ReceiptText, 
  User 
} from "lucide-react";
import { notFound } from "next/navigation";
import { cache } from "react";

import { 
  formatAccountDateTime, 
  formatCompactId, 
  formatCurrency 
} from "@/components/account/account.utils";
import { AdminPageHero } from "@/components/admin/admin-page-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { addressService } from "@/features/address/services/address.service";
import { executeWithAdminServerAuthRetry } from "@/features/auth/services/server-auth-execution.service";
import { AdminOrderUpdateStatusForm } from "@/features/order/components/admin-order-update-status-form";
import { OrderStatusBadge } from "@/features/order/components/order-status-badge";
import { orderService } from "@/features/order/services/order.service";
import { buildProductPath } from "@/features/product/utils/product-path";
import { BASE_PRIVATE_METADATA } from "@/lib/metadata";
import { ApiError } from "@/lib/api/error";
import cloudinaryLoader from "@/lib/cloudinary-loader";

export const metadata: Metadata = {
  ...BASE_PRIVATE_METADATA,
  title: "Admin Order Decision Center",
};

interface AdminOrderDetailPageProps {
  params: Promise<{ id: string }>;
}

const getAdminOrderDetail = cache(async (id: string) => {
  return executeWithAdminServerAuthRetry((accessToken) =>
    orderService.getAdminById(accessToken, id)
  );
});

export default async function AdminOrderDetailPage({
  params,
}: AdminOrderDetailPageProps) {
  const { id } = await params;
  
  let order;
  try {
    const result = await getAdminOrderDetail(id);
    order = result.data;
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  // Fetch address for full detail if shippingAddressId exists
  let address = null;
  if (order.shippingAddressId) {
     try {
       const addressResult = await executeWithAdminServerAuthRetry((accessToken) =>
         addressService.getAll(accessToken) // This is for user, but admin needs to see the specific one?
         // In a real system, getAdminById should probably include address snapshot.
         // For now, let's look for it in the user's addresses if we had that, but we don't.
       );
       // Note: Normally the backend should return the address snapshot in order detail.
       // Looking at OrderDetailApiResponse in service, shipping_address_id is a string.
       // We might not be able to retrieve full address detail if it's been deleted or we don't have user's token.
       // However, we rely on the backend providing it if requested via admin path.
     } catch (e) {
       // fallback
     }
  }

  return (
    <div className="space-y-6 pb-20">
      <AdminPageHero
        badge="Order Detail"
        title={`Reviewing Order ${formatCompactId(order.id)}`}
        description="Verify the customer's payment slip and fulfill the shipment with tracking information."
        variant="orders"
      >
        <OrderStatusBadge status={order.status} />
        <Badge variant="outline" className="rounded-full border-white/20 px-3 py-1 text-white/80">
          {formatCurrency(order.totalAmount)}
        </Badge>
        <Badge variant="outline" className="rounded-full border-white/20 px-3 py-1 text-white/80">
          By {order.userName}
        </Badge>
      </AdminPageHero>

      <div className="flex items-center justify-between">
        <Button asChild variant="outline" className="rounded-full">
          <Link href="/admin/orders">
            <ArrowLeft className="size-4" />
            Back to Queue
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <section className="space-y-6">
          {/* Order Items Table */}
          <article className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
            <div className="mb-6 flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                <ReceiptText className="size-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">Snapshot Content</h2>
                <p className="text-sm text-muted-foreground">Pricing locked at purchase time.</p>
              </div>
            </div>

            <div className="overflow-hidden rounded-2xl border border-border/40">
              <table className="w-full text-left text-sm">
                <thead className="bg-muted/30">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-foreground/80">Product</th>
                    <th className="px-5 py-4 text-center font-semibold text-foreground/80">Qty</th>
                    <th className="px-5 py-4 text-right font-semibold text-foreground/80">Price</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {order.items.map((item) => (
                    <tr key={item.id} className="group hover:bg-muted/10 transition-colors">
                      <td className="px-5 py-4">
                        {item.productSlug ? (
                          <Link 
                            href={buildProductPath(item.productSlug)}
                            className="font-medium text-foreground hover:text-primary transition-colors"
                          >
                            {item.productNameAtPurchase}
                          </Link>
                        ) : (
                          <span className="font-medium text-foreground">
                            {item.productNameAtPurchase}
                          </span>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center text-muted-foreground">
                        {item.quantity}
                      </td>
                      <td className="px-5 py-4 text-right font-medium text-foreground">
                        {formatCurrency(item.priceAtPurchase)}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-muted/5">
                    <td colSpan={2} className="px-5 py-4 font-semibold text-foreground/70">
                      Total Order Amount
                    </td>
                    <td className="px-5 py-4 text-right text-lg font-bold text-primary">
                      {formatCurrency(order.totalAmount)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
          
          {/* Action Center - Status Update */}
          <AdminOrderUpdateStatusForm order={order} />
        </section>

        <aside className="space-y-6">
          {/* Customer Profile & Timeline */}
          <article className="rounded-[2.25rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
            <div className="mb-5 flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <User className="size-4" />
              </span>
              <div>
                <h2 className="text-base font-semibold text-foreground">Audit Stats</h2>
                <p className="text-xs text-muted-foreground">Order lifecycle stamps.</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl bg-muted/25 p-4 border border-border/30">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mt-0.5">Created</p>
                <p className="mt-1 text-sm font-medium text-foreground">{formatAccountDateTime(order.createdAt)}</p>
              </div>
              <div className="rounded-2xl bg-muted/25 p-4 border border-border/30">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground mt-0.5">Updated</p>
                <p className="mt-1 text-sm font-medium text-foreground">{formatAccountDateTime(order.updatedAt)}</p>
              </div>
              {order.paymentSubmittedAt && (
                <div className="rounded-2xl bg-primary/5 p-4 border border-primary/10">
                  <p className="text-[10px] font-semibold tracking-widest uppercase text-primary/70 mt-0.5">Payment In</p>
                  <p className="mt-1 text-sm font-medium text-foreground">{formatAccountDateTime(order.paymentSubmittedAt)}</p>
                </div>
              )}
            </div>
          </article>

          {/* Payment Slip Viewer */}
          <article className="overflow-hidden rounded-[2.25rem] border border-border/70 bg-card/95 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
            <div className="p-6">
              <div className="mb-5 flex items-center gap-3">
                <span className="inline-flex size-10 items-center justify-center rounded-full bg-amber-500/10 text-amber-600">
                  <Info className="size-4" />
                </span>
                <div>
                  <h2 className="text-base font-semibold text-foreground text-amber-700 dark:text-amber-500">Slip Verification</h2>
                  <p className="text-xs text-muted-foreground">Verify the transfer before approval.</p>
                </div>
              </div>

              {order.paymentSlipUrl ? (
                 <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl border border-border/60 bg-muted/30">
                    <Image
                      loader={cloudinaryLoader}
                      src={order.paymentSlipUrl}
                      alt="Payment Slip Proof"
                      fill
                      className="object-contain transition-transform duration-500 hover:scale-105"
                      sizes="(max-width: 1280px) 100vw, 360px"
                    />
                    <Button
                      asChild
                      variant="secondary"
                      size="sm"
                      className="absolute bottom-4 right-4 h-9 rounded-full bg-background/80 hover:bg-background backdrop-blur-md"
                    >
                      <Link href={order.paymentSlipUrl} target="_blank" rel="noreferrer">
                        Open Full
                        <ExternalLink className="ml-2 size-3.5" />
                      </Link>
                    </Button>
                 </div>
              ) : (
                <div className="flex aspect-[3/4] flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/10 text-center">
                   <ImageOff className="size-8 text-muted-foreground/30" />
                   <p className="mt-3 text-sm font-medium text-muted-foreground/60">No slip uploaded yet</p>
                </div>
              )}
            </div>
          </article>
        </aside>
      </div>
    </div>
  );
}
