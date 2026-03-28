"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import { updateAdminOrderAction } from "@/features/order/actions/update-admin-order.action";
import {
  updateAdminOrderSchema,
  type UpdateAdminOrderInput,
} from "@/features/order/schemas/order.schema";
import {
  getAllowedAdminOrderStatuses,
  getOrderStatusLabel,
  isOrderStatusImmutable,
  ORDER_STATUS_META,
  orderStatusSupportsTracking,
} from "@/features/order/types/order-status";
import type {
  AdminOrderDetail,
  UpdateAdminOrderActionState,
} from "@/features/order/types/order.type";
import { cn } from "@/lib/utils";

const SUCCESS_NOTICE_DURATION_MS = 3000;

const selectClassName =
  "flex h-11 w-full rounded-xl border border-border/50 bg-muted/30 px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";

const buildDefaultValues = (
  order: AdminOrderDetail,
): UpdateAdminOrderInput => {
  return {
    status: order.status,
    trackingNumber: order.trackingNumber ?? "",
  };
};

interface AdminOrderStatusFormProps {
  order: AdminOrderDetail;
  redirectPath: string;
}

export function AdminOrderStatusForm({
  order,
  redirectPath,
}: AdminOrderStatusFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submissionState, setSubmissionState] =
    useState<UpdateAdminOrderActionState | null>(null);
  const defaultValues = useMemo(() => buildDefaultValues(order), [order]);
  const {
    control,
    clearErrors,
    formState,
    handleSubmit,
    reset,
    setError,
  } = useForm<UpdateAdminOrderInput>({
    defaultValues,
    resolver: zodResolver(updateAdminOrderSchema),
  });
  const selectedStatus =
    useWatch({
      control,
      name: "status",
    }) ?? order.status;
  const availableStatuses = useMemo(() => {
    return getAllowedAdminOrderStatuses(order.status);
  }, [order.status]);
  const selectedStatusMeta = ORDER_STATUS_META[selectedStatus];
  const canEditTracking = orderStatusSupportsTracking(selectedStatus);
  const isCancelledState = isOrderStatusImmutable(order.status);
  const submitLabel = canEditTracking && selectedStatus === order.status
    ? "Update tracking"
    : "Save order";

  useEffect(() => {
    if (!submissionState?.success || !submissionState.message) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setSubmissionState((currentState) => {
        if (!currentState?.success) {
          return currentState;
        }

        return null;
      });
    }, SUCCESS_NOTICE_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [submissionState]);

  const applyServerErrors = (state: UpdateAdminOrderActionState): void => {
    const statusError = state.fieldErrors?.status?.[0];
    const trackingNumberError = state.fieldErrors?.trackingNumber?.[0];

    if (statusError) {
      setError("status", {
        message: statusError,
        type: "server",
      });
    }

    if (trackingNumberError) {
      setError("trackingNumber", {
        message: trackingNumberError,
        type: "server",
      });
    }
  };

  const handleUpdateOrder = (values: UpdateAdminOrderInput): void => {
    const trimmedTrackingNumber = values.trackingNumber?.trim() ?? "";
    const hasTrackingNumber =
      trimmedTrackingNumber.length > 0 ||
      (order.trackingNumber?.trim().length ?? 0) > 0;

    clearErrors();
    setSubmissionState(null);

    if (values.status === "SHIPPED" && !hasTrackingNumber) {
      const message =
        "Tracking number is required when marking an order as SHIPPED.";

      setError("trackingNumber", {
        message,
        type: "manual",
      });
      setSubmissionState({
        fieldErrors: {
          trackingNumber: [message],
        },
        message,
        success: false,
      });

      return;
    }

    if (trimmedTrackingNumber && !orderStatusSupportsTracking(values.status)) {
      const message =
        "Tracking number can only be set when the order status is SHIPPED or DELIVERED.";

      setError("trackingNumber", {
        message,
        type: "manual",
      });
      setSubmissionState({
        fieldErrors: {
          trackingNumber: [message],
        },
        message,
        success: false,
      });

      return;
    }

    startTransition(async () => {
      const result = await updateAdminOrderAction(order.id, values);

      setSubmissionState(result);

      if (!result.success) {
        applyServerErrors(result);

        if (result.requiresReauthentication) {
          router.replace(buildLoginRedirectPath(redirectPath));
          return;
        }

        if (result.requiresAdmin) {
          router.replace("/");
        }

        return;
      }

      if (result.order) {
        reset(buildDefaultValues(result.order));
      }

      router.refresh();
    });
  };

  return (
    <section className="space-y-5 rounded-[1.75rem] border border-border/70 bg-background/88 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.05)]">
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <div className="glow-dot" />
          <p className="text-[10px] font-semibold tracking-[0.28em] uppercase text-muted-foreground">
            Fulfillment Controls
          </p>
        </div>
        <div className="space-y-1">
          <h2 className="text-xl font-semibold tracking-tight text-foreground">
            Update status and dispatch details
          </h2>
          <p className="text-sm leading-6 text-muted-foreground">
            {selectedStatusMeta.description}
          </p>
        </div>
      </div>

      {submissionState?.message ? (
        <div
          className={
            submissionState.success
              ? "rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-700 dark:text-emerald-300"
              : "rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm leading-6 text-destructive"
          }
        >
          {submissionState.message}
        </div>
      ) : null}

      {isCancelledState ? (
        <div className="rounded-2xl border border-border/60 bg-muted/35 px-4 py-3 text-sm leading-6 text-muted-foreground">
          This order is already cancelled. Inventory was released and the
          fulfillment controls are locked.
        </div>
      ) : null}

      <form
        className="space-y-5"
        noValidate
        onSubmit={handleSubmit(handleUpdateOrder)}
      >
        <Controller
          control={control}
          name="status"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Order status</FieldLabel>
              <select
                {...field}
                id={field.name}
                aria-invalid={fieldState.invalid}
                className={cn(selectClassName)}
                disabled={isPending || isCancelledState}
              >
                {availableStatuses.map((status) => (
                  <option key={status} value={status}>
                    {getOrderStatusLabel(status)}
                  </option>
                ))}
              </select>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <Controller
          control={control}
          name="trackingNumber"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Tracking number</FieldLabel>
              <Input
                {...field}
                id={field.name}
                placeholder={
                  canEditTracking
                    ? "TH1234567890"
                    : "Available once the order is shipped"
                }
                aria-invalid={fieldState.invalid}
                disabled={isPending || isCancelledState || !canEditTracking}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <div className="rounded-[1.25rem] border border-border/60 bg-muted/25 px-4 py-3 text-sm leading-6 text-muted-foreground">
          {selectedStatus === "PENDING"
            ? "Pending orders can move to Paid or Cancelled."
            : selectedStatus === "PAID"
              ? "Paid orders can move to Shipped or Cancelled."
              : selectedStatus === "SHIPPED"
                ? "Shipped orders can stay editable for tracking or move to Delivered."
                : selectedStatus === "DELIVERED"
                  ? "Delivered orders stay in their final state, but tracking corrections are still allowed."
                  : "Cancelled orders stay locked."}
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={isPending}
            onClick={() => {
              clearErrors();
              setSubmissionState(null);
              reset(defaultValues);
            }}
          >
            Reset
          </Button>
          <Button
            type="submit"
            className="rounded-full"
            disabled={isPending || isCancelledState || !formState.isDirty}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                {canEditTracking ? (
                  <Truck className="size-4" />
                ) : (
                  <Save className="size-4" />
                )}
                {submitLabel}
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
