import { encodeUrlSegment } from "@/lib/url-segment";

export const buildCategoryPath = (identifier: string): string => {
  return `/categories/${encodeUrlSegment(identifier)}`;
};
