"use server";

import { revalidatePath } from "next/cache";
import { isRedirectError } from "next/dist/client/components/redirect-error";
import { z } from "zod";

import { getCurrentAccessToken } from "@/features/auth/services/current-user.service";
import {
  updateProfileSchema,
} from "@/features/user/schemas/profile.schema";
import { userService } from "@/features/user/services/user.service";
import type { UpdateProfileActionState } from "@/features/user/types/user.type";
import { ApiError } from "@/lib/api/error";

const getUpdateProfileInput = (
  formData: FormData,
): {
  image: FormDataEntryValue | undefined;
  name: string | undefined;
  removeImage: boolean;
} => {
  const image = formData.get("image");
  const name = formData.get("name");

  return {
    image: image === null ? undefined : image,
    name: typeof name === "string" ? name : undefined,
    removeImage: formData.get("removeImage") === "true",
  };
};

const buildUnauthorizedState = async (): Promise<UpdateProfileActionState> => {
  return {
    message: "Your session expired. Please sign in again to update your profile.",
    requiresReauthentication: true,
    success: false,
  };
};

const buildApiErrorState = (error: ApiError): UpdateProfileActionState => {
  if (error.message === "Name is required.") {
    return {
      fieldErrors: {
        name: [error.message],
      },
      message: error.message,
      success: false,
    };
  }

  if (error.message.startsWith("Unsupported image type")) {
    return {
      fieldErrors: {
        image: ["Please choose a JPG, PNG, or WEBP image."],
      },
      message: "Please choose a JPG, PNG, or WEBP image.",
      success: false,
    };
  }

  if (error.message.startsWith("Image is too large")) {
    return {
      fieldErrors: {
        image: ["Image must be 5 MB or smaller."],
      },
      message: "Image must be 5 MB or smaller.",
      success: false,
    };
  }

  if (error.message === "Provide at least one of name, image, or remove_image=true") {
    return {
      message: "Update at least one profile detail before saving.",
      success: false,
    };
  }

  return {
    message: error.message,
    success: false,
  };
};

export async function updateProfileAction(
  formData: FormData,
): Promise<UpdateProfileActionState> {
  const accessToken = await getCurrentAccessToken();

  if (!accessToken) {
    return buildUnauthorizedState();
  }

  const validatedInput = updateProfileSchema.safeParse(
    getUpdateProfileInput(formData),
  );

  if (!validatedInput.success) {
    return {
      fieldErrors: validatedInput.error.flatten().fieldErrors,
      message: z.prettifyError(validatedInput.error),
      success: false,
    };
  }

  try {
    const result = await userService.updateProfile(
      accessToken,
      validatedInput.data,
    );

    revalidatePath("/(main)", "layout");

    return {
      message: "Profile updated successfully.",
      profile: result.data,
      success: true,
    };
  } catch (error) {
    if (isRedirectError(error)) {
      throw error;
    }

    if (error instanceof ApiError) {
      if (error.status === 401) {
        return buildUnauthorizedState();
      }

      return buildApiErrorState(error);
    }

    return {
      message: "Unable to update your profile right now. Please try again.",
      success: false,
    };
  }
}
