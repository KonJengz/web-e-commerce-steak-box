"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  PencilLine,
  ShieldCheck,
} from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import { updatePasswordAction } from "@/features/user/actions/password.action";
import {
  updatePasswordSchema,
  type UpdatePasswordInput,
} from "@/features/user/schemas/profile.schema";
import type {
  UpdatePasswordActionState,
  UserProfile,
} from "@/features/user/types/user.type";

interface ProfilePasswordEditorProps {
  profile: UserProfile;
  redirectPath?: string;
}

type PasswordFieldKey = "confirmPassword" | "currentPassword" | "newPassword";

export function ProfilePasswordEditor({
  profile,
  redirectPath = "/profile",
}: ProfilePasswordEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [submissionState, setSubmissionState] =
    useState<UpdatePasswordActionState | null>(null);
  const [visibleFields, setVisibleFields] = useState<
    Record<PasswordFieldKey, boolean>
  >({
    confirmPassword: false,
    currentPassword: false,
    newPassword: false,
  });
  const { control, clearErrors, handleSubmit, reset, setError } =
    useForm<UpdatePasswordInput>({
      defaultValues: {
        confirmPassword: "",
        currentPassword: "",
        newPassword: "",
      },
      resolver: zodResolver(updatePasswordSchema),
    });

  const closeEditor = (): void => {
    setIsEditing(false);
    setSubmissionState(null);
    clearErrors();
    reset({
      confirmPassword: "",
      currentPassword: "",
      newPassword: "",
    });
    setVisibleFields({
      confirmPassword: false,
      currentPassword: false,
      newPassword: false,
    });
  };

  const toggleFieldVisibility = (fieldName: PasswordFieldKey): void => {
    setVisibleFields((currentState) => ({
      ...currentState,
      [fieldName]: !currentState[fieldName],
    }));
  };

  const applyServerErrors = (state: UpdatePasswordActionState): void => {
    const currentPasswordError = state.fieldErrors?.currentPassword?.[0];
    const newPasswordError = state.fieldErrors?.newPassword?.[0];
    const confirmPasswordError = state.fieldErrors?.confirmPassword?.[0];

    if (currentPasswordError) {
      setError("currentPassword", {
        message: currentPasswordError,
        type: "server",
      });
    }

    if (newPasswordError) {
      setError("newPassword", {
        message: newPasswordError,
        type: "server",
      });
    }

    if (confirmPasswordError) {
      setError("confirmPassword", {
        message: confirmPasswordError,
        type: "server",
      });
    }
  };

  const handleSave = (values: UpdatePasswordInput): void => {
    clearErrors();
    setSubmissionState(null);
    const loginRedirectPath = buildLoginRedirectPath(redirectPath);

    startTransition(async () => {
      const result = await updatePasswordAction(values);

      if (!result.success) {
        setSubmissionState(result);
        applyServerErrors(result);

        if (result.requiresReauthentication || result.redirectToLogin) {
          router.replace(loginRedirectPath);
        }

        return;
      }

      closeEditor();

      if (result.redirectToLogin) {
        router.replace(loginRedirectPath);
        return;
      }

      router.refresh();
    });
  };

  const renderPasswordField = (
    fieldName: PasswordFieldKey,
    label: string,
    placeholder: string,
    description?: string,
  ) => {
    return (
      <Controller
        control={control}
        name={fieldName}
        render={({ field, fieldState }) => (
          <Field data-invalid={fieldState.invalid}>
            <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
            {description ? (
              <p className="text-sm leading-6 text-muted-foreground">
                {description}
              </p>
            ) : null}
            <div className="relative mt-2">
              <Input
                {...field}
                id={field.name}
                type={visibleFields[fieldName] ? "text" : "password"}
                autoComplete={
                  fieldName === "currentPassword"
                    ? "current-password"
                    : "new-password"
                }
                aria-invalid={fieldState.invalid}
                className="h-12 rounded-2xl border-border/70 bg-card/85 pr-12 pl-4"
                disabled={isPending}
                placeholder={placeholder}
              />
              <button
                type="button"
                aria-label={
                  visibleFields[fieldName]
                    ? `Hide ${label.toLowerCase()}`
                    : `Show ${label.toLowerCase()}`
                }
                className="absolute inset-y-0 right-0 inline-flex w-12 items-center justify-center text-muted-foreground transition-colors hover:text-foreground"
                disabled={isPending}
                onClick={() => toggleFieldVisibility(fieldName)}
              >
                {visibleFields[fieldName] ? (
                  <EyeOff className="size-4" />
                ) : (
                  <Eye className="size-4" />
                )}
              </button>
            </div>
            <FieldError errors={[fieldState.error]} />
          </Field>
        )}
      />
    );
  };

  return (
    <section className="rounded-[1.5rem] border border-border/70 bg-background/65 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
            <KeyRound className="size-4" />
          </span>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Password
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Add a password for social login accounts or change the existing one.
            </p>
          </div>
        </div>

        {!isEditing ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={() => setIsEditing(true)}
          >
            <PencilLine className="size-4" />
            Edit
          </Button>
        ) : null}
      </div>

      {!isEditing ? (
        <div className="mt-5 space-y-4">
          <div className="rounded-[1.25rem] border border-border/60 bg-card/85 px-4 py-4">
            <div className="flex items-start gap-3">
              <span className="mt-0.5 inline-flex size-9 items-center justify-center rounded-full bg-primary/12 text-primary">
                <ShieldCheck className="size-4" />
              </span>
              <div className="space-y-1">
                <p className="text-base font-medium text-foreground">
                  Manage access for {profile.email}
                </p>
                <p className="text-sm leading-6 text-muted-foreground">
                  If you usually sign in with Google or GitHub, you can set a password
                  here for the first time. Saving also signs you out so the new
                  credentials take effect cleanly.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <form
          className="mt-5 space-y-4"
          noValidate
          onSubmit={handleSubmit(handleSave)}
        >
          {submissionState?.message ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm leading-6 whitespace-pre-line text-destructive">
              {submissionState.message}
            </div>
          ) : null}

          {renderPasswordField(
            "currentPassword",
            "Current Password",
            "Leave blank if this account has never had a password",
            "Leave this blank if you only sign in with Google or GitHub and have never set a password before.",
          )}

          {renderPasswordField(
            "newPassword",
            "New Password",
            "At least 8 characters",
          )}

          {renderPasswordField(
            "confirmPassword",
            "Confirm New Password",
            "Re-enter the new password",
          )}

          <div className="rounded-[1.25rem] border border-border/60 bg-card/70 px-4 py-3 text-sm leading-6 text-muted-foreground">
            Saving this change signs you out and you will need to log in again with
            the updated password.
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={isPending}
              onClick={closeEditor}
            >
              Cancel
            </Button>
            <Button type="submit" className="rounded-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save and Sign Out"
              )}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
