import { encodeUrlSegment } from "@/lib/url-segment";

export const buildProductPath = (identifier: string): string => {
  return `/products/${encodeUrlSegment(identifier)}`;
};
