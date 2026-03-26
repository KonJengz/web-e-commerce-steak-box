import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight, MailSearch, ShieldCheck, TimerReset, type LucideIcon } from "lucide-react";

import { ForgotPasswordForm } from "@/features/auth/components/forgot-password-form";
import { LogoIconSteakBox } from "@/components/shared/icons/logo-icon";

export const metadata: Metadata = {
  title: "Forgot Password",
  description: "Request a password reset code for your Steak Box account.",
};

interface HighlightItem {
  description: string;
  icon: LucideIcon;
  title: string;
}

const forgotPasswordHighlights: HighlightItem[] = [
  {
    description:
      "If that email can be reset, we send a 6-digit code without revealing account status.",
    icon: MailSearch,
    title: "Generic response by design",
  },
  {
    description:
      "A 60-second cooldown per email helps prevent repeated code requests.",
    icon: TimerReset,
    title: "Built-in request throttling",
  },
  {
    description:
      "Reset codes stay short-lived so password recovery remains contained and safer.",
    icon: ShieldCheck,
    title: "Short verification window",
  },
];

export default function ForgotPasswordPage() {
  return (
    <div className="py-6 sm:py-10">
      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <section className="relative overflow-hidden rounded-[2rem] border border-border/70 bg-[linear-gradient(145deg,#30211f_0%,#21191a_45%,#161112_100%)] p-6 text-primary-foreground shadow-[0_32px_120px_rgba(17,11,11,0.45)] sm:p-8 lg:p-10">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(201,171,121,0.24),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(178,57,40,0.2),transparent_34%)]" />

          <div className="relative flex h-full flex-col justify-between gap-10">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/8 px-4 py-1.5 text-sm font-medium text-white/90 backdrop-blur">
                <span className="size-2 rounded-full bg-[#c9ab79]" />
                Recovery Access
              </div>

              <div className="space-y-5">
                <LogoIconSteakBox className="h-14 w-auto drop-shadow-sm" />

                <div className="space-y-4">
                  <h1 className="max-w-xl text-4xl font-semibold tracking-tight text-white sm:text-5xl">
                    Reset access without exposing the account behind it.
                  </h1>

                  <p className="max-w-lg text-base leading-7 text-white/70 sm:text-lg">
                    Enter your email, request the code once, and move into the
                    password reset step with a short cooldown guarding repeat sends.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid gap-3">
              {forgotPasswordHighlights.map((item) => {
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
              Remembered your password?{" "}
              <Link
                href="/login"
                className="inline-flex items-center gap-1 font-semibold text-[#f2d7ac] transition-colors hover:text-white"
              >
                Go back to login
                <ChevronRight className="size-4" />
              </Link>
            </p>
          </div>
        </section>

        <section>
          <ForgotPasswordForm />
        </section>
      </div>
    </div>
  );
}
