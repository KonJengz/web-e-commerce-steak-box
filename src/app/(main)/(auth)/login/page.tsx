import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  ShieldCheck,
  ShoppingBag,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { LogoIconSteakBox } from "@/components/shared/icons/logo-icon";
import { LoginForm } from "@/features/auth/components/login-form";
import { normalizePostAuthRedirect } from "@/features/auth/services/auth-session.service";
import { authService } from "@/features/auth/services/auth.service";

export const metadata: Metadata = {
  title: "Login",
};

interface HighlightItem {
  description: string;
  icon: LucideIcon;
  title: string;
}

const highlightItems: HighlightItem[] = [
  {
    description:
      "Track shipments, invoices, and repeat purchases without re-entering details.",
    icon: ShoppingBag,
    title: "Order history in one place",
  },
  {
    description:
      "Private account actions stay behind server-side auth and HttpOnly cookies.",
    icon: ShieldCheck,
    title: "Built for secure checkout",
  },
  {
    description:
      "Keep addresses, saved preferences, and cart flow ready for your next order.",
    icon: Sparkles,
    title: "Faster return visits",
  },
];

const getOAuthErrorMessage = (
  oauthErrorCode: string | null | undefined,
): string | null => {
  switch (oauthErrorCode) {
    case "account_suspended":
      return "This account is suspended. Contact support if you need help restoring access.";
    case "google_access_denied":
      return "Google sign-in was canceled before completion.";
    case "invalid_oauth_state":
    case "missing_oauth_callback":
    case "missing_oauth_code":
    case "missing_oauth_pkce_verifier":
      return "Your Google sign-in session could not be verified. Please try again from the Google button.";
    case "oauth_account_conflict":
      return "This email is already linked to a different sign-in method. Use your existing login method to continue.";
    case "oauth_exchange_failed":
    case "oauth_ticket_failed":
      return "Your Google sign-in session expired before we could finish logging you in. Please try again.";
    case "google_sign_in_failed":
      return "Google sign-in could not be completed. Please try again or continue with email instead.";
    default:
      return oauthErrorCode
        ? "Social sign-in could not be completed. Please try again."
        : null;
  }
};

interface LoginPageProps {
  searchParams: Promise<{
    oauth_error?: string | string[];
    redirectTo?: string | string[];
  }>;
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const redirectParam = resolvedSearchParams.redirectTo;
  const oauthErrorParam = resolvedSearchParams.oauth_error;
  const redirectToValue =
    typeof redirectParam === "string" ? redirectParam : redirectParam?.[0];
  const oauthErrorValue =
    typeof oauthErrorParam === "string" ? oauthErrorParam : oauthErrorParam?.[0];
  const redirectTo = normalizePostAuthRedirect(redirectToValue);
  const googleAuthHref = authService.buildGoogleStartHref(redirectTo);
  const oauthErrorMessage = getOAuthErrorMessage(oauthErrorValue);

  return (
    <div className="py-6 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(145deg,#3b2323_0%,#231f20_45%,#171314_100%)] p-6 text-primary-foreground shadow-[0_32px_120px_rgba(17,11,11,0.45)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,171,121,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(178,57,40,0.28),transparent_34%)]" />

          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur">
                <span className="size-2 rounded-full bg-[#c9ab79]" />
                Members Sign-In
              </div>

              <div className="space-y-5">
                <LogoIconSteakBox className="h-14 w-auto drop-shadow-sm" />

                <div className="space-y-4">
                  <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                    Step back into your box and keep the next order moving.
                  </h1>

                  <p className="max-w-lg text-base leading-7 text-white/70 sm:text-lg">
                    Access your account to review previous cuts, update delivery
                    details, and finish checkout without rebuilding the cart.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {highlightItems.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="rounded-[1.5rem] border border-white/10 bg-white/6 p-4 backdrop-blur-sm"
                  >
                    <div className="flex items-start gap-4">
                      <div className="mt-1 rounded-2xl bg-white/10 p-2.5">
                        <Icon className="size-5 text-[#c9ab79]" />
                      </div>

                      <div className="space-y-1">
                        <h2 className="text-base font-semibold text-white">
                          {item.title}
                        </h2>
                        <p className="text-sm leading-6 text-white/65">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-sm leading-6 text-white/70">
              Need a new account?{" "}
              <Link
                href={
                  redirectTo
                    ? {
                        pathname: "/register",
                        query: { redirectTo },
                      }
                    : "/register"
                }
                className="inline-flex items-center gap-1 font-semibold text-[#f2d7ac] transition-colors hover:text-white"
              >
                Create one
                <ChevronRight className="size-4" />
              </Link>
            </p>
          </div>
        </section>

        <section>
          <LoginForm
            googleAuthHref={googleAuthHref}
            oauthErrorMessage={oauthErrorMessage}
            redirectTo={redirectTo}
          />
        </section>
      </div>
    </div>
  );
}
