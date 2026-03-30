export const buildCategoryPath = (identifier: string): string => {
  return `/categories/${encodeURIComponent(identifier)}`;
};
