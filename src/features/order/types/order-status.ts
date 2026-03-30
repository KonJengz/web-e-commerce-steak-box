export const ORDER_STATUS_VALUES = [
  "PENDING",
  "PAYMENT_REVIEW",
  "PAYMENT_FAILED",
  "PAID",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
] as const;

export type OrderStatus = (typeof ORDER_STATUS_VALUES)[number];

export interface OrderStatusMeta {
  description: string;
  label: string;
}

export const ORDER_STATUS_META: Record<OrderStatus, OrderStatusMeta> = {
  CANCELLED: {
    description: "Inventory has been released and the order is closed.",
    label: "Cancelled",
  },
  DELIVERED: {
    description: "The parcel arrived and only tracking corrections remain.",
    label: "Delivered",
  },
  PAYMENT_FAILED: {
    description:
      "Payment could not be confirmed. The customer needs to upload a new slip.",
    label: "Payment Failed",
  },
  PAYMENT_REVIEW: {
    description:
      "A payment slip is waiting for an admin review before fulfillment can continue.",
    label: "Payment Review",
  },
  PAID: {
    description: "Payment is confirmed and the order can move into dispatch.",
    label: "Paid",
  },
  PENDING: {
    description:
      "The order is waiting for the customer to submit payment or for admin cancellation.",
    label: "Pending",
  },
  SHIPPED: {
    description: "The parcel left the warehouse and should carry a tracking number.",
    label: "Shipped",
  },
};

const ORDER_STATUS_SET = new Set<string>(ORDER_STATUS_VALUES);

export const normalizeOrderStatus = (value: string): OrderStatus => {
  const normalizedValue = value.trim().toUpperCase();

  if (ORDER_STATUS_SET.has(normalizedValue)) {
    return normalizedValue as OrderStatus;
  }

  return "PENDING";
};

export const normalizeOptionalOrderStatus = (
  value: string | null | undefined,
): OrderStatus | null => {
  const normalizedValue = value?.trim().toUpperCase();

  if (!normalizedValue) {
    return null;
  }

  if (ORDER_STATUS_SET.has(normalizedValue)) {
    return normalizedValue as OrderStatus;
  }

  return null;
};

export const getOrderStatusLabel = (status: OrderStatus): string => {
  return ORDER_STATUS_META[status].label;
};

export const orderStatusSupportsTracking = (
  status: OrderStatus,
): boolean => {
  return status === "SHIPPED" || status === "DELIVERED";
};

export const getAllowedAdminOrderStatuses = (
  currentStatus: OrderStatus,
): readonly OrderStatus[] => {
  switch (currentStatus) {
    case "PENDING":
      return ["PENDING", "PAYMENT_REVIEW", "CANCELLED"];
    case "PAYMENT_REVIEW":
      return ["PAYMENT_REVIEW", "PAID", "PAYMENT_FAILED", "CANCELLED"];
    case "PAYMENT_FAILED":
      return ["PAYMENT_FAILED", "PAYMENT_REVIEW", "CANCELLED"];
    case "PAID":
      return ["PAID", "SHIPPED", "CANCELLED"];
    case "SHIPPED":
      return ["SHIPPED", "DELIVERED"];
    case "DELIVERED":
      return ["DELIVERED"];
    case "CANCELLED":
      return ["CANCELLED"];
  }
};

export const isOrderStatusImmutable = (status: OrderStatus): boolean => {
  return status === "CANCELLED";
};
