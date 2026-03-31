import Link from "next/link";

import {
  LogoSteakBox,
  LogoSteakBoxDark,
} from "@/components/shared/icons/logo-main";
import { LogoIconSteakBox } from "../../shared/icons/logo-icon";

export function HeaderBrand() {
  return (
    <Link href="/" className="flex items-center gap-1.5 sm:gap-2">
      <LogoIconSteakBox className="h-9 sm:h-10 md:h-12 shrink-0" />
      <div className="hidden sm:block shrink-0">
        <LogoSteakBoxDark className="h-8 sm:h-10 md:h-12 dark:hidden block" />
        <LogoSteakBox className="h-8 sm:h-10 md:h-12 dark:block hidden" />
      </div>
    </Link>
  );
}
