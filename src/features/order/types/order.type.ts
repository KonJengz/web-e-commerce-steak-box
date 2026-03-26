export interface Order {
  createdAt: string;
  id: string;
  shippingAddressId: string | null;
  status: string;
  totalAmount: string;
  userId: string;
}

export interface OrderItem {
  id: string;
  orderId: string;
  priceAtPurchase: string;
  productId: string;
  productNameAtPurchase: string;
  quantity: number;
}

export interface OrderDetail extends Order {
  items: OrderItem[];
}
