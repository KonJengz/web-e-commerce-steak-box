"use client";

import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  ArrowRight,
  GripVertical,
  ImagePlus,
  ImageUp,
  Loader2,
  PencilLine,
  Save,
  Sparkles,
  Star,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  adminDestructiveButtonClassName,
  adminOutlineButtonClassName,
  adminPrimaryButtonClassName,
} from "@/components/ui/admin-action-styles";
import {
  adminErrorNoticePreWrapClassName,
  adminSuccessNoticeClassName,
  adminWarningNoticeClassName,
} from "@/components/ui/admin-notice-styles";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { NativeSelect } from "@/components/ui/native-select";
import type { Category } from "@/features/category/types/category.type";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import {
  addProductImagesAction,
  deleteProductImageAction,
  getProductImagesAction,
  reorderProductImagesAction,
} from "@/features/product/actions/product-gallery.action";
import { updateProductAction } from "@/features/product/actions/update-product.action";
import {
  adminProductInputClassName,
  adminProductSelectClassName,
  adminProductTextareaClassName,
} from "@/features/product/components/admin-product-form.styles";
import {
  PRODUCT_IMAGE_ACCEPT,
  PRODUCT_IMAGE_MAX_COUNT,
  PRODUCT_IMAGE_MAX_SIZE_MB,
  updateProductSchema,
  type UpdateProductFormValues,
  type UpdateProductInput,
} from "@/features/product/schemas/product.schema";
import type {
  ProductGalleryActionState,
  ProductImage,
  ProductSummary,
  UpdateProductActionState,
} from "@/features/product/types/product.type";
import cloudinaryLoader from "@/lib/cloudinary-loader";
import { cn } from "@/lib/utils";

interface AdminProductEditSheetProps {
  categories: Category[];
  product: ProductSummary;
}

const SUCCESS_NOTICE_DURATION_MS = 3000;
const emptyGalleryImages: ProductImage[] = [];
const emptySelectedImages: File[] = [];
const emptyHighlightedImageIds: string[] = [];

const getDefaultValues = (
  product: ProductSummary,
): UpdateProductFormValues => {
  return {
    categoryId: product.categoryId ?? "",
    coverImage: undefined,
    currentPrice: product.currentPrice,
    description: product.description,
    isActive: product.isActive ? "active" : "inactive",
    name: product.name,
    stock: String(product.stock),
  };
};

const getCategoryPlaceholder = (product: ProductSummary): string => {
  if (product.categoryId) {
    return "Leave category unchanged";
  }

  return "Keep uncategorized";
};

const getVisibilityTone = (isActive: boolean): string => {
  return isActive
    ? "bg-emerald-500/12 text-emerald-700 dark:text-emerald-300"
    : "bg-muted text-muted-foreground";
};

const formatImageSize = (size: number): string => {
  if (size >= 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  }

  return `${Math.max(1, Math.round(size / 1024))} KB`;
};

const moveImageToFront = (
  images: ProductImage[],
  imageId: string,
): string[] => {
  const selectedImage = images.find((image) => image.id === imageId);

  if (!selectedImage) {
    return images.map((image) => image.id);
  }

  return [
    selectedImage.id,
    ...images
      .filter((image) => image.id !== imageId)
      .map((image) => image.id),
  ];
};

const moveImageByOffset = (
  images: ProductImage[],
  imageId: string,
  offset: -1 | 1,
): string[] => {
  const currentIndex = images.findIndex((image) => image.id === imageId);

  if (currentIndex < 0) {
    return images.map((image) => image.id);
  }

  const nextIndex = currentIndex + offset;

  if (nextIndex < 0 || nextIndex >= images.length) {
    return images.map((image) => image.id);
  }

  const reorderedImages = [...images];
  const [selectedImage] = reorderedImages.splice(currentIndex, 1);
  reorderedImages.splice(nextIndex, 0, selectedImage);

  return reorderedImages.map((image) => image.id);
};

const moveImageToPosition = (
  images: ProductImage[],
  draggedImageId: string,
  targetImageId: string,
): ProductImage[] => {
  const draggedIndex = images.findIndex((image) => image.id === draggedImageId);
  const targetIndex = images.findIndex((image) => image.id === targetImageId);

  if (
    draggedIndex < 0 ||
    targetIndex < 0 ||
    draggedIndex === targetIndex
  ) {
    return images;
  }

  const reorderedImages = [...images];
  const [draggedImage] = reorderedImages.splice(draggedIndex, 1);
  reorderedImages.splice(targetIndex, 0, draggedImage);

  return reorderedImages;
};

const getGalleryNoticeClassName = (
  state: ProductGalleryActionState,
): string => {
  if (state.success) {
    if (state.warning) {
      return adminWarningNoticeClassName;
    }

    return adminSuccessNoticeClassName;
  }

  return adminErrorNoticePreWrapClassName;
};

