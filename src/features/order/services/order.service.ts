import "server-only";

import type { UpdateAdminOrderValues } from "@/features/order/schemas/order.schema";
import { normalizeOrderStatus } from "@/features/order/types/order-status";
import type {
  AdminOrder,
  AdminOrderDetail,
  Order,
  OrderDetail,
  OrderItem,
} from "@/features/order/types/order.type";
import { api } from "@/lib/api/client";
import type { ApiResult, PaginatedResponse } from "@/types";

interface OrderApiResponse {
  created_at: string;
  id: string;
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
  product_name_at_purchase: string;
  quantity: number;
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
  total: number;
  total_pages: number;
}

interface GetOrdersOptions {
  limit?: number;
  page?: number;
}

const mapOrderItem = (orderItem: OrderItemApiResponse): OrderItem => {
  return {
    id: orderItem.id,
    orderId: orderItem.order_id,
    priceAtPurchase: orderItem.price_at_purchase,
    productId: orderItem.product_id,
    productNameAtPurchase: orderItem.product_name_at_purchase,
    quantity: orderItem.quantity,
  };
};

const mapOrder = (order: OrderApiResponse): Order => {
  return {
    createdAt: order.created_at,
    id: order.id,
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

const buildOrdersQueryString = (options: GetOrdersOptions): string => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;

  return new URLSearchParams({
    limit: String(limit),
    page: String(page),
  }).toString();
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

const getAdminAll = async (
  accessToken: string,
  options: GetOrdersOptions = {},
): Promise<ApiResult<PaginatedResponse<AdminOrder>>> => {
  const result = await api.get<AdminOrdersApiResponse>(
    `/api/orders/admin?${buildOrdersQueryString(options)}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return {
    ...result,
    data: {
      items: result.data.data.map(mapAdminOrder),
      limit: result.data.limit,
      page: result.data.page,
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
  getAll,
  getAdminAll,
  getAdminById,
  getById,
  updateAdmin,
};
