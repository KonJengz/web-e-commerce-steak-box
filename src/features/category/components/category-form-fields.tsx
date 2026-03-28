"use client";

import { Controller, type Control } from "react-hook-form";

import {
  adminFormInputClassName,
  adminFormTextareaClassName,
} from "@/components/ui/admin-control-styles";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { CategoryFormInput } from "@/features/category/schemas/category.schema";
import { cn } from "@/lib/utils";

interface CategoryFormFieldsProps {
  control: Control<CategoryFormInput>;
  disabled?: boolean;
  idPrefix: string;
}

export function CategoryFormFields({
  control,
  disabled = false,
  idPrefix,
}: CategoryFormFieldsProps) {
  return (
    <>
      <Controller
        control={control}
        name="name"
        render={({ field, fieldState }) => {
          const fieldId = `${idPrefix}-${field.name}`;

          return (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={fieldId}>Category Name</FieldLabel>
              <Input
                {...field}
                id={fieldId}
                placeholder="For example, Premium Cuts"
                aria-invalid={fieldState.invalid}
                className={cn(adminFormInputClassName)}
                disabled={disabled}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          );
        }}
      />

      <Controller
        control={control}
        name="description"
        render={({ field, fieldState }) => {
          const fieldId = `${idPrefix}-${field.name}`;

          return (
            <Field data-invalid={fieldState.invalid}>
              <FieldLabel htmlFor={fieldId}>Description</FieldLabel>
              <textarea
                {...field}
                id={fieldId}
                placeholder="Optional notes for operators and merchandising."
                aria-invalid={fieldState.invalid}
                disabled={disabled}
                className={cn(adminFormTextareaClassName, "min-h-28")}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          );
        }}
      />
    </>
  );
}
