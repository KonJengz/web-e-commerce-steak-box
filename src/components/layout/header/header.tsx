import { HeaderActions } from "./header-actions";
import { HeaderBrand } from "./header-brand";
import { HeaderSearch } from "./header-search";
import type { HeaderUser } from "./header.types";
import MainContainer from "./main-container";

import { getCurrentUser } from "@/features/auth/services/current-user.service";
import type { User } from "@/features/user/types/user.type";
import { resolveUserAvatar } from "@/features/user/utils/avatar";

const toHeaderUser = (user: User): HeaderUser => {
  return {
    avatar: resolveUserAvatar(user.email, user.image),
    email: user.email,
    name: user.name,
    role: user.role,
  };
};

export async function Header() {
  const currentUser = await getCurrentUser();
  const user = currentUser ? toHeaderUser(currentUser) : null;
  const cartItemsCount: number = 3;

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 shadow-sm backdrop-blur-xl transition-all duration-300">
      <MainContainer>
        <div className="flex items-center justify-between gap-8 xl:gap-16">
          <div className="shrink-0">
            <HeaderBrand />
          </div>

          <div className="hidden flex-1 md:block">
            <HeaderSearch />
          </div>

          <div className="flex shrink-0 items-center">
            <HeaderActions
              cartItemsCount={cartItemsCount}
              isLoggedIn={Boolean(user)}
              user={user}
            />
          </div>
        </div>
      </MainContainer>
    </header>
  );
}
