"use client";

import Link from "next/link";
import { 
  ArrowRight, 
  Calendar, 
  ChevronRight, 
  ClipboardList, 
  Mail, 
  User 
} from "lucide-react";

import { 
  formatAccountDateTime, 
  formatCompactId, 
  formatCurrency 
} from "@/components/account/account.utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { OrderStatusBadge } from "@/features/order/components/order-status-badge";
import type { AdminOrder } from "@/features/order/types/order.type";
import { cn } from "@/lib/utils";

interface AdminOrderListProps {
  orders: AdminOrder[];
}

export function AdminOrderList({ orders }: AdminOrderListProps) {
  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-dashed border-border/60 bg-muted/20 px-8 py-20 text-center">
        <div className="inline-flex size-16 items-center justify-center rounded-full bg-muted/40 text-muted-foreground/60 shadow-inner">
          <ClipboardList className="size-8" />
        </div>
        <h3 className="mt-6 text-xl font-semibold tracking-tight text-foreground">
          No orders found in this queue
        </h3>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
          Try adjusting your filters or search query to find specific order snapshots.
        </p>
      </div>
    );
  }

  return (
    <div className="stagger-children space-y-4">
      {orders.map((order) => (
        <article
          key={order.id}
          className="group relative overflow-hidden rounded-[2.25rem] border border-border/45 bg-card/95 p-5 shadow-[0_12px_40px_rgba(0,0,0,0.04)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-card hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)]"
        >
          {/* Subtle accent line for status */}
          <div className="absolute inset-y-0 left-0 w-1 bg-primary/10 transition-colors group-hover:bg-primary/25" />

          <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
            <div className="space-y-5">
              {/* Header Info */}
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-mono text-sm font-semibold tracking-tight text-foreground/80">
                  {formatCompactId(order.id)}
                </span>
                <OrderStatusBadge status={order.status} />
                {order.trackingNumber && (
                   <Badge variant="outline" className="rounded-full border-primary/20 bg-primary/8 px-2.5 py-0.5 text-[11px] font-medium text-foreground">
                     {order.trackingNumber}
                   </Badge>
                )}
              </div>

              {/* Customer & Details Grid */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/40 text-muted-foreground/70">
                    <User className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/60">
                      Customer
                    </p>
                    <p className="truncate text-sm font-medium text-foreground">
                      {order.userName}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/40 text-muted-foreground/70">
                    <Mail className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/60">
                      Contact
                    </p>
                    <p className="truncate text-sm font-medium text-foreground">
                      {order.userEmail}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="mt-0.5 inline-flex size-8 shrink-0 items-center justify-center rounded-full bg-muted/40 text-muted-foreground/70">
                    <Calendar className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/60">
                      Date
                    </p>
                    <p className="truncate text-sm font-medium text-foreground">
                      {formatAccountDateTime(order.createdAt)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions & Total */}
            <div className="flex flex-row items-center justify-between gap-4 border-t border-border/40 pt-4 lg:flex-col lg:items-end lg:justify-center lg:border-t-0 lg:pt-0">
              <div className="text-right">
                <p className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/60">
                  Total Amount
                </p>
                <p className="mt-0.5 text-xl font-bold tracking-tight text-foreground">
                  {formatCurrency(order.totalAmount)}
                </p>
              </div>

              <Button
                asChild
                className="group/btn h-11 rounded-full px-6 transition-all active:scale-[0.98]"
              >
                <Link href={`/admin/orders/${order.id}`}>
                  Manage Order
                  <ChevronRight className="size-4 transition-transform group-hover/btn:translate-x-0.5" />
                </Link>
              </Button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
