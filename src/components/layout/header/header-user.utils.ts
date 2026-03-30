import type { HeaderUser } from "@/components/layout/header/header.types";
import type { User } from "@/features/user/types/user.type";
import { resolveUserAvatar } from "@/features/user/utils/avatar";

export const toHeaderUser = (user: User): HeaderUser => {
  return {
    avatar: resolveUserAvatar(user.email, user.image),
    email: user.email,
    name: user.name,
    role: user.role,
  };
};
