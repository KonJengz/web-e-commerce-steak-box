import type { ReactNode } from "react";

import { AdminSvgLoop } from "@/components/admin/admin-svg-loop";

interface AdminPageHeroProps {
  badge: string;
  children?: ReactNode;
  description: string;
  title: string;
  variant: "categories" | "dashboard" | "products";
}

export function AdminPageHero({
  badge,
  children,
  description,
  title,
  variant,
}: AdminPageHeroProps) {
  return (
    <section className="relative overflow-hidden rounded-[2.25rem] border border-emerald-500/20 bg-[linear-gradient(145deg,#07110d_0%,#0d1613_38%,#0f1316_100%)] px-6 py-7 text-white shadow-[0_30px_90px_rgba(0,0,0,0.35)] sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute top-[-8%] right-[-2%] size-56 rounded-full bg-emerald-400/12 blur-[120px]" />
        <div className="absolute bottom-[-22%] left-[-10%] size-60 rounded-full bg-[#f6c168]/10 blur-[140px]" />
      </div>

      <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
        <div className="space-y-5">
          <div className="inline-flex w-fit items-center rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-[11px] font-semibold tracking-[0.24em] uppercase text-[#8ef2c5]">
            {badge}
          </div>

          <div className="space-y-3">
            <h1 className="max-w-2xl text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {title}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/65 sm:text-base">
              {description}
            </p>
          </div>

          {children ? (
            <div className="flex flex-wrap gap-3 pt-2">{children}</div>
          ) : null}
        </div>

        <div className="mx-auto aspect-square w-full max-w-[220px]">
          <AdminSvgLoop variant={variant} />
        </div>
      </div>
    </section>
  );
}
