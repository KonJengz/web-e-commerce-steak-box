import type { CartItem } from "@/features/cart/types/cart.type";

export interface CartOverview {
  blockerCount: number;
  canCheckout: boolean;
  distinctItems: number;
  totalUnits: number;
}

export const countCartUnits = (items: readonly CartItem[]): number => {
  return items.reduce((total, item) => total + item.quantity, 0);
};

export const countCartBlockers = (items: readonly CartItem[]): number => {
  return items.filter((item) => !item.isActive || item.stock < item.quantity)
    .length;
};

export const buildCartOverview = (
  items: readonly CartItem[],
): CartOverview => {
  const distinctItems = items.length;
  const totalUnits = countCartUnits(items);
  const blockerCount = countCartBlockers(items);

  return {
    blockerCount,
    canCheckout: distinctItems > 0 && blockerCount === 0,
    distinctItems,
    totalUnits,
  };
};
