export const buildAccountOrderPath = (orderId: string): string => {
  return `/orders/${encodeURIComponent(orderId)}`;
};
