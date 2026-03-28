import "server-only";

import type { Cart, CartItem } from "@/features/cart/types/cart.type";
import { api } from "@/lib/api/client";
import type { ApiResult } from "@/types";

interface CartItemApiResponse {
  created_at: string;
  current_price: string;
  id: string;
  is_active: boolean;
  product_id: string;
  product_image_url: string | null;
  product_name: string;
  quantity: number;
  stock: number;
  updated_at: string;
}

interface CartApiResponse {
  created_at: string;
  id: string;
  items: CartItemApiResponse[];
  total_amount: string;
  updated_at: string;
  user_id: string;
}

const mapCartItem = (item: CartItemApiResponse): CartItem => {
  return {
    createdAt: item.created_at,
    currentPrice: item.current_price,
    id: item.id,
    isActive: item.is_active,
    productId: item.product_id,
    productImageUrl: item.product_image_url,
    productName: item.product_name,
    quantity: item.quantity,
    stock: item.stock,
    updatedAt: item.updated_at,
  };
};

const mapCart = (cart: CartApiResponse): Cart => {
  return {
    createdAt: cart.created_at,
    id: cart.id,
    items: cart.items.map(mapCartItem),
    totalAmount: cart.total_amount,
    updatedAt: cart.updated_at,
    userId: cart.user_id,
  };
};

const getCurrent = async (accessToken: string): Promise<ApiResult<Cart>> => {
  const result = await api.get<CartApiResponse>("/api/carts", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  return {
    ...result,
    data: mapCart(result.data),
  };
};

const addItem = async (
  accessToken: string,
  productId: string,
  quantity: number,
): Promise<ApiResult<Cart>> => {
  const result = await api.post<CartApiResponse>(
    "/api/carts/items",
    {
      product_id: productId,
      quantity,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return {
    ...result,
    data: mapCart(result.data),
  };
};

const updateItem = async (
  accessToken: string,
  productId: string,
  quantity: number,
): Promise<ApiResult<Cart>> => {
  const result = await api.put<CartApiResponse>(
    `/api/carts/items/${productId}`,
    {
      quantity,
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return {
    ...result,
    data: mapCart(result.data),
  };
};

const removeItem = async (
  accessToken: string,
  productId: string,
): Promise<ApiResult<Cart>> => {
  const result = await api.delete<CartApiResponse>(
    `/api/carts/items/${productId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    },
  );

  return {
    ...result,
    data: mapCart(result.data),
  };
};

const clear = async (accessToken: string): Promise<ApiResult<null>> => {
  return api.delete<null>("/api/carts", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const cartService = {
  addItem,
  clear,
  getCurrent,
  removeItem,
  updateItem,
};
