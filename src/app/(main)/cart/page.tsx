import type { Metadata } from "next";
import { CartPageClient } from "@/features/cart/components/cart-page-client";
import { BASE_PRIVATE_METADATA } from "@/lib/metadata";

export const metadata: Metadata = {
  ...BASE_PRIVATE_METADATA,
  title: "Your Cart",
};

export default function CartPage() {
  return <CartPageClient />;
}
