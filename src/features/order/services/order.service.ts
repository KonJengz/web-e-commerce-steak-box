import "server-only";

import type {
  CreateOrderInput,
  OrderPaymentSlipValues,
  UpdateAdminOrderValues,
} from "@/features/order/schemas/order.schema";
import {
  normalizeOrderStatus,
  type OrderStatus,
} from "@/features/order/types/order-status";
import type {
  AdminOrder,
  AdminOrderDetail,
  AdminOrderListResult,
  AdminOrderSummary,
  Order,
  OrderDetail,
  OrderItem,
  OrderShippingAddressSnapshot,
} from "@/features/order/types/order.type";
import { api } from "@/lib/api/client";
import { resolvePublicIdentifier } from "@/lib/public-identifier";
import type { ApiResult, PaginatedResponse } from "@/types";

interface OrderApiResponse {
  created_at: string;
  id: string;
  payment_slip_url: string | null;
  payment_submitted_at: string | null;
  shipping_address_snapshot: OrderShippingAddressSnapshotApiResponse | null;
  shipping_address_id: string | null;
  status: string;
  total_amount: string;
  tracking_number: string | null;
  updated_at: string;
  user_id: string;
}

interface OrderItemApiResponse {
  id: string;
  order_id: string;
  price_at_purchase: string;
  product_id: string;
  product_slug: string | null;
  product_name_at_purchase: string;
  quantity: number;
}

interface OrderShippingAddressSnapshotApiResponse {
  address_line: string;
  city: string;
  phone: string | null;
  postal_code: string;
  recipient_name: string;
}

interface OrderDetailApiResponse extends OrderApiResponse {
  items: OrderItemApiResponse[];
}

interface OrdersApiResponse {
  data: OrderApiResponse[];
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

interface AdminOrderApiResponse extends OrderApiResponse {
  user_email: string;
  user_name: string;
}

interface AdminOrderDetailApiResponse extends AdminOrderApiResponse {
  items: OrderItemApiResponse[];
}

interface AdminOrdersApiResponse {
  data: AdminOrderApiResponse[];
  limit: number;
  page: number;
  summary?: AdminOrderSummaryApiResponse;
  total: number;
  total_pages: number;
}

interface AdminOrderSummaryApiResponse {
  all: number;
  cancelled: number;
  delivered: number;
  paid: number;
  payment_failed: number;
  payment_review: number;
  pending: number;
  shipped: number;
  tracked: number;
}

interface GetOrdersOptions {
  limit?: number;
  page?: number;
}

interface GetAdminOrdersOptions extends GetOrdersOptions {
  search?: string;
  status?: OrderStatus;
}

const mapOrderItem = (orderItem: OrderItemApiResponse): OrderItem => {
  return {
    id: orderItem.id,
    orderId: orderItem.order_id,
    priceAtPurchase: orderItem.price_at_purchase,
    productId: orderItem.product_id,
    productSlug: orderItem.product_slug
      ? resolvePublicIdentifier(orderItem.product_slug, orderItem.product_id)
      : null,
    productNameAtPurchase: orderItem.product_name_at_purchase,
    quantity: orderItem.quantity,
  };
};

const mapOrderShippingAddressSnapshot = (
  snapshot: OrderShippingAddressSnapshotApiResponse,
): OrderShippingAddressSnapshot => {
  return {
    addressLine: snapshot.address_line,
    city: snapshot.city,
    phone: snapshot.phone,
    postalCode: snapshot.postal_code,
    recipientName: snapshot.recipient_name,
  };
};

const mapOrder = (order: OrderApiResponse): Order => {
  return {
    createdAt: order.created_at,
    id: order.id,
    paymentSlipUrl: order.payment_slip_url,
    paymentSubmittedAt: order.payment_submitted_at,
    shippingAddressSnapshot: order.shipping_address_snapshot
      ? mapOrderShippingAddressSnapshot(order.shipping_address_snapshot)
      : null,
    shippingAddressId: order.shipping_address_id,
    status: normalizeOrderStatus(order.status),
    totalAmount: order.total_amount,
    trackingNumber: order.tracking_number,
    updatedAt: order.updated_at,
    userId: order.user_id,
  };
};

const mapOrderDetail = (order: OrderDetailApiResponse): OrderDetail => {
  return {
    ...mapOrder(order),
    items: order.items.map(mapOrderItem),
  };
};

const mapAdminOrder = (order: AdminOrderApiResponse): AdminOrder => {
  return {
    ...mapOrder(order),
    userEmail: order.user_email,
    userName: order.user_name,
  };
};

const mapAdminOrderDetail = (
  order: AdminOrderDetailApiResponse,
): AdminOrderDetail => {
  return {
    ...mapAdminOrder(order),
    items: order.items.map(mapOrderItem),
  };
};

const mapAdminOrderSummary = (
  summary: AdminOrderSummaryApiResponse,
): AdminOrderSummary => {
  return {
    all: summary.all,
    cancelled: summary.cancelled,
    delivered: summary.delivered,
    paid: summary.paid,
    paymentFailed: summary.payment_failed,
    paymentReview: summary.payment_review,
    pending: summary.pending,
    shipped: summary.shipped,
    tracked: summary.tracked,
  };
};

const buildAdminOrderSummaryFallback = (
  orders: AdminOrder[],
  totalOrders: number,
): AdminOrderSummary => {
  return {
    all: totalOrders,
    cancelled: orders.filter((order) => order.status === "CANCELLED").length,
    delivered: orders.filter((order) => order.status === "DELIVERED").length,
    paid: orders.filter((order) => order.status === "PAID").length,
    paymentFailed: orders.filter((order) => order.status === "PAYMENT_FAILED")
      .length,
    paymentReview: orders.filter((order) => order.status === "PAYMENT_REVIEW")
      .length,
    pending: orders.filter((order) => order.status === "PENDING").length,
    shipped: orders.filter((order) => order.status === "SHIPPED").length,
    tracked: orders.filter((order) => order.trackingNumber).length,
  };
};

const buildOrdersQueryString = (options: GetOrdersOptions): string => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;

