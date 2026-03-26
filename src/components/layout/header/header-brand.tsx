import Link from "next/link";

import {
  LogoSteakBox,
  LogoSteakBoxDark,
} from "@/components/shared/icons/logo-main";
import { LogoIconSteakBox } from "../../shared/icons/logo-icon";

export function HeaderBrand() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <LogoIconSteakBox className="h-12 shrink-0" />
      <LogoSteakBoxDark className="h-12 shrink-0 dark:hidden block" />
      <LogoSteakBox className="h-12 shrink-0  dark:block hidden" />
    </Link>
  );
}
