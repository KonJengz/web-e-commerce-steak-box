"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PackagePlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import type { Category } from "@/features/category/types/category.type";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import { createProductAction } from "@/features/product/actions/create-product.action";
import {
  createProductSchema,
  type CreateProductFormValues,
  type CreateProductInput,
} from "@/features/product/schemas/product.schema";
import type { CreateProductActionState } from "@/features/product/types/product.type";
import { cn } from "@/lib/utils";

interface AdminProductCreateFormProps {
  categories: Category[];
}

const SUCCESS_NOTICE_DURATION_MS = 3000;

const textareaClassName =
  "min-h-32 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm leading-6 text-foreground outline-none transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";

const selectClassName =
  "flex h-10 w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40";

const defaultValues: CreateProductFormValues = {
  categoryId: "",
  currentPrice: "",
  description: "",
  name: "",
  stock: "",
};

export function AdminProductCreateForm({
  categories,
}: AdminProductCreateFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submissionState, setSubmissionState] =
    useState<CreateProductActionState | null>(null);
  const { control, clearErrors, handleSubmit, reset, setError } =
    useForm<CreateProductFormValues, undefined, CreateProductInput>({
      defaultValues,
      resolver: zodResolver(createProductSchema),
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

  const applyServerErrors = (state: CreateProductActionState): void => {
    const categoryIdError = state.fieldErrors?.categoryId?.[0];
    const currentPriceError = state.fieldErrors?.currentPrice?.[0];
    const descriptionError = state.fieldErrors?.description?.[0];
    const nameError = state.fieldErrors?.name?.[0];
    const stockError = state.fieldErrors?.stock?.[0];

    if (nameError) {
      setError("name", {
        message: nameError,
        type: "server",
      });
    }

    if (descriptionError) {
      setError("description", {
        message: descriptionError,
        type: "server",
      });
    }

    if (categoryIdError) {
      setError("categoryId", {
        message: categoryIdError,
        type: "server",
      });
    }

    if (currentPriceError) {
      setError("currentPrice", {
        message: currentPriceError,
        type: "server",
      });
    }

    if (stockError) {
      setError("stock", {
        message: stockError,
        type: "server",
      });
    }
  };

  const handleCreateProduct = (values: CreateProductInput): void => {
    clearErrors();
    setSubmissionState(null);

    startTransition(async () => {
      const result = await createProductAction(values);

      setSubmissionState(result);

      if (!result.success) {
        applyServerErrors(result);

        if (result.requiresReauthentication) {
          router.replace(buildLoginRedirectPath("/admin/products"));
        }

        return;
      }

      reset(defaultValues);
      router.refresh();
    });
  };

  return (
    <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)] sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold tracking-[0.28em] text-emerald-600 uppercase">
            New Product
          </p>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Add a product to the catalog
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Start with the core catalog fields. Image and gallery tools can sit on this page later without changing the route structure.
            </p>
          </div>
        </div>

        <span className="inline-flex size-12 items-center justify-center rounded-full border border-emerald-500/15 bg-emerald-500/8 text-emerald-600">
          <PackagePlus className="size-5" />
        </span>
      </div>

      <form
        className="mt-8 space-y-5"
        noValidate
        onSubmit={handleSubmit(handleCreateProduct)}
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

        <div className="grid gap-5 xl:grid-cols-2">
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Product Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  placeholder="For example, Dry-Aged Ribeye"
                  aria-invalid={fieldState.invalid}
                  disabled={isPending}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="categoryId"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                <select
                  {...field}
                  id={field.name}
                  aria-invalid={fieldState.invalid}
                  disabled={isPending || categories.length === 0}
                  className={cn(selectClassName)}
                >
                  <option value="">
                    {categories.length > 0
                      ? "Choose a category"
                      : "Create a category first"}
                  </option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="currentPrice"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Current Price (THB)</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  min={0}
                  step="0.01"
                  value={
                    typeof field.value === "string" ||
                    typeof field.value === "number"
                      ? field.value
                      : ""
                  }
                  placeholder="0.00"
                  aria-invalid={fieldState.invalid}
                  disabled={isPending}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="stock"
            render={({ field, fieldState }) => (
              <Field>
                <FieldLabel htmlFor={field.name}>Stock</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="number"
                  min={0}
                  step="1"
                  value={
                    typeof field.value === "string" ||
                    typeof field.value === "number"
                      ? field.value
                      : ""
                  }
                  placeholder="0"
                  aria-invalid={fieldState.invalid}
                  disabled={isPending}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
        </div>

        <Controller
          control={control}
          name="description"
          render={({ field, fieldState }) => (
            <Field>
              <FieldLabel htmlFor={field.name}>Description</FieldLabel>
              <textarea
                {...field}
                id={field.name}
                placeholder="Write the product story, cut details, or serving notes."
                aria-invalid={fieldState.invalid}
                disabled={isPending}
                className={cn(textareaClassName)}
              />
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
              reset(defaultValues);
            }}
          >
            Reset
          </Button>
          <Button
            type="submit"
            className="rounded-full"
            disabled={isPending || categories.length === 0}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Product"
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
