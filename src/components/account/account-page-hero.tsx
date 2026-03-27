import type { ReactNode } from "react";

import { AccountSvgLoop } from "@/components/account/account-svg-loop";

interface AccountPageHeroProps {
  badge: string;
  children?: ReactNode;
  description: string;
  title: string;
  variant: "addresses" | "cart" | "orders" | "profile" | "security";
}

export function AccountPageHero({
  badge,
  children,
  description,
  title,
  variant,
}: AccountPageHeroProps) {
  return (
    <section className="animate-fade-in relative overflow-hidden rounded-3xl border border-white/6 bg-linear-to-br from-[#1a0f0d] via-[#0f0908] to-[#0a0706] px-6 py-7 text-white shadow-2xl sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float absolute top-[-12%] right-[-5%] size-52 rounded-full bg-primary/15 blur-[100px]" />
        <div className="animate-float-delayed absolute bottom-[-18%] left-[-8%] size-56 rounded-full bg-[#f6c168]/8 blur-[120px]" />
      </div>

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
        <div className="space-y-5">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-[11px] font-semibold tracking-[0.24em] uppercase text-[#f6c168] backdrop-blur-sm">
            <div className="glow-dot" />
            {badge}
          </div>

          <div className="space-y-3">
            <h1 className="animate-fade-in-up max-w-2xl text-3xl font-bold tracking-tight text-white sm:text-4xl" style={{ animationDelay: "0.1s", animationFillMode: "backwards" }}>
              {title}
            </h1>
            <p className="animate-fade-in-up max-w-2xl text-sm leading-7 text-white/55 sm:text-base" style={{ animationDelay: "0.2s", animationFillMode: "backwards" }}>
              {description}
            </p>
          </div>

          {children ? (
            <div className="animate-fade-in-up flex flex-wrap gap-3 pt-2" style={{ animationDelay: "0.3s", animationFillMode: "backwards" }}>{children}</div>
          ) : null}
        </div>

        <div className="animate-float-slow mx-auto aspect-square w-full max-w-[220px]">
          <AccountSvgLoop variant={variant} />
        </div>
      </div>
    </section>
  );
}
