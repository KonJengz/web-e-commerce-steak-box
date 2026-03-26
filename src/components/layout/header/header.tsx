import { HeaderActions } from "./header-actions";
import { HeaderBrand } from "./header-brand";
import { HeaderSearch } from "./header-search";
import type { HeaderUser } from "./header.types";
import MainContainer from "./main-container";

export function Header() {
  // TODO: Replace with real auth state from a server-side session.
  const isLoggedIn: boolean = true;
  const user: HeaderUser = {
    name: "John Doe",
    email: "john@example.com",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=John",
  };
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
              isLoggedIn={isLoggedIn}
              user={user}
            />
          </div>
        </div>
      </MainContainer>
    </header>
  );
}
