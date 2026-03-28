export const DEFAULT_PRODUCT_DIRECTORY_VIEW = "list" as const;

export const PRODUCT_DIRECTORY_VIEW_OPTIONS = [
  { label: "List", value: "list" },
  { label: "Cards", value: "card" },
] as const;

export type ProductDirectoryView =
  (typeof PRODUCT_DIRECTORY_VIEW_OPTIONS)[number]["value"];

const PRODUCT_DIRECTORY_VIEW_SET = new Set<ProductDirectoryView>(
  PRODUCT_DIRECTORY_VIEW_OPTIONS.map((option) => option.value),
);

export const isProductDirectoryView = (
  value: string,
): value is ProductDirectoryView => {
  return PRODUCT_DIRECTORY_VIEW_SET.has(value as ProductDirectoryView);
};

export const normalizeProductDirectoryView = (
  value: string,
): ProductDirectoryView => {
  return isProductDirectoryView(value) ? value : DEFAULT_PRODUCT_DIRECTORY_VIEW;
};
