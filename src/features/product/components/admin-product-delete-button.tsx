"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import { deleteProductAction } from "@/features/product/actions/delete-product.action";

interface AdminProductDeleteButtonProps {
  productId: string;
  productName: string;
}

export function AdminProductDeleteButton({
  productId,
  productName,
}: AdminProductDeleteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const handleDelete = (): void => {
    const confirmed = window.confirm(
      `Delete "${productName}" from the catalog?`,
    );

    if (!confirmed) {
      return;
    }

    setMessage(null);

    startTransition(async () => {
      const result = await deleteProductAction(productId);

      if (!result.success) {
        setMessage(result.message ?? "Unable to delete this product.");

        if (result.requiresReauthentication) {
          router.replace(buildLoginRedirectPath("/admin/products"));
        }

        return;
      }

      router.refresh();
    });
  };

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="destructive"
        size="sm"
        className="rounded-full"
        disabled={isPending}
        onClick={handleDelete}
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

      {message ? (
        <p className="max-w-[15rem] text-xs leading-5 text-destructive">
          {message}
        </p>
      ) : null}
    </div>
  );
}
