"use client";

import { useEffect, useTransition } from "react";
import { Loader2, LogOut, RotateCw, ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions/logout.action";

interface AdminErrorPageProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function AdminErrorPage({
  error,
  unstable_retry,
}: AdminErrorPageProps) {
  const [isLoggingOut, startLogoutTransition] = useTransition();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const handleLogout = (): void => {
    startLogoutTransition(async () => {
      await logoutAction();
    });
  };

  return (
    <section className="animate-fade-in relative overflow-hidden rounded-3xl border border-white/6 bg-linear-to-br from-[#1a0f0d] via-[#0f0908] to-[#0a0706] px-6 py-7 text-white shadow-2xl sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="animate-float absolute -top-14 -right-12 size-56 rounded-full bg-[#8ef2c5]/12 blur-[110px]" />
        <div className="animate-float-delayed absolute -bottom-24 -left-16 size-64 rounded-full bg-[#f6c168]/10 blur-[120px]" />
      </div>

      <div className="relative grid min-h-[60vh] gap-10 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
        <div className="space-y-6">
          <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-1.5 text-[11px] font-semibold tracking-[0.24em] uppercase text-[#f6c168] backdrop-blur-sm">
            <div className="glow-dot" />
            Admin Error Boundary
          </div>

          <div className="space-y-4">
            <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-white sm:text-5xl">
              Control room interrupted.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/60 sm:text-base">
              This admin segment hit an unexpected runtime error while loading or
              re-rendering. Retry the request to recover, or sign out to reset
              the session before entering the console again.
            </p>
          </div>

          {error.digest ? (
            <p className="text-sm text-white/55">
              Reference ID:{" "}
              <span className="rounded-full border border-white/10 bg-white/8 px-2.5 py-1 font-mono text-white">
                {error.digest}
              </span>
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3 pt-2">
            <Button
              size="lg"
              className="rounded-full bg-white text-black shadow-md transition-all duration-300 hover:scale-105 hover:bg-white/90 active:scale-95"
              onClick={() => unstable_retry()}
            >
              <RotateCw className="mr-2 size-4" />
              Try Again
            </Button>

            <Button
              type="button"
              size="lg"
              variant="outline"
              className="rounded-full border-white/14 bg-white/6 px-5 text-white hover:bg-white/10 hover:text-white"
              onClick={handleLogout}
              disabled={isLoggingOut}
            >
              {isLoggingOut ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <LogOut className="mr-2 size-4" />
              )}
              Log Out
            </Button>
          </div>
        </div>

        <div className="mx-auto aspect-square w-full max-w-[220px]">
          <svg
            viewBox="0 0 260 260"
            className="h-full w-full drop-shadow-2xl"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <defs>
              <linearGradient
                id="admin-error-ring"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#8ef2c5" />
                <stop offset="100%" stopColor="#f6c168" />
              </linearGradient>
              <linearGradient
                id="admin-error-panel"
                x1="0%"
                y1="0%"
                x2="100%"
                y2="100%"
              >
                <stop offset="0%" stopColor="#15211f" />
                <stop offset="100%" stopColor="#101715" />
              </linearGradient>
            </defs>

            <style>
              {`
                @keyframes admin-error-pulse {
                  0%, 100% { opacity: 0.18; transform: scale(0.96); }
                  50% { opacity: 0.42; transform: scale(1.04); }
                }

                @keyframes admin-error-float {
                  0%, 100% { transform: translateY(0px); }
                  50% { transform: translateY(-7px); }
                }

                @keyframes admin-error-blink {
                  0%, 18%, 100% { opacity: 1; }
                  28%, 52% { opacity: 0.22; }
                  62% { opacity: 1; }
                }

                @keyframes admin-error-wave {
                  0% { stroke-dashoffset: 0; }
                  100% { stroke-dashoffset: -36; }
                }

                .admin-error-halo {
                  animation: admin-error-pulse 4.2s ease-in-out infinite;
                  transform-origin: 130px 130px;
                }

                .admin-error-panel {
                  animation: admin-error-float 4.2s ease-in-out infinite;
                  transform-origin: 130px 136px;
                }

                .admin-error-alert {
                  animation: admin-error-blink 2.8s ease-in-out infinite;
                  transform-origin: 130px 130px;
                }

                .admin-error-wave {
                  animation: admin-error-wave 2.2s linear infinite;
                }
              `}
            </style>

            <circle
              cx="130"
              cy="130"
              r="100"
              stroke="url(#admin-error-ring)"
              strokeWidth="2"
              strokeDasharray="10 14"
              className="admin-error-halo"
            />

            <circle
              cx="130"
              cy="130"
              r="76"
              stroke="#ebfff5"
              strokeOpacity="0.08"
              strokeWidth="1.5"
            />

            <g className="admin-error-panel">
              <rect
                x="64"
                y="78"
                width="132"
                height="112"
                rx="28"
                fill="url(#admin-error-panel)"
                stroke="#8ef2c5"
                strokeOpacity="0.4"
                strokeWidth="2.5"
              />

              <rect
                x="82"
                y="100"
                width="96"
                height="12"
                rx="6"
                fill="#d7fff0"
                fillOpacity="0.16"
              />

              <path
                d="M84 132h92"
                stroke="#8ef2c5"
                strokeOpacity="0.55"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="12 12"
                className="admin-error-wave"
              />

              <path
                d="M84 154h64"
                stroke="#f6c168"
                strokeOpacity="0.55"
                strokeWidth="4"
                strokeLinecap="round"
                strokeDasharray="12 10"
                className="admin-error-wave"
              />
            </g>

            <g className="admin-error-alert">
              <circle cx="190" cy="86" r="24" fill="#2a1711" stroke="#f6c168" strokeWidth="2.5" />
              <ShieldAlert x="177" y="73" width="26" height="26" color="#f6c168" />
            </g>
          </svg>
        </div>
      </div>
    </section>
  );
}
