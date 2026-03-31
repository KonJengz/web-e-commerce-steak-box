import { HeaderActions } from "./header-actions";
import { HeaderBrand } from "./header-brand";
import { HeaderSearch } from "./header-search";
import type { HeaderUser } from "./header.types";
import MainContainer from "./main-container";

interface HeaderProps {
  isLoggedIn: boolean;
  user: HeaderUser | null;
}

export function Header({ isLoggedIn, user }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/80 shadow-sm backdrop-blur-xl transition-all duration-300">
      <MainContainer>
        <div className="flex items-center justify-between gap-3 md:gap-8 xl:gap-16">
          <div className="shrink-0">
            <HeaderBrand />
          </div>

          <div className="hidden flex-1 md:block">
            <HeaderSearch />
          </div>

          <div className="flex shrink-0 items-center">
            <HeaderActions
              isLoggedIn={isLoggedIn}
              user={user}
            />
          </div>
        </div>

        {/* Mobile search bar */}
        <div className="mt-2 md:hidden">
          <HeaderSearch />
        </div>
      </MainContainer>
    </header>
  );
}
