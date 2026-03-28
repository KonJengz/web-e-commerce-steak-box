"use client";

import { Controller, type Control } from "react-hook-form";

import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { CategoryFormInput } from "@/features/category/schemas/category.schema";
import { cn } from "@/lib/utils";

interface CategoryFormFieldsProps {
  control: Control<CategoryFormInput>;
  disabled?: boolean;
  idPrefix: string;
}

const categoryTextareaClassName =
  "min-h-28 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";

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
                className={cn(categoryTextareaClassName)}
              />
              <FieldError errors={[fieldState.error]} />
            </Field>
          );
        }}
      />
    </>
  );
}
