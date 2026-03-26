"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Home, RotateCw, TriangleAlert } from "lucide-react";

import { Button } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  unstable_retry: () => void;
}

export default function Error({ error, unstable_retry }: ErrorPageProps) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 py-12 text-center">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--color-primary)_18%,transparent),transparent_42%),radial-gradient(circle_at_bottom,color-mix(in_oklab,var(--color-destructive)_14%,transparent),transparent_38%)]" />

      <div className="relative mb-8 flex h-80 w-80 items-center justify-center">
        <svg
          viewBox="0 0 240 240"
          className="h-full w-full text-foreground/55 drop-shadow-2xl"
          xmlns="http://www.w3.org/2000/svg"
          aria-hidden="true"
        >
          <style>
            {`
              @keyframes alarm-pulse {
                0%, 100% { transform: scale(1); opacity: 0.2; }
                50% { transform: scale(1.08); opacity: 0.45; }
              }

              @keyframes dome-shake {
                0%, 100% { transform: rotate(0deg) translateY(0); }
                12% { transform: rotate(-2.5deg) translateY(-2px); }
                24% { transform: rotate(2deg) translateY(0); }
                36% { transform: rotate(-1.5deg) translateY(-1px); }
                48% { transform: rotate(1deg) translateY(0); }
                60% { transform: rotate(0deg) translateY(0); }
              }

              @keyframes warning-flash {
                0%, 100% { opacity: 0.3; transform: scale(0.92); }
                45%, 55% { opacity: 1; transform: scale(1); }
              }

              @keyframes spark-rise {
                0% { opacity: 0; transform: translateY(10px) scale(0.7); }
                20% { opacity: 0.95; }
                100% { opacity: 0; transform: translateY(-28px) scale(1.15); }
              }

              @keyframes tray-glow {
                0%, 100% { opacity: 0.2; transform: scaleX(0.9); }
                50% { opacity: 0.45; transform: scaleX(1); }
              }

              .alarm-ring {
                animation: alarm-pulse 3.4s ease-in-out infinite;
                transform-origin: 120px 120px;
              }

              .service-dome {
                animation: dome-shake 4.2s cubic-bezier(0.45, 0, 0.2, 1) infinite;
                transform-origin: 120px 146px;
              }

              .warning-mark {
                animation: warning-flash 4.2s ease-in-out infinite;
                transform-origin: 120px 126px;
              }

              .spark-1 { animation: spark-rise 2.8s ease-out infinite 0.1s; }
              .spark-2 { animation: spark-rise 2.8s ease-out infinite 0.9s; }
              .spark-3 { animation: spark-rise 2.8s ease-out infinite 1.6s; }

              .tray-aura {
                animation: tray-glow 3.2s ease-in-out infinite;
                transform-origin: 120px 178px;
              }
            `}
          </style>

          <ellipse
            cx="120"
            cy="178"
            rx="84"
            ry="18"
            className="tray-aura fill-primary/10"
          />

          <circle
            cx="120"
            cy="120"
            r="88"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeDasharray="8 10"
            className="alarm-ring opacity-30"
          />

          <path
            d="M 86 156 C 86 132, 154 132, 154 156"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            className="opacity-25"
          />

          <path
            d="M 101 78 L 108 66 L 114 79 L 120 60 L 127 82 L 133 72 L 139 86"
            fill="none"
            stroke="currentColor"
            strokeWidth="4"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="spark-1"
          />
          <path
            d="M 92 106 L 98 96 L 103 108 L 110 91"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="spark-2"
          />
          <path
            d="M 136 104 L 142 92 L 148 106 L 154 96"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="spark-3"
          />

          <g className="service-dome">
            <circle cx="120" cy="74" r="10" fill="currentColor" />
            <path
              d="M 48 156 C 52 96, 88 62, 120 62 C 152 62, 188 96, 192 156 Z"
              fill="currentColor"
            />
            <path
              d="M 58 152 C 62 103, 92 75, 120 75 C 148 75, 178 103, 182 152 Z"
              className="fill-background opacity-18"
            />
            <path
              d="M 72 146 C 78 112, 100 92, 120 92 C 140 92, 162 112, 168 146 Z"
              className="fill-background opacity-28"
            />
          </g>

          <g className="warning-mark">
            <polygon
              points="120,98 149,148 91,148"
              className="fill-primary drop-shadow-lg"
            />
            <rect
              x="116"
              y="113"
              width="8"
              height="20"
              rx="4"
              className="fill-primary-foreground"
            />
            <circle
              cx="120"
              cy="140"
              r="4.5"
              className="fill-primary-foreground"
            />
          </g>

          <ellipse
            cx="120"
            cy="178"
            rx="92"
            ry="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="6"
            className="opacity-90"
          />
        </svg>
      </div>

      <div className="relative mx-auto max-w-2xl space-y-5">
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/8 px-4 py-1.5 text-sm font-medium text-primary shadow-sm">
          <TriangleAlert className="h-4 w-4" />
          Kitchen service interrupted
        </div>

        <h1 className="text-4xl font-serif font-bold tracking-tight text-foreground sm:text-6xl">
          500
          <span className="mx-3 inline-block -translate-y-1 font-sans text-3xl text-primary sm:text-5xl">
            |
          </span>
          Something Burned
        </h1>

        <p className="text-lg leading-relaxed text-muted-foreground">
          The kitchen hit an unexpected problem while plating this page. Try the
          request again, or head back to the menu while the service resets.
        </p>

        {error.digest ? (
          <p className="text-sm text-muted-foreground">
            Reference ID:{" "}
            <span className="rounded-full bg-muted px-2 py-1 font-mono text-foreground">
              {error.digest}
            </span>
          </p>
        ) : null}
      </div>

      <div className="relative mt-10 flex flex-wrap items-center justify-center gap-4">
        <Button
          size="lg"
          className="rounded-full px-8 shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg active:scale-95"
          onClick={() => unstable_retry()}
        >
          <RotateCw className="mr-2 h-5 w-5" />
          Try Again
        </Button>

        <Button
          asChild
          size="lg"
          variant="outline"
          className="rounded-full px-8 shadow-sm transition-all duration-300 hover:scale-105 active:scale-95"
        >
          <Link href="/">
            <Home className="mr-2 h-5 w-5" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
