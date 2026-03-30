import type { Metadata } from "next";
import Link from "next/link";
import {
  ChevronRight,
  Package,
  Star,
  Truck,
  type LucideIcon,
} from "lucide-react";

import { LogoIconSteakBox } from "@/components/shared/icons/logo-icon";
import { RegisterForm } from "@/features/auth/components/register-form";
import { authService } from "@/features/auth/services/auth.service";
import { normalizeAuthRedirectTarget } from "@/features/auth/utils/auth-redirect";
import { BASE_PRIVATE_METADATA } from "@/lib/metadata";

export const metadata: Metadata = {
  ...BASE_PRIVATE_METADATA,
  title: "Register - Join Steak Box",
  description:
    "Create your Steak Box account, verify your email, and get signed in automatically.",
};

interface HighlightItem {
  description: string;
  icon: LucideIcon;
  title: string;
}

const joinHighlights: HighlightItem[] = [
  {
    description:
      "Get access to exclusive prime cuts and seasonal specials available only to members.",
    icon: Star,
    title: "Exclusive Member Cuts",
  },
  {
    description:
      "Choose your preferred delivery frequency and skip or pause anytime with no fees.",
    icon: Truck,
    title: "Flexible Subscriptions",
  },
  {
    description:
      "Your steaks are hand-picked, vacuum-sealed, and delivered in sustainable eco-packaging.",
    icon: Package,
    title: "Premium Handling",
  },
];

interface RegisterPageProps {
  searchParams: Promise<{
    email?: string | string[];
    redirectTo?: string | string[];
  }>;
}

export default async function RegisterPage({
  searchParams,
}: RegisterPageProps) {
  const resolvedSearchParams = await searchParams;
  const emailParam = resolvedSearchParams.email;
  const redirectParam = resolvedSearchParams.redirectTo;
  const prefilledEmail =
    typeof emailParam === "string" ? emailParam : (emailParam?.[0] ?? "");
  const redirectToValue =
    typeof redirectParam === "string" ? redirectParam : redirectParam?.[0];
  const redirectTo = normalizeAuthRedirectTarget(redirectToValue);
  const googleAuthHref = authService.buildGoogleStartHref(redirectTo);

  return (
    <div className="py-6 sm:py-10">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] items-start">
        <section className="relative overflow-hidden rounded-[2.5rem] border border-border/70 bg-[linear-gradient(145deg,#2d1f1f_0%,#1a1617_45%,#0f0d0e_100%)] p-6 text-primary-foreground shadow-[0_40px_140px_rgba(0,0,0,0.6)] sm:p-10 lg:p-14">
          <div className="pointer-events-none absolute inset-0 opacity-40">
            <div className="absolute top-[-10%] right-[-10%] size-[50%] rounded-full bg-primary/20 blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] size-[50%] rounded-full bg-[#c9ab79]/10 blur-[100px]" />
          </div>

          <div className="relative flex h-full flex-col justify-between gap-16">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-5 py-2 text-sm font-semibold text-[#f2d7ac] backdrop-blur-md">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                  <span className="relative inline-flex size-2 rounded-full bg-primary" />
                </span>
                Limited Availability
              </div>

              <div className="space-y-6">
                <LogoIconSteakBox className="h-16 w-auto brightness-110" />

                <div className="space-y-5">
                  <h1 className="max-w-xl text-5xl font-bold leading-[1.1] tracking-tight text-white sm:text-6xl">
                    Elevate your dining experience,{" "}
                    <span className="text-primary italic">one box</span> at a
                    time.
                  </h1>

                  <p className="max-w-lg text-lg leading-relaxed text-white/60">
                    Create your account now, confirm the email code, and
                    we&apos;ll sign you in automatically so you can continue
                    without an extra login step.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              {joinHighlights.map((item) => {
                const Icon = item.icon;

                return (
                  <div
                    key={item.title}
                    className="group rounded-[2rem] border border-white/5 bg-white/3 p-5 transition-all hover:border-white/10 hover:bg-white/6"
                  >
                    <div className="flex items-center gap-5">
                      <div className="rounded-[1.25rem] bg-white/5 p-3.5 transition-colors group-hover:bg-primary/20">
                        <Icon className="size-6 text-primary brightness-125" />
                      </div>

                      <div className="space-y-1">
                        <h2 className="text-lg font-bold tracking-tight text-white">
                          {item.title}
                        </h2>
                        <p className="text-sm leading-relaxed text-white/50">
                          {item.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between border-t border-white/10 pt-8">
              <p className="text-sm font-medium text-white/50">
                Already have an account?
              </p>
              <Link
                href={
                  redirectTo
                    ? {
                        pathname: "/login",
                        query: { redirectTo },
                      }
                    : "/login"
                }
                className="group inline-flex items-center gap-2 text-sm font-bold text-white transition-all hover:text-primary"
              >
                Sign in now
                <ChevronRight className="size-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>
        </section>

        <section className="flex flex-col justify-center">
          <RegisterForm
            googleAuthHref={googleAuthHref}
            prefilledEmail={prefilledEmail}
            redirectTo={redirectTo}
          />
        </section>
      </div>
    </div>
  );
}
