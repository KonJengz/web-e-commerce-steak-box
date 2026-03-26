import "server-only";

import type { Order } from "@/features/order/types/order.type";
import { api } from "@/lib/api/client";
import type { ApiResult, PaginatedResponse } from "@/types";

interface OrderApiResponse {
  created_at: string;
  id: string;
  shipping_address_id: string | null;
  status: string;
  total_amount: string;
  user_id: string;
}

interface OrdersApiResponse {
  data: OrderApiResponse[];
  limit: number;
  page: number;
  total: number;
  total_pages: number;
}

interface GetOrdersOptions {
  limit?: number;
  page?: number;
}

const mapOrder = (order: OrderApiResponse): Order => {
  return {
    createdAt: order.created_at,
    id: order.id,
    shippingAddressId: order.shipping_address_id,
    status: order.status,
    totalAmount: order.total_amount,
    userId: order.user_id,
  };
};

const getAll = async (
  accessToken: string,
  options: GetOrdersOptions = {},
): Promise<ApiResult<PaginatedResponse<Order>>> => {
  const page = options.page ?? 1;
  const limit = options.limit ?? 20;
  const query = new URLSearchParams({
    limit: String(limit),
    page: String(page),
  });
  const result = await api.get<OrdersApiResponse>(`/api/orders?${query.toString()}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

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

export const orderService = {
  getAll,
};
