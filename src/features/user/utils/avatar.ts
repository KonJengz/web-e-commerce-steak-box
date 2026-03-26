import type { User } from "@/features/user/types/user.type";

const buildFallbackAvatar = (seed: string): string => {
  return `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(seed)}`;
};

export const resolveUserAvatar = (
  email: User["email"],
  image: User["image"],
): string => {
  const normalizedImage = image?.trim();

  if (!normalizedImage) {
    return buildFallbackAvatar(email);
  }

  return normalizedImage;
};
