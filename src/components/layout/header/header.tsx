import { HeaderActions } from "./header-actions";
import { HeaderBrand } from "./header-brand";
import { HeaderSearch } from "./header-search";
import type { HeaderUser } from "./header.types";
import MainContainer from "./main-container";

import { getCurrentUser } from "@/features/auth/services/current-user.service";
import type { User } from "@/features/user/types/user.type";

const createDisplayName = (email: string): string => {
  const localPart = email.split("@")[0] ?? "user";

  return localPart
    .split(/[._-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const toHeaderUser = (user: User): HeaderUser => {
  return {
    avatar: `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(user.email)}`,
    email: user.email,
    name: createDisplayName(user.email),
  };
};

export async function Header() {
  const currentUser = await getCurrentUser();
  const user = currentUser ? toHeaderUser(currentUser) : null;
  const cartItemsCount: number = 3;

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/92 shadow-sm backdrop-blur supports-backdrop-filter:bg-background/60 transition-all duration-300">
      <MainContainer>
        <div className="flex items-center justify-between gap-10 xl:gap-16">
          <div>
            <HeaderBrand />
          </div>

          <div className="hidden flex-1 md:block">
            <HeaderSearch />
          </div>

          <div className="flex flex-none items-center">
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
