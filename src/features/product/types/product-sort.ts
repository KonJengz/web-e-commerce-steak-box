export const DEFAULT_PRODUCT_SORT = "created_desc" as const;

export const PRODUCT_SORT_OPTIONS = [
  { label: "Newest", value: "created_desc" },
  { label: "Oldest", value: "created_asc" },
  { label: "Price: Low → High", value: "price_asc" },
  { label: "Price: High → Low", value: "price_desc" },
] as const;

export type ProductSortValue = (typeof PRODUCT_SORT_OPTIONS)[number]["value"];

const PRODUCT_SORT_SET = new Set<ProductSortValue>(
  PRODUCT_SORT_OPTIONS.map((option) => option.value),
);

export const isProductSortValue = (
  value: string,
): value is ProductSortValue => {
  return PRODUCT_SORT_SET.has(value as ProductSortValue);
};

export const normalizeProductSort = (value: string): ProductSortValue => {
  return isProductSortValue(value) ? value : DEFAULT_PRODUCT_SORT;
};
