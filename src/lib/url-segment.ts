export const normalizeUrlSegment = (value: string): string => {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
};

export const encodeUrlSegment = (value: string): string => {
  return encodeURIComponent(normalizeUrlSegment(value));
};
