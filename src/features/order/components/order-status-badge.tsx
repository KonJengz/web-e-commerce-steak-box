import { Badge } from "@/components/ui/badge";
import {
  getOrderStatusLabel,
  type OrderStatus,
} from "@/features/order/types/order-status";
import { cn } from "@/lib/utils";

interface OrderStatusBadgeProps {
  className?: string;
  status: OrderStatus;
}

const orderStatusClassName: Record<OrderStatus, string> = {
  CANCELLED:
    "border border-border/60 bg-muted/40 text-muted-foreground dark:bg-muted/20",
  DELIVERED:
    "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300",
  PAID: "border border-sky-500/20 bg-sky-500/10 text-sky-700 dark:text-sky-300",
  PENDING:
    "border border-amber-500/20 bg-amber-500/10 text-amber-700 dark:text-amber-300",
  SHIPPED:
    "border border-violet-500/20 bg-violet-500/10 text-violet-700 dark:text-violet-300",
};

export function OrderStatusBadge({
  className,
  status,
}: OrderStatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      className={cn(
        "h-auto rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.18em] uppercase",
        orderStatusClassName[status],
        className,
      )}
    >
      {getOrderStatusLabel(status)}
    </Badge>
  );
}