  return new URLSearchParams({
    limit: String(limit),
    page: String(page),
  }).toString();
};

const buildAdminOrdersQueryString = (options: GetAdminOrdersOptions): string => {
  const searchParams = new URLSearchParams(buildOrdersQueryString(options));

  if (options.status) {
    searchParams.set("status", options.status);
  }

  if (options.search?.trim()) {
    searchParams.set("search", options.search.trim());
  }

  return searchParams.toString();
};

const getAll = async (
  accessToken: string,
  options: GetOrdersOptions = {},
): Promise<ApiResult<PaginatedResponse<Order>>> => {
  const result = await api.get<OrdersApiResponse>(
    `/api/orders?${buildOrdersQueryString(options)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return {
    ...result,
    data: {
      items: result.data.data.map(mapOrder),
      limit: result.data.limit,
      page: result.data.page,
      total: result.data.total,
      totalPages: result.data.total_pages,
    },
  };
};

const create = async (
  accessToken: string,
  input: CreateOrderInput,
): Promise<ApiResult<OrderDetail>> => {
  const result = await api.post<OrderDetailApiResponse>(
    "/api/orders",
    {
      items: input.items.map((item) => ({
        product_id: item.productId,
        quantity: item.quantity,
      })),
      shipping_address_id: input.shippingAddressId,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return {
    ...result,
    data: mapOrderDetail(result.data),
  };
};

const getById = async (
  accessToken: string,
  orderId: string,
): Promise<ApiResult<OrderDetail>> => {
  const result = await api.get<OrderDetailApiResponse>(`/api/orders/${orderId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    ...result,
    data: mapOrderDetail(result.data),
  };
};

const uploadPaymentSlip = async (
  accessToken: string,
  orderId: string,
  input: OrderPaymentSlipValues,
): Promise<ApiResult<OrderDetail>> => {
  const formData = new FormData();

  formData.set("slip", input.slip);

  const result = await api.put<OrderDetailApiResponse>(
    `/api/orders/${orderId}/payment-slip`,
    formData,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return {
    ...result,
    data: mapOrderDetail(result.data),
  };
};

const getAdminAll = async (
  accessToken: string,
  options: GetAdminOrdersOptions = {},
): Promise<ApiResult<AdminOrderListResult>> => {
  const result = await api.get<AdminOrdersApiResponse>(
    `/api/orders/admin?${buildAdminOrdersQueryString(options)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  const mappedOrders = result.data.data.map(mapAdminOrder);
  const summary = result.data.summary
    ? mapAdminOrderSummary(result.data.summary)
    : buildAdminOrderSummaryFallback(mappedOrders, result.data.total);

  return {
    ...result,
    data: {
      items: mappedOrders,
      limit: result.data.limit,
      page: result.data.page,
      summary,
      total: result.data.total,
      totalPages: result.data.total_pages,
    },
  };
};

const getAdminById = async (
  accessToken: string,
  orderId: string,
): Promise<ApiResult<AdminOrderDetail>> => {
  const result = await api.get<AdminOrderDetailApiResponse>(
    `/api/orders/admin/${orderId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return {
    ...result,
    data: mapAdminOrderDetail(result.data),
  };
};

const updateAdmin = async (
  accessToken: string,
  orderId: string,
  input: UpdateAdminOrderValues,
): Promise<ApiResult<AdminOrderDetail>> => {
  const result = await api.put<AdminOrderDetailApiResponse>(
    `/api/orders/admin/${orderId}`,
    {
      status: input.status,
      tracking_number: input.trackingNumber,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return {
    ...result,
    data: mapAdminOrderDetail(result.data),
  };
};

export const orderService = {
  create,
  getAll,
  getAdminAll,
  getAdminById,
  getById,
  uploadPaymentSlip,
  updateAdmin,
};
