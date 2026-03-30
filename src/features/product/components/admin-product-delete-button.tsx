"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { adminDestructiveButtonClassName } from "@/components/ui/admin-action-styles";
import { Button } from "@/components/ui/button";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import { deleteProductAction } from "@/features/product/actions/delete-product.action";
import { ProductDeleteDialog } from "@/features/product/components/product-delete-dialog";
import type { ProductSummary } from "@/features/product/types/product.type";

interface AdminProductDeleteButtonProps {
  product: ProductSummary;
}

export function AdminProductDeleteButton({
  product,
}: AdminProductDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [open, setOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  const handleOpenChange = (nextOpen: boolean): void => {
    if (isPending) {
      return;
    }

    setOpen(nextOpen);

    if (!nextOpen) {
      setMessage(null);
    }
  };

  const handleDelete = (): void => {
    setMessage(null);

    startTransition(async () => {
      const result = await deleteProductAction(product.id);

      if (!result.success) {
        setMessage(result.message ?? "Unable to delete this product.");

        if (result.requiresReauthentication) {
          router.replace(buildLoginRedirectPath("/admin/products"));
          return;
        }

        if (result.requiresAdmin) {
          router.replace("/");
        }

        return;
      }

      setOpen(false);
    });
  };

  return (
    <>
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className={adminDestructiveButtonClassName}
        disabled={isPending}
        onClick={() => handleOpenChange(true)}
      >
        {isPending ? (
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

      <ProductDeleteDialog
        product={product}
        open={open}
        onOpenChange={handleOpenChange}
        onConfirm={handleDelete}
        isPending={isPending}
        message={message}
      />
    </>
  );
}
