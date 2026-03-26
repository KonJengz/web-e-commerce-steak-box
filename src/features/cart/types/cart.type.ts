export interface CartItem {
  createdAt: string;
  currentPrice: string;
  id: string;
  isActive: boolean;
  productId: string;
  productImageUrl: string | null;
  productName: string;
  quantity: number;
  stock: number;
  updatedAt: string;
}

export interface Cart {
  createdAt: string;
  id: string;
  items: CartItem[];
  totalAmount: string;
  updatedAt: string;
  userId: string;
}
