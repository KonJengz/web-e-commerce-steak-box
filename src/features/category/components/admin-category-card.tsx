"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PencilLine, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";

import { formatAccountDate } from "@/components/account/account.utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  adminDestructiveButtonClassName,
  adminOutlineButtonClassName,
  adminPrimaryButtonClassName,
} from "@/components/ui/admin-action-styles";
import {
  adminMutedBadgeClassName,
  adminOutlineBadgeClassName,
  adminSuccessBadgeClassName,
  adminWarningBadgeClassName,
} from "@/components/ui/admin-badge-styles";
import { adminErrorNoticePreWrapClassName } from "@/components/ui/admin-notice-styles";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import { deleteCategoryAction } from "@/features/category/actions/delete-category.action";
import { updateCategoryAction } from "@/features/category/actions/update-category.action";
import { CategoryDeleteDialog } from "@/features/category/components/category-delete-dialog";
import { CategoryFormFields } from "@/features/category/components/category-form-fields";
import {
  updateCategorySchema,
  type UpdateCategoryInput,
} from "@/features/category/schemas/category.schema";
import type {
  Category,
  DeleteCategoryActionState,
  UpdateCategoryActionState,
} from "@/features/category/types/category.type";
import { cn } from "@/lib/utils";

interface AdminCategoryCardProps {
  assignedProductCount: number;
  category: Category;
}

const getCategoryFormValues = (category: Category): UpdateCategoryInput => {
  return {
    description: category.description ?? "",
    name: category.name,
  };
};

const getAssignedProductLabel = (count: number): string => {
  return `${count} linked product${count === 1 ? "" : "s"}`;
};

export function AdminCategoryCard({
  assignedProductCount,
  category,
}: AdminCategoryCardProps) {
  const router = useRouter();
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState<boolean>(false);
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [updateState, setUpdateState] =
    useState<UpdateCategoryActionState | null>(null);
  const [deleteState, setDeleteState] =
    useState<DeleteCategoryActionState | null>(null);
  const isDeleteBlocked = assignedProductCount > 0;
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
    setDeleteState(null);
    setUpdateState(null);
    setIsEditing(false);
  };

  const handleUpdateCategory = (values: UpdateCategoryInput): void => {
    clearErrors();
    setDeleteState(null);
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
    });
  };

  const handleDeleteCategory = (): void => {
    if (isDeleteBlocked) {
      return;
    }

    setDeleteState(null);
    setUpdateState(null);

    startDeleteTransition(async () => {
      const result = await deleteCategoryAction(category.id);

      if (!result.success) {
        setDeleteState(result);

        if (result.requiresReauthentication) {
          router.replace(buildLoginRedirectPath("/admin/categories"));
          return;
        }

        if (result.requiresAdmin) {
          router.replace("/");
        }

        return;
      }

      setIsDeleteDialogOpen(false);
    });
  };

  if (isEditing) {
    return (
      <article className="rounded-[1.65rem] border border-primary/18 bg-background/98 p-5 shadow-[0_16px_48px_rgba(0,0,0,0.08)]">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-primary">
              Edit Category
            </p>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Update taxonomy details
            </h3>
          </div>

          <div className="flex flex-wrap gap-2">
            <Badge variant="outline" className={cn(adminOutlineBadgeClassName, "text-xs")}>
              Saved {formatAccountDate(category.updatedAt)}
            </Badge>
            <Badge
              variant="secondary"
              className={adminMutedBadgeClassName}
            >
              {getAssignedProductLabel(assignedProductCount)}
            </Badge>
          </div>
        </div>

        <form
          className="mt-5 space-y-5"
          noValidate
          onSubmit={handleSubmit(handleUpdateCategory)}
        >
        {updateState?.message ? (
            <div className={adminErrorNoticePreWrapClassName}>
              {updateState.message}
            </div>
          ) : null}

          <CategoryFormFields
            control={control}
            disabled={isSaving || isDeleting}
            idPrefix={`edit-category-${category.id}`}
          />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className={adminOutlineButtonClassName}
              disabled={isSaving || isDeleting}
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className={adminPrimaryButtonClassName}
              disabled={isSaving || isDeleting}
            >
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
        <div className="min-w-0 space-y-3">
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

          <div className="flex flex-wrap gap-2">
            <Badge
              variant="secondary"
              className={adminMutedBadgeClassName}
            >
              {getAssignedProductLabel(assignedProductCount)}
            </Badge>
            <Badge
              variant="secondary"
              className={
                isDeleteBlocked
                  ? adminWarningBadgeClassName
                  : adminSuccessBadgeClassName
              }
            >
              {isDeleteBlocked ? "Still assigned" : "No assigned products"}
            </Badge>
          </div>

          {isDeleteBlocked ? (
            <p className="text-xs leading-5 text-amber-700 dark:text-amber-300">
              Move assigned products out of this category before deleting it.
            </p>
          ) : (
            <p className="text-xs leading-5 text-emerald-700 dark:text-emerald-300">
              This category is currently safe to delete.
            </p>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            className={adminOutlineButtonClassName}
            disabled={isDeleting}
            onClick={() => {
              setDeleteState(null);
              setUpdateState(null);
              setIsEditing(true);
            }}
          >
            <PencilLine className="size-4" />
            Edit
          </Button>
          <Button
            type="button"
            variant="destructive"
            className={adminDestructiveButtonClassName}
            disabled={isDeleting || isDeleteBlocked}
            onClick={() => {
              setDeleteState(null);
              setUpdateState(null);
              setIsDeleteDialogOpen(true);
            }}
          >
            {isDeleting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="size-4" />
                Delete
              </>
            )}
          </Button>
        </div>
      </div>

      <CategoryDeleteDialog
        category={category}
        isPending={isDeleting}
        linkedProductCount={assignedProductCount}
        message={deleteState?.message}
        open={isDeleteDialogOpen}
        onConfirm={handleDeleteCategory}
        onOpenChange={(open) => {
          setIsDeleteDialogOpen(open);

          if (!open && !isDeleting) {
            setDeleteState(null);
          }
        }}
      />
    </article>
  );
}
