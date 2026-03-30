"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Check, Loader2, Save, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import { updateAdminOrderAction } from "@/features/order/actions/update-admin-order.action";
import {
  updateAdminOrderSchema,
  type UpdateAdminOrderValues,
} from "@/features/order/schemas/order.schema";
import {
  getOrderStatusLabel,
  ORDER_STATUS_VALUES,
} from "@/features/order/types/order-status";
import type {
  AdminOrder,
  UpdateAdminOrderActionState,
} from "@/features/order/types/order.type";
import { cn } from "@/lib/utils";

interface AdminOrderUpdateStatusFormProps {
  order: AdminOrder;
}

export function AdminOrderUpdateStatusForm({
  order,
}: AdminOrderUpdateStatusFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [state, setState] = useState<UpdateAdminOrderActionState | null>(null);

  const {
    control,
    handleSubmit,
    formState: { isDirty },
    watch,
  } = useForm<UpdateAdminOrderValues>({
    defaultValues: {
      status: order.status,
      trackingNumber: order.trackingNumber || "",
    },
    resolver: zodResolver(updateAdminOrderSchema) as any,
  });

  const selectedStatus = watch("status");
  const isShipping = selectedStatus === "SHIPPED";

  const handleUpdate = (values: UpdateAdminOrderValues) => {
    setState(null);

    startTransition(async () => {
      const result = await updateAdminOrderAction(order.id, values);
      setState(result);

      if (result.success) {
        router.refresh();
      }
    });
  };

  return (
    <form
      onSubmit={handleSubmit(handleUpdate)}
      className="space-y-6 rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]"
    >
      <div className="flex items-center gap-3">
        <div className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
          <Save className="size-4" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-foreground">Status Control</h2>
          <p className="text-sm text-muted-foreground">
            Transitions are validated against backend business rules.
          </p>
        </div>
      </div>

      {state?.message && (
        <div
          className={cn(
            "rounded-2xl border px-4 py-3 text-sm leading-6",
            state.success
              ? "border-emerald-500/20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
              : "border-destructive/20 bg-destructive/10 text-destructive"
          )}
        >
          <div className="flex items-center gap-2">
            {state.success ? <Check className="size-4" /> : null}
            {state.message}
          </div>
        </div>
      )}

      <div className="grid gap-5 md:grid-cols-2">
        {/* Status NativeSelect */}
        <div className="space-y-2">
          <label className="text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/80 px-1">
            Order Status
          </label>
          <Controller
            control={control}
            name="status"
            render={({ field, fieldState }) => (
              <div className="space-y-1">
                <NativeSelect
                  {...field}
                  disabled={isPending}
                  aria-invalid={fieldState.invalid}
                  className={cn(fieldState.invalid && "border-destructive/50")}
                >
                  {ORDER_STATUS_VALUES.map((status) => (
                    <option key={status} value={status}>
                      {getOrderStatusLabel(status)}
                    </option>
                  ))}
                </NativeSelect>
                {fieldState.error && (
                  <p className="px-1 text-[11px] text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>

        {/* Tracking Number (Visible always if SHIPPED or already has one) */}
        <div
          className={cn(
            "space-y-2 transition-all duration-300",
            !isShipping && !order.trackingNumber ? "opacity-40 grayscale pointer-events-none" : "opacity-100"
          )}
        >
          <label className="flex items-center gap-2 text-[10px] font-semibold tracking-widest uppercase text-muted-foreground/80 px-1">
            <Truck className="size-3" />
            Tracking Number
          </label>
          <Controller
            control={control}
            name="trackingNumber"
            render={({ field, fieldState }) => (
              <div className="space-y-1">
                <Input
                  {...field}
                  placeholder={isShipping ? "Enter tracking code..." : "N/A"}
                  disabled={isPending || (!isShipping && !order.trackingNumber)}
                  className={cn(
                    "h-12 rounded-xl border-border/60 bg-background/50",
                    fieldState.invalid && "border-destructive/50"
                  )}
                />
                {fieldState.error && (
                  <p className="px-1 text-[11px] text-destructive">
                    {fieldState.error.message}
                  </p>
                )}
              </div>
            )}
          />
        </div>
      </div>

      <div className="flex justify-end pt-2">
        <Button
          type="submit"
          disabled={isPending || !isDirty}
          className="h-12 rounded-full px-8 transition-all active:scale-[0.98]"
        >
          {isPending ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Updating...
            </>
          ) : (
            <>
              <Save className="mr-2 size-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
