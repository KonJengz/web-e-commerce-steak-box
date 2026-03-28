"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PencilLine } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { formatAccountDate } from "@/components/account/account.utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import { updateCategoryAction } from "@/features/category/actions/update-category.action";
import { CategoryFormFields } from "@/features/category/components/category-form-fields";
import {
  updateCategorySchema,
  type UpdateCategoryInput,
} from "@/features/category/schemas/category.schema";
import type {
  Category,
  UpdateCategoryActionState,
} from "@/features/category/types/category.type";

interface AdminCategoryCardProps {
  category: Category;
}

const getCategoryFormValues = (category: Category): UpdateCategoryInput => {
  return {
    description: category.description ?? "",
    name: category.name,
  };
};

export function AdminCategoryCard({ category }: AdminCategoryCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [updateState, setUpdateState] =
    useState<UpdateCategoryActionState | null>(null);
  const { control, clearErrors, handleSubmit, reset, setError } =
    useForm<UpdateCategoryInput>({
      defaultValues: getCategoryFormValues(category),
      resolver: zodResolver(updateCategorySchema),
    });

  useEffect(() => {
    reset(getCategoryFormValues(category));
  }, [category, reset]);

  const applyServerErrors = (state: UpdateCategoryActionState): void => {
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

  const handleCancelEdit = (): void => {
    clearErrors();
    reset(getCategoryFormValues(category));
    setUpdateState(null);
    setIsEditing(false);
  };

  const handleUpdateCategory = (values: UpdateCategoryInput): void => {
    clearErrors();
    setUpdateState(null);

    startSaveTransition(async () => {
      const result = await updateCategoryAction(category.id, values);

      if (!result.success) {
        setUpdateState(result);
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

      setIsEditing(false);
      router.refresh();
    });
  };

  if (isEditing) {
    return (
      <article className="rounded-[1.65rem] border border-primary/18 bg-background/98 p-5 shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-primary">
              Edit Category
            </p>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Update taxonomy details
            </h3>
          </div>

          <Badge variant="outline" className="text-xs">
            Saved {formatAccountDate(category.updatedAt)}
          </Badge>
        </div>

        <form
          className="mt-5 space-y-5"
          noValidate
          onSubmit={handleSubmit(handleUpdateCategory)}
        >
          {updateState?.message ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm leading-6 whitespace-pre-line text-destructive">
              {updateState.message}
            </div>
          ) : null}

          <CategoryFormFields
            control={control}
            disabled={isSaving}
            idPrefix={`edit-category-${category.id}`}
          />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={isSaving}
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-full" disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>
        </form>
      </article>
    );
  }

  return (
    <article className="hover-lift rounded-[1.65rem] border border-border/50 bg-card/95 p-5 shadow-[0_16px_48px_rgba(0,0,0,0.05)] transition-all duration-200">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <h3 className="text-base font-semibold tracking-tight text-foreground">
              {category.name}
            </h3>
            <Badge variant="outline" className="text-xs">
              Updated {formatAccountDate(category.updatedAt)}
            </Badge>
          </div>

          <p className="text-sm leading-6 text-muted-foreground">
            {category.description || "No description yet."}
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          onClick={() => {
            setUpdateState(null);
            setIsEditing(true);
          }}
        >
          <PencilLine className="size-4" />
          Edit
        </Button>
      </div>
    </article>
  );
}
