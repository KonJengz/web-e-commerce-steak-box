"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Loader2,
  Navigation,
  PencilLine,
  Star,
  Trash2,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

import { formatAccountDate } from "@/components/account/account.utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { deleteAddressAction } from "@/features/address/actions/delete-address.action";
import { updateAddressAction } from "@/features/address/actions/update-address.action";
import { AddressFormFields } from "@/features/address/components/address-form-fields";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import {
  updateAddressSchema,
  type UpdateAddressInput,
} from "@/features/address/schemas/address.schema";
import type {
  Address,
  DeleteAddressActionState,
  UpdateAddressActionState,
} from "@/features/address/types/address.type";

interface AddressCardProps {
  address: Address;
}

const getAddressFormValues = (address: Address): UpdateAddressInput => {
  return {
    addressLine: address.addressLine,
    city: address.city,
    isDefault: address.isDefault,
    phone: address.phone ?? "",
    postalCode: address.postalCode,
    recipientName: address.recipientName,
  };
};

export function AddressCard({ address }: AddressCardProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isSaving, startSaveTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [updateState, setUpdateState] = useState<UpdateAddressActionState | null>(
    null,
  );
  const [deleteState, setDeleteState] = useState<DeleteAddressActionState | null>(
    null,
  );
  const { control, clearErrors, handleSubmit, reset, setError } =
    useForm<UpdateAddressInput>({
      defaultValues: getAddressFormValues(address),
      resolver: zodResolver(updateAddressSchema),
    });

  useEffect(() => {
    reset(getAddressFormValues(address));
  }, [address, reset]);

  const applyServerErrors = (state: UpdateAddressActionState): void => {
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

  const handleCancelEdit = (): void => {
    setIsEditing(false);
    setUpdateState(null);
    clearErrors();
    reset(getAddressFormValues(address));
  };

  const handleUpdateAddress = (values: UpdateAddressInput): void => {
    clearErrors();
    setUpdateState(null);
    setDeleteState(null);

    startSaveTransition(async () => {
      const result = await updateAddressAction(address.id, values);

      if (!result.success) {
        setUpdateState(result);
        applyServerErrors(result);

        if (result.requiresReauthentication) {
          router.replace(buildLoginRedirectPath("/addresses"));
        }

        return;
      }

      setIsEditing(false);
      router.refresh();
    });
  };

  const handleDeleteAddress = (): void => {
    setUpdateState(null);
    setDeleteState(null);

    if (!window.confirm("Delete this address? This action cannot be undone.")) {
      return;
    }

    startDeleteTransition(async () => {
      const result = await deleteAddressAction(address.id);

      if (!result.success) {
        setDeleteState(result);

        if (result.requiresReauthentication) {
          router.replace(buildLoginRedirectPath("/addresses"));
        }

        return;
      }

      router.refresh();
    });
  };

  if (isEditing) {
    return (
      <article className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold tracking-[0.22em] uppercase text-muted-foreground">
              Edit Address
            </p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Update shipping details
            </h2>
          </div>

          {address.isDefault ? (
            <Badge className="rounded-full px-2.5 py-1">Default</Badge>
          ) : null}
        </div>

        <form
          className="mt-6 space-y-5"
          noValidate
          onSubmit={handleSubmit(handleUpdateAddress)}
        >
          {updateState?.message ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm leading-6 whitespace-pre-line text-destructive">
              {updateState.message}
            </div>
          ) : null}

          <AddressFormFields
            control={control}
            disabled={isSaving || isDeleting}
            idPrefix={`edit-address-${address.id}`}
          />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={isSaving || isDeleting}
              onClick={handleCancelEdit}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full"
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
    <article className="group overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)] transition-transform hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-lg font-semibold tracking-tight text-foreground">
              {address.recipientName}
            </h2>
            {address.isDefault ? (
              <Badge className="rounded-full px-2.5 py-1">Default</Badge>
            ) : null}
          </div>
          <p className="text-sm text-muted-foreground">
            Saved on {formatAccountDate(address.createdAt)}
          </p>
        </div>

        <span className="inline-flex size-11 items-center justify-center rounded-full border border-border/70 bg-background/70 text-primary">
          {address.isDefault ? (
            <Star className="size-4" />
          ) : (
            <Navigation className="size-4" />
          )}
        </span>
      </div>

      {deleteState?.message ? (
        <div className="mt-5 rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm leading-6 whitespace-pre-line text-destructive">
          {deleteState.message}
        </div>
      ) : null}

      <div className="mt-5 space-y-4 rounded-[1.5rem] border border-border/60 bg-background/60 p-4">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
            Name
          </p>
          <p className="text-sm leading-7 text-foreground">
            {address.recipientName}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
            Contact Phone
          </p>
          <p className="text-sm leading-7 text-foreground">
            {address.phone ?? "No phone number saved"}
          </p>
        </div>

        <div className="space-y-1">
          <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
            Address
          </p>
          <p className="text-sm leading-7 text-foreground">
            {address.addressLine}
          </p>
          <p className="text-sm leading-7 text-muted-foreground">
            {address.city} {address.postalCode}
          </p>
        </div>
      </div>

      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          className="rounded-full"
          disabled={isDeleting}
          onClick={() => {
            setDeleteState(null);
            setIsEditing(true);
          }}
        >
          <PencilLine className="size-4" />
          Edit
        </Button>
        <Button
          type="button"
          variant="destructive"
          className="rounded-full"
          disabled={isDeleting}
          onClick={handleDeleteAddress}
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
    </article>
  );
}
