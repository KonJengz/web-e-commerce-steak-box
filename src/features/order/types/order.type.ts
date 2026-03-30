import type { PaginatedResponse } from "@/types";
import type { OrderStatus } from "@/features/order/types/order-status";

export interface Order {
  createdAt: string;
  id: string;
  paymentSlipUrl: string | null;
  paymentSubmittedAt: string | null;
  shippingAddressId: string | null;
  status: OrderStatus;
  totalAmount: string;
  trackingNumber: string | null;
  updatedAt: string;
  userId: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  priceAtPurchase: string;
  productId: string;
  productSlug: string | null;
  productNameAtPurchase: string;
  quantity: number;
}

export interface CreateOrderActionState {
  fieldErrors?: {
    shippingAddressId?: string[];
  };
  message?: string;
  order?: OrderDetail;
  redirectTo?: string;
  requiresReauthentication?: boolean;
  success: boolean;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
}

export interface AdminOrder extends Order {
  userEmail: string;
  userName: string;
}

export interface AdminOrderDetail extends AdminOrder {
  items: OrderItem[];
}

export interface AdminOrderSummary {
  all: number;
  cancelled: number;
  delivered: number;
  paid: number;
  paymentFailed: number;
  paymentReview: number;
  pending: number;
  shipped: number;
  tracked: number;
}

export const EMPTY_ADMIN_ORDER_SUMMARY: AdminOrderSummary = {
  all: 0,
  cancelled: 0,
  delivered: 0,
  paid: 0,
  paymentFailed: 0,
  paymentReview: 0,
  pending: 0,
  shipped: 0,
  tracked: 0,
};

export interface UpdateAdminOrderActionState {
  fieldErrors?: {
    status?: string[];
    trackingNumber?: string[];
  };
  message?: string;
  order?: AdminOrderDetail;
  requiresAdmin?: boolean;
  requiresReauthentication?: boolean;
  success: boolean;
}

export interface UploadOrderPaymentSlipActionState {
  fieldErrors?: {
    slip?: string[];
  };
  message?: string;
  order?: OrderDetail;
  requiresReauthentication?: boolean;
  success: boolean;
}

export type OrderListResult = PaginatedResponse<Order>;
export interface AdminOrderListResult extends PaginatedResponse<AdminOrder> {
  summary: AdminOrderSummary;
}
