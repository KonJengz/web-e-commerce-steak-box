"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import {
  adminOutlineButtonClassName,
  adminPrimaryButtonClassName,
} from "@/components/ui/admin-action-styles";
import { Button } from "@/components/ui/button";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import { createCategoryAction } from "@/features/category/actions/create-category.action";
import { CategoryFormFields } from "@/features/category/components/category-form-fields";
import {
  createCategorySchema,
  type CreateCategoryInput,
} from "@/features/category/schemas/category.schema";
import type { CreateCategoryActionState } from "@/features/category/types/category.type";

const SUCCESS_NOTICE_DURATION_MS = 3000;

const defaultValues: CreateCategoryInput = {
  description: "",
  name: "",
};

export function AdminCategoryCreateForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submissionState, setSubmissionState] =
    useState<CreateCategoryActionState | null>(null);
  const { control, clearErrors, handleSubmit, reset, setError } =
    useForm<CreateCategoryInput>({
      defaultValues,
      resolver: zodResolver(createCategorySchema),
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

  const applyServerErrors = (state: CreateCategoryActionState): void => {
    const descriptionError = state.fieldErrors?.description?.[0];
    const nameError = state.fieldErrors?.name?.[0];

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
  };

  const handleCreateCategory = (values: CreateCategoryInput): void => {
    clearErrors();
    setSubmissionState(null);

    startTransition(async () => {
      const result = await createCategoryAction(values);

      setSubmissionState(result);

      if (!result.success) {
        applyServerErrors(result);

        if (result.requiresReauthentication) {
          router.replace(buildLoginRedirectPath("/admin/categories"));
          return;
        }

        if (result.requiresAdmin) {
          router.replace("/");
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
            New Category
          </p>
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight text-foreground">
              Add a catalog category
            </h2>
            <p className="text-sm leading-7 text-muted-foreground">
              Create the category first so product assignment stays consistent.
            </p>
          </div>
        </div>

        <span className="inline-flex size-12 items-center justify-center rounded-full border border-emerald-500/15 bg-emerald-500/8 text-emerald-600">
          <Plus className="size-5" />
        </span>
      </div>

      <form
        className="mt-8 space-y-5"
        noValidate
        onSubmit={handleSubmit(handleCreateCategory)}
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

        <CategoryFormFields
          control={control}
          disabled={isPending}
          idPrefix="create-category"
        />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
          <Button
            type="button"
            variant="outline"
            className={adminOutlineButtonClassName}
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
            className={adminPrimaryButtonClassName}
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Creating...
              </>
            ) : (
              "Create Category"
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
