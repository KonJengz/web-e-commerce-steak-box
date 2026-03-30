export const buildProductPath = (identifier: string): string => {
  return `/products/${encodeURIComponent(identifier)}`;
};
