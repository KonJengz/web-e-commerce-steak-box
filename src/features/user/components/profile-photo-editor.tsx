"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Camera, Loader2, PencilLine, Trash2, Upload } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { updateProfileAction } from "@/features/user/actions/update-profile.action";
import {
  PROFILE_IMAGE_ACCEPT,
  PROFILE_IMAGE_MAX_SIZE_MB,
  updateProfileImageSchema,
  type UpdateProfileImageInput,
} from "@/features/user/schemas/profile.schema";
import type {
  UpdateProfileActionState,
  UserProfile,
} from "@/features/user/types/user.type";
import { resolveUserAvatar } from "@/features/user/utils/avatar";

interface ProfilePhotoEditorProps {
  profile: UserProfile;
}

export function ProfilePhotoEditor({ profile }: ProfilePhotoEditorProps) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [submissionState, setSubmissionState] =
    useState<UpdateProfileActionState | null>(null);
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(
    null,
  );
  const [fileInputKey, setFileInputKey] = useState<number>(0);
  const currentAvatar = resolveUserAvatar(profile.email, profile.image);
  const fallbackAvatar = resolveUserAvatar(profile.email, null);
  const {
    control,
    clearErrors,
    handleSubmit,
    reset,
    setError,
    setValue,
  } = useForm<UpdateProfileImageInput>({
    defaultValues: {
      image: undefined,
      removeImage: false,
    },
    resolver: zodResolver(updateProfileImageSchema),
  });
  const selectedImage = useWatch({
    control,
    name: "image",
  });
  const removeImage = useWatch({
    control,
    name: "removeImage",
  });
  const hasChanges = Boolean(selectedImage) || Boolean(removeImage);
  const previewUrl =
    selectedPreviewUrl ?? (removeImage ? fallbackAvatar : currentAvatar);
  const imageActionLabel = selectedImage
    ? "Clear selected image"
    : removeImage
      ? "Keep current photo"
      : profile.image
        ? "Remove current photo"
        : null;

  useEffect(() => {
    return () => {
      if (selectedPreviewUrl) {
        URL.revokeObjectURL(selectedPreviewUrl);
      }
    };
  }, [selectedPreviewUrl]);

  const clearSelectedPreview = (): void => {
    if (!selectedPreviewUrl) {
      return;
    }

    URL.revokeObjectURL(selectedPreviewUrl);
    setSelectedPreviewUrl(null);
  };

  const closeEditor = (): void => {
    setIsEditing(false);
    setSubmissionState(null);
    clearErrors();
    clearSelectedPreview();
    reset({
      image: undefined,
      removeImage: false,
    });
    setFileInputKey((currentKey) => currentKey + 1);
  };

  const applyServerErrors = (state: UpdateProfileActionState): void => {
    const imageError = state.fieldErrors?.image?.[0];

    if (imageError) {
      setError("image", {
        message: imageError,
        type: "server",
      });
    }
  };

  const handleImageToggle = (): void => {
    clearErrors("image");
    setSubmissionState(null);

    if (selectedImage) {
      clearSelectedPreview();
      setValue("image", undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
      setFileInputKey((currentKey) => currentKey + 1);

      return;
    }

    if (!profile.image) {
      return;
    }

    setValue("removeImage", !removeImage, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleSave = (values: UpdateProfileImageInput): void => {
    clearErrors();
    setSubmissionState(null);

    const formData = new FormData();

    if (values.image) {
      formData.set("image", values.image);
    }

    if (values.removeImage) {
      formData.set("removeImage", "true");
    }

    startTransition(async () => {
      const result = await updateProfileAction(formData);

      if (!result.success) {
        setSubmissionState(result);
        applyServerErrors(result);

        if (result.requiresReauthentication) {
          router.replace("/login?redirectTo=/profile");
        }

        return;
      }

      setIsEditing(false);
      setSubmissionState(null);
      clearErrors();
      clearSelectedPreview();
      reset({
        image: undefined,
        removeImage: false,
      });
      setFileInputKey((currentKey) => currentKey + 1);
      router.refresh();
    });
  };

  return (
    <section className="rounded-[1.5rem] border border-border/70 bg-background/65 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
            <Camera className="size-4" />
          </span>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Profile Photo
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Upload a JPG, PNG, or WEBP image up to {PROFILE_IMAGE_MAX_SIZE_MB}{" "}
              MB.
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

      <div className="mt-5 flex items-center gap-4 rounded-[1.25rem] border border-border/60 bg-card/85 px-4 py-4">
        <Avatar className="size-18 border border-border/80 shadow-md">
          <AvatarImage
            src={previewUrl}
            alt={profile.name}
            referrerPolicy="no-referrer"
          />
          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
            {profile.name.charAt(0)}
          </AvatarFallback>
        </Avatar>

        <div className="space-y-1">
          <p className="text-base font-medium text-foreground">
            {profile.image ? "Custom profile photo" : "Generated fallback avatar"}
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            {removeImage
              ? "Your current photo will be removed when you save."
              : "This image appears in your header and account area."}
          </p>
        </div>
      </div>

      {isEditing ? (
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
            name="image"
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Choose New Photo</FieldLabel>
                  <Input
                    key={fileInputKey}
                    id={field.name}
                    name={field.name}
                    type="file"
                    accept={PROFILE_IMAGE_ACCEPT}
                    aria-invalid={fieldState.invalid}
                    className="mt-2 h-auto rounded-2xl border-border/70 bg-card/85 px-4 py-3 file:mr-3 file:rounded-full file:bg-primary/10 file:px-3 file:py-1.5 file:text-primary"
                    disabled={isPending}
                    ref={field.ref}
                    onChange={(event) => {
                      const nextFile = event.target.files?.[0];
                      const nextPreviewUrl = nextFile
                      ? URL.createObjectURL(nextFile)
                      : null;

                    setSubmissionState(null);
                    clearErrors("image");
                    clearSelectedPreview();
                    setSelectedPreviewUrl(nextPreviewUrl);
                    setValue("removeImage", false, {
                      shouldDirty: true,
                      shouldValidate: false,
                    });
                    field.onChange(nextFile);
                  }}
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          {imageActionLabel ? (
            <Button
              type="button"
              variant={removeImage ? "destructive" : "outline"}
              className="rounded-full"
              disabled={isPending}
              onClick={handleImageToggle}
            >
              <Trash2 className="size-4" />
              {imageActionLabel}
            </Button>
          ) : null}

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
                <>
                  <Upload className="size-4" />
                  Save Photo
                </>
              )}
            </Button>
          </div>
        </form>
      ) : null}
    </section>
  );
}
