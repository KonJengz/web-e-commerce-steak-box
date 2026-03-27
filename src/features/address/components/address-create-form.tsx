"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  MapPinHouse,
  Phone,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createAddressAction } from "@/features/address/actions/create-address.action";
import {
  createAddressSchema,
  type CreateAddressInput,
} from "@/features/address/schemas/address.schema";
import type { CreateAddressActionState } from "@/features/address/types/address.type";

interface AddressCreateFormProps {
  hasAddresses: boolean;
}

const SUCCESS_NOTICE_DURATION_MS = 3000;

const getDefaultValues = (hasAddresses: boolean): CreateAddressInput => {
  return {
    addressLine: "",
    city: "",
    isDefault: !hasAddresses,
    phone: "",
    postalCode: "",
    recipientName: "",
  };
};

export function AddressCreateForm({ hasAddresses }: AddressCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submissionState, setSubmissionState] =
    useState<CreateAddressActionState | null>(null);
  const { control, clearErrors, handleSubmit, reset, setError } =
    useForm<CreateAddressInput>({
      defaultValues: getDefaultValues(hasAddresses),
      resolver: zodResolver(createAddressSchema),
    });

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

  const applyServerErrors = (state: CreateAddressActionState): void => {
    const addressLineError = state.fieldErrors?.addressLine?.[0];
    const cityError = state.fieldErrors?.city?.[0];
    const phoneError = state.fieldErrors?.phone?.[0];
    const postalCodeError = state.fieldErrors?.postalCode?.[0];
    const recipientNameError = state.fieldErrors?.recipientName?.[0];

    if (recipientNameError) {
      setError("recipientName", {
        message: recipientNameError,
        type: "server",
      });
    }

    if (phoneError) {
      setError("phone", {
        message: phoneError,
        type: "server",
      });
    }

    if (addressLineError) {
      setError("addressLine", {
        message: addressLineError,
        type: "server",
      });
    }

    if (cityError) {
      setError("city", {
        message: cityError,
        type: "server",
      });
    }

    if (postalCodeError) {
      setError("postalCode", {
        message: postalCodeError,
        type: "server",
      });
    }
  };

  const handleCreateAddress = (values: CreateAddressInput): void => {
    clearErrors();
    setSubmissionState(null);

    startTransition(async () => {
      const result = await createAddressAction(values);

      setSubmissionState(result);

      if (!result.success) {
        applyServerErrors(result);

        if (result.requiresReauthentication) {
          router.replace("/login?redirectTo=/addresses");
        }

        return;
      }

      reset(getDefaultValues(true));
      router.refresh();
    });
  };

  return (
    <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)] sm:p-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-2xl space-y-3">
          <p className="text-xs font-semibold tracking-[0.28em] text-primary/75 uppercase">
            Add Address
          </p>
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              Save a shipping address for faster checkout
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Add the delivery details you use most. Mark one as default so it
              shows up first the next time you place an order.
            </p>
          </div>
        </div>

        {!hasAddresses ? (
          <div className="rounded-[1.5rem] border border-primary/20 bg-primary/8 px-4 py-3 text-sm leading-6 text-primary">
            Your first saved address can start as the default destination.
          </div>
        ) : null}
      </div>

      <form
        className="mt-8 space-y-6"
        noValidate
        onSubmit={handleSubmit(handleCreateAddress)}
      >
        {submissionState?.message ? (
          <div
            className={
              submissionState.success
                ? "rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-700 dark:text-emerald-300"
                : "rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm leading-6 whitespace-pre-line text-destructive"
            }
          >
            {submissionState.message}
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            control={control}
            name="recipientName"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Recipient Name</FieldLabel>
                <div className="relative mt-2">
                  <UserRound className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...field}
                    id={field.name}
                    autoComplete="name"
                    aria-invalid={fieldState.invalid}
                    className="h-12 rounded-2xl border-border/70 bg-card/85 pr-4 pl-11"
                    disabled={isPending}
                    placeholder="Who will receive the order"
                  />
                </div>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="phone"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Phone</FieldLabel>
                <div className="relative mt-2">
                  <Phone className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...field}
                    id={field.name}
                    autoComplete="tel"
                    aria-invalid={fieldState.invalid}
                    className="h-12 rounded-2xl border-border/70 bg-card/85 pr-4 pl-11"
                    disabled={isPending}
                    inputMode="tel"
                    placeholder="0812345678"
                  />
                </div>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        <Controller
          control={control}
          name="addressLine"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={field.name}>Address Line</FieldLabel>
              <div className="relative mt-2">
                <MapPinHouse className="pointer-events-none absolute top-4 left-4 size-4 text-muted-foreground" />
                <Input
                  {...field}
                  id={field.name}
                  autoComplete="street-address"
                  aria-invalid={fieldState.invalid}
                  className="h-12 rounded-2xl border-border/70 bg-card/85 pr-4 pl-11"
                  disabled={isPending}
                  placeholder="123/4 ถนนสุขุมวิท แขวงคลองตัน"
                />
              </div>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <Controller
            control={control}
            name="city"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>City</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  autoComplete="address-level2"
                  aria-invalid={fieldState.invalid}
                  className="mt-2 h-12 rounded-2xl border-border/70 bg-card/85 px-4"
                  disabled={isPending}
                  placeholder="กรุงเทพ"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="postalCode"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Postal Code</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  autoComplete="postal-code"
                  aria-invalid={fieldState.invalid}
                  className="mt-2 h-12 rounded-2xl border-border/70 bg-card/85 px-4"
                  disabled={isPending}
                  inputMode="numeric"
                  placeholder="10110"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        <Controller
          control={control}
          name="isDefault"
          render={({ field, fieldState }) => (
            <Field data-invalid={fieldState.invalid}>
              <label className="flex cursor-pointer items-start justify-between gap-4 rounded-[1.5rem] border border-border/70 bg-background/70 px-4 py-4">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    Use as default delivery address
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    This address will be shown first when you move into checkout.
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(event) => field.onChange(event.target.checked)}
                  disabled={isPending}
                  className="mt-1 h-4 w-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
                />
              </label>
              <FieldError errors={[fieldState.error]} />
            </Field>
          )}
        />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            disabled={isPending}
            onClick={() => {
              clearErrors();
              setSubmissionState(null);
              reset(getDefaultValues(hasAddresses));
            }}
          >
            Reset Form
          </Button>
          <Button type="submit" className="rounded-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Save Address"
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
