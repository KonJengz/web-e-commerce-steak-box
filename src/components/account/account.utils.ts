export const formatAccountDate = (value: string): string => {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
};

export const formatAccountDateTime = (value: string): string => {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
};

export const formatCurrency = (value: string | number): string => {
  const amount = typeof value === "number" ? value : Number(value);

  return new Intl.NumberFormat("en-US", {
    currency: "THB",
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
    style: "currency",
  }).format(Number.isFinite(amount) ? amount : 0);
};

export const formatCompactId = (value: string): string => {
  if (value.length <= 12) {
    return value;
  }

  return `${value.slice(0, 8)}...${value.slice(-4)}`;
};