export function AdminProductEditSheet({
  categories,
  product,
}: AdminProductEditSheetProps) {
  const router = useRouter();
  const [isSavingProduct, startSavingProductTransition] = useTransition();
  const [isGalleryPending, startGalleryTransition] = useTransition();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [submissionState, setSubmissionState] =
    useState<UpdateProductActionState | null>(null);
  const [galleryState, setGalleryState] =
    useState<ProductGalleryActionState | null>(null);
  const [galleryImages, setGalleryImages] =
    useState<ProductImage[]>(emptyGalleryImages);
  const [isGalleryLoaded, setIsGalleryLoaded] = useState<boolean>(false);
  const [coverImagePreviewUrl, setCoverImagePreviewUrl] = useState<string | null>(
    null,
  );
  const [selectedGalleryFiles, setSelectedGalleryFiles] =
    useState<File[]>(emptySelectedImages);
  const [draggedImageId, setDraggedImageId] = useState<string | null>(null);
  const [dragOverImageId, setDragOverImageId] = useState<string | null>(null);
  const [highlightedImageIds, setHighlightedImageIds] = useState<string[]>(
    emptyHighlightedImageIds,
  );
  const [fileInputKey, setFileInputKey] = useState<number>(0);
  const [galleryFileInputKey, setGalleryFileInputKey] = useState<number>(0);
  const galleryPanelRef = useRef<HTMLElement | null>(null);
  const galleryImagesRef = useRef<ProductImage[]>(emptyGalleryImages);
  const dragStartImagesRef = useRef<ProductImage[]>(emptyGalleryImages);
  const { control, clearErrors, getValues, handleSubmit, reset, setError } =
    useForm<UpdateProductFormValues, undefined, UpdateProductInput>({
      defaultValues: getDefaultValues(product),
      resolver: zodResolver(updateProductSchema),
    });
  const selectedCoverImage = useWatch({
    control,
    name: "coverImage",
  });
  const selectedGalleryPreviewUrls = useMemo(() => {
    return selectedGalleryFiles.map((file) => URL.createObjectURL(file));
  }, [selectedGalleryFiles]);
  const livePrimaryImage =
    galleryImages.find((image) => image.isPrimary) ?? null;
  const remainingGallerySlots = Math.max(
    0,
    PRODUCT_IMAGE_MAX_COUNT - galleryImages.length,
  );
  const coverImagePreviewSource =
    coverImagePreviewUrl ?? livePrimaryImage?.imageUrl ?? product.imageUrl;
  const coverImageStatusLabel = selectedCoverImage
    ? "New primary image ready"
    : livePrimaryImage
      ? "Live primary image"
      : product.imageUrl
        ? "Current primary image"
        : "No cover image";
  const coverImageDescription = selectedCoverImage
    ? "Saving will replace the current primary image. Gallery actions below still work independently."
    : livePrimaryImage
      ? "Use Save Changes to replace the current primary image, or use the gallery controls below to change the order instantly."
      : "Upload a cover image here, or add the first gallery image below to establish a primary image automatically.";

  useEffect(() => {
    return () => {
      if (coverImagePreviewUrl) {
        URL.revokeObjectURL(coverImagePreviewUrl);
      }
    };
  }, [coverImagePreviewUrl]);

  useEffect(() => {
    return () => {
      selectedGalleryPreviewUrls.forEach((previewUrl) => {
        URL.revokeObjectURL(previewUrl);
      });
    };
  }, [selectedGalleryPreviewUrls]);

  useEffect(() => {
    galleryImagesRef.current = galleryImages;
  }, [galleryImages]);

  useEffect(() => {
    if (!galleryState?.success || !galleryState.message) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setGalleryState((currentState) => {
        if (!currentState?.success) {
          return currentState;
        }

        return null;
      });
    }, SUCCESS_NOTICE_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [galleryState]);

  useEffect(() => {
    if (highlightedImageIds.length === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setHighlightedImageIds(emptyHighlightedImageIds);
    }, SUCCESS_NOTICE_DURATION_MS);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [highlightedImageIds]);

  const clearCoverImagePreview = (): void => {
    if (!coverImagePreviewUrl) {
      return;
    }

    URL.revokeObjectURL(coverImagePreviewUrl);
    setCoverImagePreviewUrl(null);
  };

  const clearSelectedGalleryImages = (): void => {
    setSelectedGalleryFiles(emptySelectedImages);
    setGalleryFileInputKey((currentKey) => currentKey + 1);
  };

  const resetGalleryDragState = (): void => {
    setDraggedImageId(null);
    setDragOverImageId(null);
  };

  const resetEditor = (): void => {
    clearErrors();
    reset(getDefaultValues(product));
    setSubmissionState(null);
    setGalleryState(null);
    setGalleryImages(emptyGalleryImages);
    galleryImagesRef.current = emptyGalleryImages;
    dragStartImagesRef.current = emptyGalleryImages;
    setIsGalleryLoaded(false);
    setHighlightedImageIds(emptyHighlightedImageIds);
    clearCoverImagePreview();
    clearSelectedGalleryImages();
    resetGalleryDragState();
    setFileInputKey((currentKey) => currentKey + 1);
  };

  const focusGalleryPanel = (): void => {
    window.requestAnimationFrame(() => {
      galleryPanelRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "nearest",
      });
    });
  };

  const applyServerErrors = (state: UpdateProductActionState): void => {
    const categoryIdError = state.fieldErrors?.categoryId?.[0];
    const coverImageError = state.fieldErrors?.coverImage?.[0];
    const currentPriceError = state.fieldErrors?.currentPrice?.[0];
    const descriptionError = state.fieldErrors?.description?.[0];
    const isActiveError = state.fieldErrors?.isActive?.[0];
    const nameError = state.fieldErrors?.name?.[0];
    const stockError = state.fieldErrors?.stock?.[0];

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

    if (categoryIdError) {
      setError("categoryId", {
        message: categoryIdError,
        type: "server",
      });
    }

    if (coverImageError) {
      setError("coverImage", {
        message: coverImageError,
        type: "server",
      });
    }

    if (currentPriceError) {
      setError("currentPrice", {
        message: currentPriceError,
        type: "server",
      });
    }

    if (stockError) {
      setError("stock", {
        message: stockError,
        type: "server",
      });
    }

    if (isActiveError) {
      setError("isActive", {
        message: isActiveError,
        type: "server",
      });
    }
  };

  const handleGalleryResult = (
    result: ProductGalleryActionState,
  ): boolean => {
    if (result.requiresReauthentication) {
      router.replace(buildLoginRedirectPath("/admin/products"));
      return false;
    }

    if (result.requiresAdmin) {
      router.replace("/");
      return false;
    }

    if (result.images) {
      setGalleryImages(result.images);
    }

    resetGalleryDragState();
    setGalleryState(
      result.message || result.fieldErrors || !result.success ? result : null,
    );
    setIsGalleryLoaded(true);

    return result.success;
  };

  const loadGalleryImages = (): void => {
    setGalleryState(null);
    setIsGalleryLoaded(false);

    startGalleryTransition(async () => {
      const result = await getProductImagesAction(product.id);
      handleGalleryResult(result);
    });
  };

  const handleOpenChange = (nextOpen: boolean): void => {
    if (!nextOpen) {
      setIsOpen(false);
      resetEditor();
      return;
    }

    setIsOpen(true);
    resetEditor();
    loadGalleryImages();
  };

  const handleClearSelectedCoverImage = (): void => {
    clearErrors("coverImage");
    setSubmissionState(null);
    clearCoverImagePreview();
    reset({
      ...getValues(),
      coverImage: undefined,
    });
    setFileInputKey((currentKey) => currentKey + 1);
  };

  const handleUpdateProduct = (values: UpdateProductInput): void => {
    clearErrors();
    setSubmissionState(null);

    const formData = new FormData();

    formData.set("categoryId", values.categoryId);

    if (values.coverImage) {
      formData.set("coverImage", values.coverImage);
    }

    formData.set("currentPrice", String(values.currentPrice));
    formData.set("description", values.description);
    formData.set("isActive", values.isActive);
    formData.set("name", values.name);
    formData.set("productId", product.id);
    formData.set("stock", String(values.stock));

    startSavingProductTransition(async () => {
      const result = await updateProductAction(formData);

      setSubmissionState(result);

      if (!result.success) {
        applyServerErrors(result);

        if (result.requiresReauthentication) {
          router.replace(buildLoginRedirectPath("/admin/products"));
          return;
        }

        if (result.requiresAdmin) {
          router.replace("/");
        }

        return;
      }

      setIsOpen(false);
      reset({
        categoryId: values.categoryId,
        coverImage: undefined,
        currentPrice: String(values.currentPrice),
        description: values.description,
        isActive: values.isActive,
        name: values.name,
        stock: String(values.stock),
      });
      clearCoverImagePreview();
      setFileInputKey((currentKey) => currentKey + 1);
      setSubmissionState(null);
    });
  };

  const handleGalleryFileSelection = (
    event: React.ChangeEvent<HTMLInputElement>,
  ): void => {
    const nextFiles = Array.from(event.target.files ?? []).filter(
      (file) => file.size > 0 && file.name.length > 0,
    );

    setGalleryState(null);

    if (nextFiles.length === 0) {
      setSelectedGalleryFiles(emptySelectedImages);
      return;
    }

    if (remainingGallerySlots === 0) {
      setSelectedGalleryFiles(emptySelectedImages);
      setGalleryState({
        fieldErrors: {
          images: ["This product already has the maximum of 4 images."],
        },
        message: "This product already has the maximum of 4 images.",
        success: false,
      });
      setGalleryFileInputKey((currentKey) => currentKey + 1);
      return;
    }

    if (nextFiles.length > remainingGallerySlots) {
      setSelectedGalleryFiles(emptySelectedImages);
      setGalleryState({
        fieldErrors: {
          images: [
            `Only ${remainingGallerySlots} more image${remainingGallerySlots === 1 ? "" : "s"} can be added right now.`,
          ],
        },
        message: `Only ${remainingGallerySlots} more image${remainingGallerySlots === 1 ? "" : "s"} can be added right now.`,
        success: false,
      });
      setGalleryFileInputKey((currentKey) => currentKey + 1);
      return;
    }

    setSelectedGalleryFiles(nextFiles);
  };

  const handleUploadGalleryImages = (): void => {
    if (selectedGalleryFiles.length === 0) {
      return;
    }

    const formData = new FormData();

    formData.set("productId", product.id);
    selectedGalleryFiles.forEach((file) => {
      formData.append("images", file);
    });

    setGalleryState(null);

    startGalleryTransition(async () => {
      const previousImageIds = new Set(galleryImages.map((image) => image.id));
      const result = await addProductImagesAction(formData);
      const wasSuccessful = handleGalleryResult(result);

      if (wasSuccessful) {
        const newlyAddedImageIds =
          result.images
            ?.filter((image) => !previousImageIds.has(image.id))
            .map((image) => image.id) ?? emptyHighlightedImageIds;

        if (newlyAddedImageIds.length > 0) {
          setHighlightedImageIds(newlyAddedImageIds);
          focusGalleryPanel();
        }

        clearSelectedGalleryImages();
      }
    });
  };

  const handleReorderGalleryImages = (
    imageIds: string[],
    previousImages?: ProductImage[],
  ): void => {
    setGalleryState(null);

    startGalleryTransition(async () => {
      const result = await reorderProductImagesAction({
        imageIds,
        productId: product.id,
      });
      const wasSuccessful = handleGalleryResult(result);
      if (wasSuccessful) {
        return;
      }

      if (previousImages) {
        setGalleryImages(previousImages);
        galleryImagesRef.current = previousImages;
      }
    });
  };

  const handlePointerDragStart = (
    event: React.PointerEvent<HTMLButtonElement>,
    imageId: string,
  ): void => {
    if (isBusy || galleryImages.length < 2) {
      event.preventDefault();
      return;
    }

    if (event.pointerType === "mouse" && event.button !== 0) {
      return;
    }

    event.preventDefault();
    event.stopPropagation();
    dragStartImagesRef.current = galleryImagesRef.current;
    setDraggedImageId(imageId);
    setDragOverImageId(imageId);
  };

  useEffect(() => {
    if (!draggedImageId) {
      return;
    }

    const handleWindowPointerMove = (event: PointerEvent): void => {
      const targetElement = document.elementFromPoint(event.clientX, event.clientY);
      const dropTarget = targetElement?.closest<HTMLElement>("[data-gallery-image-id]");
      const targetImageId = dropTarget?.dataset.galleryImageId;

      if (!targetImageId || targetImageId === draggedImageId) {
        return;
      }

      setDragOverImageId(targetImageId);
      setGalleryImages((currentImages) => {
        const nextImages = moveImageToPosition(
          currentImages,
          draggedImageId,
          targetImageId,
        );

        galleryImagesRef.current = nextImages;

        return nextImages;
      });
    };

    const handleWindowPointerUp = (): void => {
      const previousImages = dragStartImagesRef.current;
      const nextImages = galleryImagesRef.current;
      const hasReordered =
        previousImages.length === nextImages.length &&
        previousImages.some((image, index) => image.id !== nextImages[index]?.id);

      setDraggedImageId(null);
      setDragOverImageId(null);

      if (!hasReordered) {
        return;
      }

      setGalleryState(null);

      startGalleryTransition(async () => {
        const result = await reorderProductImagesAction({
          imageIds: nextImages.map((image) => image.id),
          productId: product.id,
        });

        if (result.requiresReauthentication) {
          router.replace(buildLoginRedirectPath("/admin/products"));
          return;
        }

        if (result.requiresAdmin) {
          router.replace("/");
          return;
        }

        if (result.images) {
          setGalleryImages(result.images);
          galleryImagesRef.current = result.images;
        }

        setGalleryState(
          result.message || result.fieldErrors || !result.success ? result : null,
        );
        setIsGalleryLoaded(true);
        if (result.success) {
          return;
        }

        setGalleryImages(previousImages);
        galleryImagesRef.current = previousImages;
      });
    };

    window.addEventListener("pointermove", handleWindowPointerMove);
    window.addEventListener("pointerup", handleWindowPointerUp);
    window.addEventListener("pointercancel", handleWindowPointerUp);

    return () => {
      window.removeEventListener("pointermove", handleWindowPointerMove);
      window.removeEventListener("pointerup", handleWindowPointerUp);
      window.removeEventListener("pointercancel", handleWindowPointerUp);
    };
  }, [draggedImageId, product.id, router, startGalleryTransition]);

  const handleDeleteImage = (image: ProductImage): void => {
    const shouldDelete = window.confirm(
      image.isPrimary
        ? "Delete the current primary image? If other images exist, the next one will become primary automatically."
        : "Delete this gallery image?",
    );

    if (!shouldDelete) {
      return;
    }

    setGalleryState(null);

    startGalleryTransition(async () => {
      const result = await deleteProductImageAction({
        imageId: image.id,
        productId: product.id,
      });
      const wasSuccessful = handleGalleryResult(result);
      if (wasSuccessful) {
        return;
      }
    });
  };

  const isBusy = isSavingProduct || isGalleryPending;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className={adminOutlineButtonClassName}
        >
          <PencilLine className="size-4" />
          Edit
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[min(94dvh,58rem)] max-w-[72rem] border-border/60 bg-card/95 p-0">
        <div className="flex min-h-0 flex-col">
          <DialogHeader className="border-b border-border/50 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.09),transparent_55%),linear-gradient(180deg,rgba(255,255,255,0.05),transparent)] px-6 py-5">
            <div className="flex items-start justify-between gap-4 pr-10">
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-[11px] font-semibold tracking-[0.26em] uppercase text-muted-foreground">
                    Product Media Console
                  </p>
                  <Badge
                    variant="secondary"
                    className={cn("rounded-full", getVisibilityTone(product.isActive))}
                  >
                    {product.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="space-y-1">
                  <DialogTitle className="text-xl font-semibold tracking-tight">
                    {product.name}
                  </DialogTitle>
                  <DialogDescription className="max-w-2xl leading-6">
                    Fine-tune the catalog fields, manage the full image set, and
                    keep the primary image visible without leaving the admin
                    directory.
                  </DialogDescription>
                </div>
              </div>

              <div className="hidden min-w-0 text-right sm:block">
                <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-muted-foreground">
                  Current category
                </p>
                <p className="mt-1 text-sm font-medium text-foreground">
                  {product.categoryName ?? "Uncategorized"}
                </p>
              </div>
            </div>
          </DialogHeader>

          <form
            className="flex min-h-0 flex-1 flex-col"
            noValidate
            onSubmit={handleSubmit(handleUpdateProduct)}
          >
            <div className="flex-1 space-y-6 overflow-y-auto px-6 py-6">
              {submissionState?.message ? (
                <div
                  className={
                    submissionState.success
                      ? adminSuccessNoticeClassName
                      : adminErrorNoticePreWrapClassName
                  }
                >
                  {submissionState.message}
                </div>
              ) : null}

              <div className="grid gap-6 xl:grid-cols-[1.25fr_0.75fr]">
                <section className="rounded-[1.9rem] border border-border/60 bg-muted/20 p-4">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="space-y-1">
                        <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                          Primary image
                        </p>
                        <p className="text-sm font-medium text-foreground">
                          {coverImageStatusLabel}
                        </p>
                      </div>

                      <Badge
                        variant="secondary"
                        className="rounded-full bg-background/75"
                      >
                        <Sparkles className="mr-1 size-3.5" />
                        Hero frame
                      </Badge>
                    </div>

                    <div className="overflow-hidden rounded-[1.5rem] border border-border/60 bg-background/65">
                      <div className="aspect-[4/3] overflow-hidden bg-linear-to-br from-muted/80 via-muted/45 to-muted/30">
                        {coverImagePreviewSource ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={coverImagePreviewSource}
                              alt={product.name}
                              className="h-full w-full object-cover"
                            />
                          </>
                        ) : (
                          <div className="flex h-full w-full items-center justify-center">
                            <div className="text-center">
                              <ImageUp className="mx-auto size-10 text-muted-foreground/35" />
                              <p className="mt-3 text-sm font-medium text-foreground">
                                No cover image yet
                              </p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 rounded-[1.25rem] border border-dashed border-border/60 bg-background/60 p-4">
                      <p className="text-sm leading-6 text-muted-foreground">
                        {coverImageDescription}
                      </p>

                      <Controller
                        control={control}
                        name="coverImage"
                        render={({ field, fieldState }) => (
                          <Field data-invalid={fieldState.invalid}>
                            <FieldLabel htmlFor={field.name}>
                              Replace Primary Image
                            </FieldLabel>
                            <Input
                              key={fileInputKey}
                              id={field.name}
                              name={field.name}
                              type="file"
                              accept={PRODUCT_IMAGE_ACCEPT}
                              aria-invalid={fieldState.invalid}
                              className="mt-2 h-auto rounded-2xl border-border/70 bg-card/85 px-4 py-3 file:mr-3 file:rounded-full file:bg-primary/10 file:px-3 file:py-1.5 file:text-primary"
                              disabled={isBusy}
                              ref={field.ref}
                              onBlur={field.onBlur}
                              onChange={(event) => {
                                const nextFile = event.target.files?.[0];
                                const nextPreviewUrl = nextFile
                                  ? URL.createObjectURL(nextFile)
                                  : null;

                                setSubmissionState(null);
                                clearErrors("coverImage");
                                clearCoverImagePreview();
                                setCoverImagePreviewUrl(nextPreviewUrl);
                                field.onChange(nextFile);
                              }}
                            />
                            <FieldError errors={[fieldState.error]} />
                          </Field>
                        )}
                      />

                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-xs leading-5 text-muted-foreground">
                          Saving replaces the primary image only. Accepts JPG,
                          PNG, or WEBP up to {PRODUCT_IMAGE_MAX_SIZE_MB} MB.
                        </p>

                        {selectedCoverImage ? (
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className={adminOutlineButtonClassName}
                            disabled={isBusy}
                            onClick={handleClearSelectedCoverImage}
                          >
                            <Trash2 className="size-4" />
                            Clear Selected File
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </section>

                <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-1">
                  <div className="rounded-2xl border border-border/50 bg-muted/20 px-4 py-3">
                    <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                      Product ID
                    </p>
                    <p className="mt-1 truncate text-sm font-medium text-foreground">
                      {product.id}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/50 bg-muted/20 px-4 py-3">
                    <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                      Current price
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {product.currentPrice}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-border/50 bg-muted/20 px-4 py-3">
                    <p className="text-[11px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                      Media usage
                    </p>
                    <p className="mt-1 text-sm font-medium text-foreground">
                      {galleryImages.length} / {PRODUCT_IMAGE_MAX_COUNT} images
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
                      {remainingGallerySlots > 0
                        ? `${remainingGallerySlots} slot${remainingGallerySlots === 1 ? "" : "s"} open`
                        : "Gallery is full"}
                    </p>
                  </div>
                </div>
              </div>

              <section className="rounded-[1.9rem] border border-border/60 bg-[linear-gradient(180deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <p className="text-[11px] font-semibold tracking-[0.24em] uppercase text-muted-foreground">
                      Gallery management
                    </p>
                    <h3 className="text-lg font-semibold tracking-tight text-foreground">
                      Arrange the full product media set
                    </h3>
                    <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                      Add more images, promote any frame to primary, or trim the
                      gallery without closing this editor. Reorder actions apply
                      immediately.
                    </p>
                  </div>

                  <Badge
                    variant="outline"
                    className="rounded-full bg-background/75 px-3 py-1"
                  >
                    {isGalleryPending && !isGalleryLoaded ? (
                      <>
                        <Loader2 className="size-3.5 animate-spin" />
                        Loading media
                      </>
                    ) : (
                      <>
                        <Sparkles className="size-3.5" />
                        {galleryImages.length} live frame
                        {galleryImages.length === 1 ? "" : "s"}
                      </>
                    )}
                  </Badge>
                </div>

                {galleryState?.message ? (
                  <div className={cn("mt-4", getGalleryNoticeClassName(galleryState))}>
                    {galleryState.message}
                  </div>
                ) : null}

                <div className="mt-5 grid gap-5 xl:grid-cols-[0.88fr_1.12fr]">
                  <section className="space-y-4 rounded-[1.5rem] border border-dashed border-border/60 bg-background/50 p-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-foreground">
                        Add more images
                      </p>
                      <p className="text-sm leading-6 text-muted-foreground">
                        The first image on a product becomes the primary frame
                        automatically. After that, new uploads join the gallery
                        until the 4-image limit is reached.
                      </p>
                    </div>

                    <Input
                      key={galleryFileInputKey}
                      type="file"
                      multiple
                      accept={PRODUCT_IMAGE_ACCEPT}
                      className="h-auto rounded-2xl border-border/70 bg-card/85 px-4 py-3 file:mr-3 file:rounded-full file:bg-primary/10 file:px-3 file:py-1.5 file:text-primary"
                      disabled={isBusy || remainingGallerySlots === 0}
                      onChange={handleGalleryFileSelection}
                    />

                    <div className="flex flex-wrap items-center gap-2 text-xs leading-5 text-muted-foreground">
                      <span>
                        Upload up to {remainingGallerySlots} more image
                        {remainingGallerySlots === 1 ? "" : "s"}.
                      </span>
                      <span>JPG, PNG, or WEBP.</span>
                      <span>Max {PRODUCT_IMAGE_MAX_SIZE_MB} MB each.</span>
                    </div>

                    {galleryImages.length > 0 ? (
                      <div className="space-y-3 rounded-[1.2rem] border border-border/50 bg-muted/15 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <p className="text-sm font-medium text-foreground">
                            Live gallery preview
                          </p>
                          <Badge
                            variant="outline"
                            className="rounded-full bg-background/75"
                          >
                            {galleryImages.length} / {PRODUCT_IMAGE_MAX_COUNT}
                          </Badge>
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                          {galleryImages.map((image, index) => (
                            <div
                              key={image.id}
                              className={cn(
                                "relative aspect-square overflow-hidden rounded-[1rem] border border-border/55 bg-background/75",
                                highlightedImageIds.includes(image.id)
                                  ? "border-emerald-500/55 ring-2 ring-emerald-500/25"
                                  : "",
                              )}
                            >
                              <Image
                                loader={cloudinaryLoader}
                                src={image.imageUrl}
                                alt={`${product.name} preview ${index + 1}`}
                                fill
                                sizes="8rem"
                                className="object-cover"
                              />
                              <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-linear-to-t from-black/65 via-black/10 to-transparent px-2 py-1.5">
                                <p className="text-[10px] font-semibold tracking-[0.16em] text-white uppercase">
                                  {image.isPrimary ? "Primary" : `Slot ${index + 1}`}
                                </p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {selectedGalleryFiles.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {selectedGalleryFiles.map((file, index) => (
                          <div
                            key={`${file.name}-${file.lastModified}-${index}`}
                            className="overflow-hidden rounded-[1.2rem] border border-border/60 bg-card/90"
                          >
                            <div className="relative aspect-[4/3] overflow-hidden bg-muted/35">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={selectedGalleryPreviewUrls[index]}
                                alt={file.name}
                                className="h-full w-full object-cover"
                              />
                            </div>
                            <div className="space-y-1 px-3 py-3">
                              <p className="truncate text-sm font-medium text-foreground">
                                {file.name}
                              </p>
                              <p className="text-xs leading-5 text-muted-foreground">
                                {formatImageSize(file.size)}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="rounded-[1.2rem] border border-border/50 bg-muted/20 px-4 py-4 text-sm leading-6 text-muted-foreground">
                        Select one or more new images to stage them here before
                        uploading.
                      </div>
                    )}

                    <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                      <Button
                        type="button"
                        variant="outline"
                        className={adminOutlineButtonClassName}
                        disabled={isBusy || selectedGalleryFiles.length === 0}
                        onClick={clearSelectedGalleryImages}
                      >
                        <Trash2 className="size-4" />
                        Clear Selection
                      </Button>
                      <Button
                        type="button"
                        className={adminPrimaryButtonClassName}
                        disabled={isBusy || selectedGalleryFiles.length === 0}
                        onClick={handleUploadGalleryImages}
                      >
                        {isGalleryPending ? (
                          <>
                            <Loader2 className="size-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <ImagePlus className="size-4" />
                            Upload {selectedGalleryFiles.length} Image
                            {selectedGalleryFiles.length === 1 ? "" : "s"}
                          </>
                        )}
                      </Button>
                    </div>
                  </section>

                  <section ref={galleryPanelRef} className="space-y-4">
                    {galleryImages.length > 1 ? (
                      <div className="flex flex-wrap items-center gap-2 rounded-[1.2rem] border border-border/50 bg-muted/20 px-4 py-3 text-sm leading-6 text-muted-foreground">
                        <GripVertical className="size-4 text-foreground/60" />
                        Press and drag the grip on any image to reorder the
                        gallery instantly. The first slot remains the primary
                        image.
                      </div>
                    ) : null}

                    {!isGalleryLoaded && isGalleryPending ? (
                      <div className="flex min-h-[18rem] items-center justify-center rounded-[1.5rem] border border-border/60 bg-muted/20">
                        <div className="text-center">
                          <Loader2 className="mx-auto size-6 animate-spin text-muted-foreground" />
                          <p className="mt-3 text-sm text-muted-foreground">
                            Loading gallery frames...
                          </p>
                        </div>
                      </div>
                    ) : galleryImages.length > 0 ? (
                      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                        {galleryImages.map((image, index) => {
                          const isFirstImage = index === 0;
                          const isLastImage = index === galleryImages.length - 1;
                          const isDraggedImage = draggedImageId === image.id;
                          const isDropTarget =
                            dragOverImageId === image.id &&
                            draggedImageId !== null &&
                            draggedImageId !== image.id;
                          const isNewlyAddedImage = highlightedImageIds.includes(
                            image.id,
                          );

                          return (
                            <article
                              key={image.id}
                              data-gallery-image-id={image.id}
                              className={cn(
                                "overflow-hidden rounded-[1.35rem] border border-border/60 bg-background/75 p-3 transition-all duration-200 select-none",
                                isDraggedImage
                                  ? "scale-[0.985] border-primary/45 opacity-70 shadow-[0_24px_54px_rgba(0,0,0,0.14)]"
                                  : "",
                                isDropTarget
                                  ? "border-primary/55 ring-2 ring-primary/25 shadow-[0_22px_50px_rgba(0,0,0,0.12)]"
                                  : "",
                                isNewlyAddedImage
                                  ? "border-emerald-500/60 ring-2 ring-emerald-500/25 shadow-[0_22px_50px_rgba(16,185,129,0.18)]"
                                  : "",
                              )}
                            >
                              <div className="relative aspect-square overflow-hidden rounded-[1.1rem] border border-border/50 bg-muted/30">
                                <Image
                                  loader={cloudinaryLoader}
                                  src={image.imageUrl}
                                  alt={`${product.name} image ${index + 1}`}
                                  fill
                                  sizes="(min-width: 1536px) 16rem, (min-width: 1280px) 18rem, (min-width: 640px) 42vw, 92vw"
                                  className="object-cover"
                                />

                                <div className="pointer-events-none absolute inset-x-0 top-0 flex items-center justify-between gap-2 p-3">
                                  <Badge
                                    variant="secondary"
                                    className="rounded-full bg-background/85"
                                  >
                                    Slot {index + 1}
                                  </Badge>
                                  {image.isPrimary ? (
                                    <Badge className="rounded-full bg-primary/90 text-primary-foreground">
                                      <Star className="size-3.5" />
                                      Primary
                                    </Badge>
                                  ) : null}
                                </div>
                              </div>

                              <div className="mt-3 space-y-3">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2">
                                    <button
                                      type="button"
                                      aria-label={`Drag to reorder ${product.name} image ${index + 1}`}
                                      className={cn(
                                        "inline-flex size-7 items-center justify-center rounded-full border border-border/60 bg-background/75 text-muted-foreground transition-colors touch-none",
                                        galleryImages.length > 1 && !isBusy
                                          ? "cursor-grab active:cursor-grabbing hover:border-primary/35 hover:bg-muted/70 hover:text-primary"
                                          : "cursor-default",
                                      )}
                                      disabled={isBusy || galleryImages.length < 2}
                                      onPointerDown={(event) => {
                                        handlePointerDragStart(event, image.id);
                                      }}
                                    >
                                      <GripVertical className="size-4" />
                                    </button>
                                    <p className="text-[11px] font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                                      Reorder handle
                                    </p>
                                  </div>
                                  <p className="text-sm font-medium text-foreground">
                                    {image.isPrimary
                                      ? "Primary catalog image"
                                      : "Gallery image"}
                                  </p>
                                  <p className="text-xs leading-5 text-muted-foreground">
                                    {image.isPrimary
                                      ? "This frame appears across the directory and product cards."
                                      : "Use Set Primary to promote this frame to the lead image."}
                                  </p>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={adminOutlineButtonClassName}
                                    disabled={isBusy || image.isPrimary}
                                    onClick={() => {
                                      handleReorderGalleryImages(
                                        moveImageToFront(galleryImages, image.id),
                                      );
                                    }}
                                  >
                                    <Star className="size-4" />
                                    Set Primary
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="destructive"
                                    size="sm"
                                    className={adminDestructiveButtonClassName}
                                    disabled={isBusy}
                                    onClick={() => handleDeleteImage(image)}
                                  >
                                    <Trash2 className="size-4" />
                                    Delete
                                  </Button>
                                </div>

                                <div className="grid grid-cols-2 gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={adminOutlineButtonClassName}
                                    disabled={isBusy || isFirstImage}
                                    onClick={() => {
                                      handleReorderGalleryImages(
                                        moveImageByOffset(galleryImages, image.id, -1),
                                      );
                                    }}
                                  >
                                    <ArrowLeft className="size-4" />
                                    Earlier
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className={adminOutlineButtonClassName}
                                    disabled={isBusy || isLastImage}
                                    onClick={() => {
                                      handleReorderGalleryImages(
                                        moveImageByOffset(galleryImages, image.id, 1),
                                      );
                                    }}
                                  >
                                    <ArrowRight className="size-4" />
                                    Later
                                  </Button>
                                </div>
                              </div>
                            </article>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="flex min-h-[18rem] items-center justify-center rounded-[1.5rem] border border-dashed border-border/60 bg-muted/15 px-6 py-8">
                        <div className="max-w-sm text-center">
                          <ImageUp className="mx-auto size-9 text-muted-foreground/45" />
                          <p className="mt-4 text-base font-medium text-foreground">
                            No product images yet
                          </p>
                          <p className="mt-2 text-sm leading-6 text-muted-foreground">
                            Upload the first image from the panel on the left and
                            it will become the primary image automatically.
                          </p>
                        </div>
                      </div>
                    )}
                  </section>
                </div>
              </section>

              <div className="grid gap-5 lg:grid-cols-2">
                <Controller
                  control={control}
                  name="name"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Product Name</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        placeholder="For example, Dry-Aged Ribeye"
                        aria-invalid={fieldState.invalid}
                        className={cn(adminProductInputClassName)}
                        disabled={isBusy}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="categoryId"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Category</FieldLabel>
                      <NativeSelect
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        disabled={isBusy || categories.length === 0}
                        className={cn(adminProductSelectClassName)}
                      >
                        <option value="">
                          {categories.length > 0
                            ? getCategoryPlaceholder(product)
                            : "Create a category first"}
                        </option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </NativeSelect>
                      <FieldError errors={[fieldState.error]} />
                      <p className="text-xs leading-5 text-muted-foreground">
                        The current API can reassign category, but it cannot
                        clear an existing category back to empty.
                      </p>
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="currentPrice"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>
                        Current Price (THB)
                      </FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        min={0}
                        step="0.01"
                        value={
                          typeof field.value === "string" ||
                          typeof field.value === "number"
                            ? field.value
                            : ""
                        }
                        placeholder="0.00"
                        aria-invalid={fieldState.invalid}
                        className={cn(adminProductInputClassName)}
                        disabled={isBusy}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="stock"
                  render={({ field, fieldState }) => (
                    <Field>
                      <FieldLabel htmlFor={field.name}>Stock</FieldLabel>
                      <Input
                        {...field}
                        id={field.name}
                        type="number"
                        min={0}
                        step="1"
                        value={
                          typeof field.value === "string" ||
                          typeof field.value === "number"
                            ? field.value
                            : ""
                        }
                        placeholder="0"
                        aria-invalid={fieldState.invalid}
                        className={cn(adminProductInputClassName)}
                        disabled={isBusy}
                      />
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />

                <Controller
                  control={control}
                  name="isActive"
                  render={({ field, fieldState }) => (
                    <Field className="lg:col-span-2">
                      <FieldLabel htmlFor={field.name}>Visibility</FieldLabel>
                      <NativeSelect
                        {...field}
                        id={field.name}
                        aria-invalid={fieldState.invalid}
                        disabled={isBusy}
                        className={cn(adminProductSelectClassName)}
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </NativeSelect>
                      <FieldError errors={[fieldState.error]} />
                    </Field>
                  )}
                />
              </div>

              <Controller
                control={control}
                name="description"
                render={({ field, fieldState }) => (
                  <Field>
                    <FieldLabel htmlFor={field.name}>Description</FieldLabel>
                    <textarea
                      {...field}
                      id={field.name}
                      placeholder="Write the product story, cut details, or serving notes."
                      aria-invalid={fieldState.invalid}
                      disabled={isBusy}
                      className={cn(adminProductTextareaClassName)}
                    />
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>

            <DialogFooter className="border-t border-border/50 bg-[linear-gradient(180deg,rgba(255,255,255,0.01),rgba(255,255,255,0.04))] px-6 py-4 shadow-[0_-14px_40px_rgba(0,0,0,0.08)] supports-backdrop-filter:backdrop-blur-sm sm:justify-between">
              <p className="text-xs leading-5 text-muted-foreground">
                Gallery actions apply immediately. Core fields and cover
                replacement save when you use Save Changes.
              </p>

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center">
                <Button
                  type="button"
                  variant="outline"
                  className={adminOutlineButtonClassName}
                  disabled={isBusy}
                  onClick={() => handleOpenChange(false)}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="lg"
                  className={adminPrimaryButtonClassName}
                  disabled={isBusy}
                >
                  {isSavingProduct ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="size-4" />
                      Save Changes
                    </>
                  )}
                </Button>
              </div>
            </DialogFooter>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
