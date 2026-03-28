export const getCartLineTotal = (
  currentPrice: string,
  quantity: number,
): number => {
  const amount = Number(currentPrice);

  if (!Number.isFinite(amount)) {
    return 0;
  }

  return amount * quantity;
};
