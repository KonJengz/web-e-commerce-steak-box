"use client";

import { MapPinHouse, Phone, UserRound } from "lucide-react";
import type { Control } from "react-hook-form";
import { Controller } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { AddressFormInput } from "@/features/address/schemas/address.schema";

interface AddressFormFieldsProps {
  control: Control<AddressFormInput>;
  disabled: boolean;
  idPrefix: string;
}

export function AddressFormFields({
  control,
  disabled,
  idPrefix,
}: AddressFormFieldsProps) {
  return (
    <>
      <div className="grid gap-4 md:grid-cols-2">
        <Controller
          control={control}
          name="recipientName"
          render={({ field, fieldState }) => {
            const fieldId = `${idPrefix}-${field.name}`;

            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={fieldId}>Recipient Name</FieldLabel>
                <div className="relative mt-2">
                  <UserRound className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...field}
                    id={fieldId}
                    autoComplete="name"
                    aria-invalid={fieldState.invalid}
                    className="h-12 rounded-2xl border-border/70 bg-card/85 pr-4 pl-11"
                    disabled={disabled}
                    placeholder="Who will receive the order"
                  />
                </div>
                <FieldError errors={[fieldState.error]} />
              </Field>
            );
          }}
        />

        <Controller
          control={control}
          name="phone"
          render={({ field, fieldState }) => {
            const fieldId = `${idPrefix}-${field.name}`;

            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={fieldId}>Contact Phone</FieldLabel>
                <div className="relative mt-2">
                  <Phone className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...field}
                    id={fieldId}
                    autoComplete="tel"
                    aria-invalid={fieldState.invalid}
                    className="h-12 rounded-2xl border-border/70 bg-card/85 pr-4 pl-11"
                    disabled={disabled}
                    inputMode="numeric"
                    maxLength={10}
                    placeholder="0812345678"
                  />
                </div>
                <FieldError errors={[fieldState.error]} />
              </Field>
            );
          }}
        />
      </div>

      <Controller
        control={control}
        name="addressLine"
        render={({ field, fieldState }) => {
          const fieldId = `${idPrefix}-${field.name}`;

          return (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={fieldId}>Address</FieldLabel>
              <div className="relative mt-2">
                <MapPinHouse className="pointer-events-none absolute top-4 left-4 size-4 text-muted-foreground" />
                <Input
                  {...field}
                  id={fieldId}
                  autoComplete="street-address"
                  aria-invalid={fieldState.invalid}
                  className="h-12 rounded-2xl border-border/70 bg-card/85 pr-4 pl-11"
                  disabled={disabled}
                  placeholder="123/4 ถนนสุขุมวิท แขวงคลองตัน"
                />
              </div>
              <FieldError errors={[fieldState.error]} />
            </Field>
          );
        }}
      />

      <div className="grid gap-4 md:grid-cols-2">
        <Controller
          control={control}
          name="city"
          render={({ field, fieldState }) => {
            const fieldId = `${idPrefix}-${field.name}`;

            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={fieldId}>City</FieldLabel>
                <Input
                  {...field}
                  id={fieldId}
                  autoComplete="address-level2"
                  aria-invalid={fieldState.invalid}
                  className="mt-2 h-12 rounded-2xl border-border/70 bg-card/85 px-4"
                  disabled={disabled}
                  placeholder="กรุงเทพ"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            );
          }}
        />

        <Controller
          control={control}
          name="postalCode"
          render={({ field, fieldState }) => {
            const fieldId = `${idPrefix}-${field.name}`;

            return (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={fieldId}>Postal Code</FieldLabel>
                <Input
                  {...field}
                  id={fieldId}
                  autoComplete="postal-code"
                  aria-invalid={fieldState.invalid}
                  className="mt-2 h-12 rounded-2xl border-border/70 bg-card/85 px-4"
                  disabled={disabled}
                  inputMode="numeric"
                  maxLength={5}
                  placeholder="10110"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            );
          }}
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
                disabled={disabled}
                className="mt-1 h-4 w-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60"
              />
            </label>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
    </>
  );
}
