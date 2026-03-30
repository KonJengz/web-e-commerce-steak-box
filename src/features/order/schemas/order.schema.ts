import { z } from "zod";

import { ORDER_STATUS_VALUES } from "@/features/order/types/order-status";

const ORDER_PAYMENT_SLIP_ACCEPTED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
] as const;

const isFileLike = (value: unknown): value is File => {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as File).name === "string" &&
    typeof (value as File).size === "number" &&
    typeof (value as File).type === "string"
  );
};

export const ORDER_PAYMENT_SLIP_ACCEPT =
  ORDER_PAYMENT_SLIP_ACCEPTED_TYPES.join(",");
export const ORDER_PAYMENT_SLIP_MAX_SIZE_MB = 5;

export const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        productId: z.string().uuid("Invalid product selected."),
        quantity: z
          .number()
          .int("Quantity must be a whole number.")
          .positive("Quantity must be at least 1."),
      }),
    )
    .min(1, "Your cart is empty."),
  shippingAddressId: z.string().uuid("Choose a delivery address."),
});

export const checkoutOrderFormSchema = createOrderSchema.pick({
  shippingAddressId: true,
});

export const orderPaymentSlipSchema = z.object({
  slip: z
    .custom<File>((value) => isFileLike(value) && value.size > 0, {
      message: "Upload a payment slip image.",
    })
    .refine(
      (file) =>
        ORDER_PAYMENT_SLIP_ACCEPTED_TYPES.includes(
          file.type as (typeof ORDER_PAYMENT_SLIP_ACCEPTED_TYPES)[number],
        ),
      {
        message: "Please choose JPG, PNG, or WEBP images only.",
      },
    )
    .refine(
      (file) => file.size <= ORDER_PAYMENT_SLIP_MAX_SIZE_MB * 1024 * 1024,
      {
        message: `Payment slip must be ${ORDER_PAYMENT_SLIP_MAX_SIZE_MB} MB or smaller.`,
      },
    ),
});

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

export type CreateOrderInput = z.output<typeof createOrderSchema>;
export type CheckoutOrderFormInput = z.input<typeof checkoutOrderFormSchema>;
export type CheckoutOrderFormValues = z.output<typeof checkoutOrderFormSchema>;
export type OrderPaymentSlipInput = z.input<typeof orderPaymentSlipSchema>;
export type OrderPaymentSlipValues = z.output<typeof orderPaymentSlipSchema>;
export type UpdateAdminOrderInput = z.input<typeof updateAdminOrderSchema>;
export type UpdateAdminOrderValues = z.output<typeof updateAdminOrderSchema>;
