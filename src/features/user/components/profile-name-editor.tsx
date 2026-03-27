"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, PencilLine, UserRound } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateProfileAction } from "@/features/user/actions/update-profile.action";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import {
  updateProfileNameSchema,
  type UpdateProfileNameInput,
} from "@/features/user/schemas/profile.schema";
import type {
  UpdateProfileActionState,
  UserProfile,
} from "@/features/user/types/user.type";

interface ProfileNameEditorProps {
  profile: UserProfile;
}

export function ProfileNameEditor({ profile }: ProfileNameEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [submissionState, setSubmissionState] =
    useState<UpdateProfileActionState | null>(null);
  const initialName = profile.name.trim();
  const { control, clearErrors, handleSubmit, reset, setError } =
    useForm<UpdateProfileNameInput>({
      defaultValues: {
        name: profile.name,
      },
      resolver: zodResolver(updateProfileNameSchema),
    });
  const currentName =
    useWatch({
      control,
      name: "name",
    })?.trim() ?? "";
  const hasChanges = currentName !== initialName;

  const closeEditor = (): void => {
    setIsEditing(false);
    setSubmissionState(null);
    clearErrors();
    reset({
      name: profile.name,
    });
  };

  const applyServerErrors = (state: UpdateProfileActionState): void => {
    const nameError = state.fieldErrors?.name?.[0];

    if (nameError) {
      setError("name", {
        message: nameError,
        type: "server",
      });
    }
  };

  const handleSave = (values: UpdateProfileNameInput): void => {
    clearErrors();
    setSubmissionState(null);

    if (values.name.trim() === initialName) {
      closeEditor();
      return;
    }

    const formData = new FormData();
    formData.set("name", values.name.trim());

    startTransition(async () => {
      const result = await updateProfileAction(formData);

      if (!result.success) {
        setSubmissionState(result);
        applyServerErrors(result);

        if (result.requiresReauthentication) {
          router.replace(buildLoginRedirectPath("/profile"));
        }

        return;
      }

      closeEditor();
      router.refresh();
    });
  };

  return (
    <section className="rounded-[1.5rem] border border-border/70 bg-background/65 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
            <UserRound className="size-4" />
          </span>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Display Name
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              This is the name shown across your account.
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
        <div className="mt-5 rounded-[1.25rem] border border-border/60 bg-card/85 px-4 py-3">
          <p className="text-lg font-medium text-foreground">{profile.name}</p>
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

          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  autoComplete="name"
                  aria-invalid={fieldState.invalid}
                  className="mt-2 h-12 rounded-2xl border-border/70 bg-card/85 px-4"
                  disabled={isPending}
                  placeholder="How your name should appear"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

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
            <Button
              type="submit"
              className="rounded-full"
              disabled={isPending || !hasChanges}
            >
              {isPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Name"
              )}
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}
