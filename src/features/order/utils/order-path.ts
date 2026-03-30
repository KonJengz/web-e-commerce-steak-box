export const buildAccountOrderPath = (orderId: string): string => {
  return `/orders/${encodeURIComponent(orderId)}`;
};

export const buildAdminOrderPath = (orderId: string): string => {
  return `/admin/orders/${encodeURIComponent(orderId)}`;
};
