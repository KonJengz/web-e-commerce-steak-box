"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  ImagePlus,
  Loader2,
  PencilLine,
  Trash2,
  Upload,
} from "lucide-react";
import { useEffect, useRef, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { updateProfileAction } from "@/features/user/actions/update-profile.action";
import {
  PROFILE_IMAGE_ACCEPT,
  PROFILE_IMAGE_MAX_SIZE_MB,
  updateProfileSchema,
  type UpdateProfileInput,
} from "@/features/user/schemas/profile.schema";
import type { UpdateProfileActionState, UserProfile } from "@/features/user/types/user.type";
import { resolveUserAvatar } from "@/features/user/utils/avatar";

interface ProfileEditSheetProps {
  profile: UserProfile;
}

const getDefaultValues = (profile: UserProfile): UpdateProfileInput => {
  return {
    image: undefined,
    name: profile.name,
    removeImage: false,
  };
};

export function ProfileEditSheet({ profile }: ProfileEditSheetProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [isPending, startTransition] = useTransition();
  const [submissionState, setSubmissionState] =
    useState<UpdateProfileActionState | null>(null);
  const imageInputRef = useRef<HTMLInputElement | null>(null);
  const initialAvatar = resolveUserAvatar(profile.email, profile.image);
  const fallbackAvatar = resolveUserAvatar(profile.email, null);
  const initialName = profile.name.trim();
  const [selectedPreviewUrl, setSelectedPreviewUrl] = useState<string | null>(
    null,
  );
  const {
    control,
    clearErrors,
    handleSubmit,
    reset,
    setError,
    setValue,
  } = useForm<UpdateProfileInput>({
    defaultValues: getDefaultValues(profile),
    resolver: zodResolver(updateProfileSchema),
  });
  const watchedName = useWatch({
    control,
    name: "name",
  });
  const watchedImage = useWatch({
    control,
    name: "image",
  });
  const watchedRemoveImage = useWatch({
    control,
    name: "removeImage",
  });

  useEffect(() => {
    return () => {
      if (selectedPreviewUrl) {
        URL.revokeObjectURL(selectedPreviewUrl);
      }
    };
  }, [selectedPreviewUrl]);

  useEffect(() => {
    if (isOpen) {
      return;
    }

    reset(getDefaultValues(profile));

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }
  }, [isOpen, profile, reset]);

  const applyServerErrors = (state: UpdateProfileActionState): void => {
    const nameError = state.fieldErrors?.name?.[0];
    const imageError = state.fieldErrors?.image?.[0];
    const removeImageError = state.fieldErrors?.removeImage?.[0];

    if (nameError) {
      setError("name", {
        message: nameError,
        type: "server",
      });
    }

    if (imageError) {
      setError("image", {
        message: imageError,
        type: "server",
      });
    }

    if (removeImageError) {
      setError("removeImage", {
        message: removeImageError,
        type: "server",
      });
    }
  };

  const clearSelectedPreview = (): void => {
    if (!selectedPreviewUrl) {
      return;
    }

    URL.revokeObjectURL(selectedPreviewUrl);
    setSelectedPreviewUrl(null);
  };

  const handleOpenChange = (nextOpen: boolean): void => {
    setIsOpen(nextOpen);

    if (nextOpen) {
      return;
    }

    setSubmissionState(null);
    clearErrors();
    reset(getDefaultValues(profile));
    clearSelectedPreview();
  };

  const handleImageReset = (): void => {
    clearErrors("image");
    setSubmissionState(null);
    clearSelectedPreview();

    if (imageInputRef.current) {
      imageInputRef.current.value = "";
    }

    if (watchedImage) {
      setValue("image", undefined, {
        shouldDirty: true,
        shouldValidate: true,
      });
      return;
    }

    if (!profile.image) {
      return;
    }

    setValue("removeImage", !watchedRemoveImage, {
      shouldDirty: true,
      shouldValidate: true,
    });
  };

  const handleProfileUpdate = (values: UpdateProfileInput): void => {
    clearErrors();
    setSubmissionState(null);

    const hasNameChanged = values.name.trim() !== initialName;
    const hasSelectedImage = Boolean(values.image);
    const hasRemovedImage = Boolean(profile.image) && values.removeImage;

    if (!hasNameChanged && !hasSelectedImage && !hasRemovedImage) {
      setSubmissionState({
        message: "Update your name or photo before saving.",
        success: false,
      });
      return;
    }

    const formData = new FormData();

    formData.set("name", values.name.trim());

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

      setIsOpen(false);
      router.refresh();
    });
  };

  const normalizedName = watchedName?.trim() ?? "";
  const hasNameChanged = normalizedName !== initialName;
  const hasSelectedImage = Boolean(watchedImage);
  const hasRemovedImage = Boolean(profile.image) && Boolean(watchedRemoveImage);
  const hasChanges = hasNameChanged || hasSelectedImage || hasRemovedImage;
  const previewUrl =
    selectedPreviewUrl ?? (watchedRemoveImage ? fallbackAvatar : initialAvatar);
  const imageActionLabel = watchedImage
    ? "Clear selected image"
    : watchedRemoveImage
      ? "Keep current photo"
      : profile.image
        ? "Remove current photo"
        : null;

  return (
    <Sheet open={isOpen} onOpenChange={handleOpenChange}>
      <SheetTrigger asChild>
        <Button className="rounded-full px-5">
          <PencilLine className="size-4" />
          Edit Profile
        </Button>
      </SheetTrigger>

      <SheetContent side="right" className="w-full sm:max-w-lg">
        <SheetHeader className="border-b border-border/60 px-6 py-5">
          <SheetTitle>Edit your profile</SheetTitle>
          <SheetDescription>
            Update the name and photo shown across your account.
          </SheetDescription>
        </SheetHeader>

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <form
            id="profile-edit-form"
            className="space-y-6"
            noValidate
            onSubmit={handleSubmit(handleProfileUpdate)}
          >
            {submissionState?.message && !submissionState.success ? (
              <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm leading-6 whitespace-pre-line text-destructive">
                {submissionState.message}
              </div>
            ) : null}

            <section className="rounded-[1.75rem] border border-border/70 bg-card/70 p-5">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                <Avatar className="size-24 border border-border/80 shadow-md">
                  <AvatarImage
                    src={previewUrl}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                    {(normalizedName || profile.email).charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="space-y-2">
                  <p className="text-sm font-medium text-foreground">
                    Profile photo preview
                  </p>
                  <p className="text-sm leading-6 text-muted-foreground">
                    Upload a JPG, PNG, or WEBP image up to{" "}
                    {PROFILE_IMAGE_MAX_SIZE_MB} MB.
                  </p>

                  {watchedRemoveImage ? (
                    <p className="text-sm text-primary">
                      Your current photo will be removed when you save.
                    </p>
                  ) : null}
                </div>
              </div>
            </section>

            <Controller
              control={control}
              name="name"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Display Name</FieldLabel>
                  <Input
                    {...field}
                    id={field.name}
                    autoComplete="name"
                    aria-invalid={fieldState.invalid}
                    className="mt-2 h-12 rounded-2xl border-border/70 bg-background/60 px-4"
                    disabled={isPending}
                    placeholder="How your name should appear"
                  />
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            <Controller
              control={control}
              name="image"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>New Photo</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    type="file"
                    accept={PROFILE_IMAGE_ACCEPT}
                    aria-invalid={fieldState.invalid}
                    className="mt-2 h-auto rounded-2xl border-border/70 bg-background/60 px-4 py-3 file:mr-3 file:rounded-full file:bg-primary/10 file:px-3 file:py-1.5 file:text-primary"
                    disabled={isPending}
                    ref={(element) => {
                      field.ref(element);
                      imageInputRef.current = element;
                    }}
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
                  <p className="text-sm leading-6 text-muted-foreground">
                    Leave this empty if you only want to rename your profile.
                  </p>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />

            {imageActionLabel ? (
              <div className="flex flex-wrap gap-3">
                <Button
                  type="button"
                  variant={watchedRemoveImage ? "destructive" : "outline"}
                  className="rounded-full"
                  disabled={isPending}
                  onClick={handleImageReset}
                >
                  {watchedImage ? (
                    <ImagePlus className="size-4" />
                  ) : (
                    <Trash2 className="size-4" />
                  )}
                  {imageActionLabel}
                </Button>
              </div>
            ) : null}
          </form>
        </div>

        <SheetFooter className="border-t border-border/60 px-6 py-5">
          <div className="flex w-full flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={isPending}
              onClick={() => handleOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form="profile-edit-form"
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
                  Save Changes
                </>
              )}
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
