import { z } from "zod";

import { ORDER_STATUS_VALUES } from "@/features/order/types/order-status";

export const updateAdminOrderSchema = z.object({
  status: z.enum(ORDER_STATUS_VALUES, {
    error: "Choose a valid order status.",
  }),
  trackingNumber: z
    .string()
    .trim()
    .max(100, "Tracking number must be at most 100 characters.")
    .optional()
    .transform((value) => {
      return value && value.length > 0 ? value : undefined;
    }),
});

export type UpdateAdminOrderInput = z.input<typeof updateAdminOrderSchema>;
export type UpdateAdminOrderValues = z.output<typeof updateAdminOrderSchema>;
