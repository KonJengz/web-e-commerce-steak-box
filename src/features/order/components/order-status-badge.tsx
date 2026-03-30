import {
  adminAccentBadgeClassName,
  adminDangerBadgeClassName,
  adminInfoBadgeClassName,
  adminInactiveBadgeClassName,
  adminMutedBadgeClassName,
  adminSuccessBadgeClassName,
  adminWarningBadgeClassName,
} from "@/components/ui/admin-badge-styles";
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
  CANCELLED: adminInactiveBadgeClassName,
  DELIVERED: adminSuccessBadgeClassName,
  PAYMENT_FAILED: adminDangerBadgeClassName,
  PAYMENT_REVIEW: adminWarningBadgeClassName,
  PAID: adminInfoBadgeClassName,
  PENDING: adminMutedBadgeClassName,
  SHIPPED: adminAccentBadgeClassName,
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
