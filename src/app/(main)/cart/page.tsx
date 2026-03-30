import type { Metadata } from "next";
import { CartPageClient } from "@/features/cart/components/cart-page-client";
import { PRIVATE_ROUTE_ROBOTS } from "@/lib/metadata";

export const metadata: Metadata = {
  robots: PRIVATE_ROUTE_ROBOTS,
  title: "Cart — Steak Box",
};

export default function CartPage() {
  return <CartPageClient />;
}
