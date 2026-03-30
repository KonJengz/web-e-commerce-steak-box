"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, MapPinned } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { formatCurrency } from "@/components/account/account.utils";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { NativeSelect } from "@/components/ui/native-select";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import { createOrderAction } from "@/features/order/actions/create-order.action";
import {
  checkoutOrderFormSchema,
  type CheckoutOrderFormInput,
} from "@/features/order/schemas/order.schema";
import type { Address } from "@/features/address/types/address.type";

interface CheckoutSubmitFormProps {
  addresses: Address[];
  canSubmit: boolean;
  redirectPath: string;
  totalAmount: string;
  totalUnits: number;
}

export function CheckoutSubmitForm({
  addresses,
  canSubmit,
  redirectPath,
  totalAmount,
  totalUnits,
}: CheckoutSubmitFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const defaultAddressId = useMemo(() => {
    return addresses.find((address) => address.isDefault)?.id ?? addresses[0]?.id ?? "";
  }, [addresses]);
  const {
    control,
    clearErrors,
    handleSubmit,
    reset,
    setError,
  } = useForm<CheckoutOrderFormInput>({
    defaultValues: {
      shippingAddressId: defaultAddressId,
    },
    resolver: zodResolver(checkoutOrderFormSchema),
  });

  useEffect(() => {
    reset({
      shippingAddressId: defaultAddressId,
    });
  }, [defaultAddressId, reset]);

  const handleCreateOrder = (values: CheckoutOrderFormInput): void => {
    clearErrors();
    setSubmissionMessage(null);

    startTransition(async () => {
      const result = await createOrderAction(values);

      if (!result.success) {
        setSubmissionMessage(result.message ?? null);

        if (result.fieldErrors?.shippingAddressId?.[0]) {
          setError("shippingAddressId", {
            message: result.fieldErrors.shippingAddressId[0],
            type: "server",
          });
        }

        if (result.requiresReauthentication) {
          router.replace(buildLoginRedirectPath(redirectPath));
        }

        return;
      }

      router.replace(result.redirectTo ?? "/orders");
    });
  };

  return (
    <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
      <div className="mb-5 flex items-center gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
          <MapPinned className="size-4" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Place Order
          </h2>
          <p className="text-sm text-muted-foreground">
            Choose a delivery address, then continue to payment slip upload.
          </p>
        </div>
      </div>

      {submissionMessage ? (
        <div className="mb-4 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm leading-6 whitespace-pre-line text-destructive">
          {submissionMessage}
        </div>
      ) : null}

      <form className="space-y-5" noValidate onSubmit={handleSubmit(handleCreateOrder)}>
        <Controller
          control={control}
          name="shippingAddressId"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Delivery Address</FieldLabel>
              <NativeSelect
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                className="h-12 rounded-[1.25rem]"
                disabled={isPending || addresses.length === 0}
              >
                <option value="">Choose a saved address</option>
                {addresses.map((address) => (
                  <option key={address.id} value={address.id}>
                    {address.recipientName} · {address.city}
                    {address.isDefault ? " · Default" : ""}
                  </option>
                ))}
              </NativeSelect>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground">
              Order Total
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {formatCurrency(totalAmount)}
            </p>
          </div>
          <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
            <p className="text-xs font-semibold tracking-[0.18em] uppercase text-muted-foreground">
              Units
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">
              {totalUnits}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <Button
            type="submit"
            className="h-12 rounded-full"
            disabled={isPending || !canSubmit || addresses.length === 0}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating order...
              </>
            ) : (
              <>
                Place Order
                <ArrowRight className="size-4" />
              </>
            )}
          </Button>
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/addresses">Manage Addresses</Link>
          </Button>
        </div>
      </form>
    </section>
  );
}
