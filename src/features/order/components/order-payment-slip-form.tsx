"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ExternalLink, Loader2, RefreshCcw, Upload } from "lucide-react";
import { useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import { uploadOrderPaymentSlipAction } from "@/features/order/actions/upload-order-payment-slip.action";
import {
  ORDER_PAYMENT_SLIP_ACCEPT,
  ORDER_PAYMENT_SLIP_MAX_SIZE_MB,
  orderPaymentSlipSchema,
  type OrderPaymentSlipInput,
} from "@/features/order/schemas/order.schema";

interface OrderPaymentSlipFormProps {
  orderId: string;
  paymentSlipUrl?: string | null;
  redirectPath: string;
}

export function OrderPaymentSlipForm({
  orderId,
  paymentSlipUrl = null,
  redirectPath,
}: OrderPaymentSlipFormProps) {
  const router = useRouter();
  const [fileInputKey, setFileInputKey] = useState<number>(0);
  const [isPending, startTransition] = useTransition();
  const [submissionMessage, setSubmissionMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const {
    control,
    clearErrors,
    handleSubmit,
    reset,
    setError,
  } = useForm<OrderPaymentSlipInput>({
    defaultValues: {
      slip: undefined,
    },
    resolver: zodResolver(orderPaymentSlipSchema),
  });
  const selectedSlip = useWatch({
    control,
    name: "slip",
  });

  const resetSlipSelection = (): void => {
    reset({
      slip: undefined,
    });
    setFileInputKey((currentKey) => currentKey + 1);
  };

  const handleUploadSlip = (values: OrderPaymentSlipInput): void => {
    clearErrors();
    setSubmissionMessage(null);
    setIsSuccess(false);

    const formData = new FormData();

    if (values.slip) {
      formData.set("slip", values.slip);
    }

    startTransition(async () => {
      const result = await uploadOrderPaymentSlipAction(orderId, formData);

      if (!result.success) {
        setSubmissionMessage(result.message ?? null);

        if (result.fieldErrors?.slip?.[0]) {
          setError("slip", {
            message: result.fieldErrors.slip[0],
            type: "server",
          });
        }

        if (result.requiresReauthentication) {
          router.replace(buildLoginRedirectPath(redirectPath));
        }

        return;
      }

      setSubmissionMessage(result.message ?? null);
      setIsSuccess(true);
      resetSlipSelection();
      router.refresh();
    });
  };

  return (
    <form className="space-y-5" noValidate onSubmit={handleSubmit(handleUploadSlip)}>
      {submissionMessage ? (
        <div
          className={
            isSuccess
              ? "rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-700 dark:text-emerald-300"
              : "rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm leading-6 whitespace-pre-line text-destructive"
          }
        >
          {submissionMessage}
        </div>
      ) : null}

      {paymentSlipUrl ? (
        <div className="rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3 text-sm leading-6 text-muted-foreground">
          <p className="font-medium text-foreground">Current payment slip</p>
          <div className="mt-2">
            <Button asChild variant="outline" className="rounded-full">
              <Link href={paymentSlipUrl} target="_blank" rel="noreferrer">
                View uploaded slip
                <ExternalLink className="size-4" />
              </Link>
            </Button>
          </div>
        </div>
      ) : null}

      <Controller
        control={control}
        name="slip"
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>Payment Slip</FieldLabel>
            <Input
              key={fileInputKey}
              id={field.name}
              name={field.name}
              type="file"
              accept={ORDER_PAYMENT_SLIP_ACCEPT}
              aria-invalid={fieldState.invalid}
              className="h-12 rounded-[1.25rem] px-4 py-3"
              disabled={isPending}
              onBlur={field.onBlur}
              onChange={(event) => {
                const file = event.target.files?.[0];
                field.onChange(file);
              }}
            />
            <p className="text-sm leading-6 text-muted-foreground">
              JPG, PNG, or WEBP. Maximum {ORDER_PAYMENT_SLIP_MAX_SIZE_MB} MB.
            </p>
            {selectedSlip ? (
              <p className="text-sm font-medium text-foreground">
                Ready to upload: {selectedSlip.name}
              </p>
            ) : null}
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button type="submit" className="h-12 rounded-full" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Uploading...
            </>
          ) : (
            <>
              <Upload className="size-4" />
              {paymentSlipUrl ? "Replace Slip" : "Upload Slip"}
            </>
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={isPending || !selectedSlip}
          onClick={resetSlipSelection}
        >
          <RefreshCcw className="size-4" />
          Clear Selection
        </Button>
      </div>
    </form>
  );
}
