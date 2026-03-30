export const INVENTORY_THRESHOLDS = {
  CRITICAL: 0,
  LOW: 5,
  MAX_QTY_SELECTOR: 10, // Common limit for quantity selectors unless stock is lower
};

export type StockStatus = "OUT_OF_STOCK" | "LOW_STOCK" | "IN_STOCK";

export const getStockStatus = (stock: number): StockStatus => {
  if (stock <= INVENTORY_THRESHOLDS.CRITICAL) {
    return "OUT_OF_STOCK";
  }

  if (stock <= INVENTORY_THRESHOLDS.LOW) {
    return "LOW_STOCK";
  }

  return "IN_STOCK";
};
