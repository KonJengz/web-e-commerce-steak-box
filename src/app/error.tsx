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
              @keyframes ring-pulse {
                0%, 100% { transform: scale(0.92); opacity: 0.18; }
                50% { transform: scale(1.06); opacity: 0.38; }
              }

              @keyframes triangle-float {
                0%, 100% { transform: translateY(0) scale(1); }
                50% { transform: translateY(-8px) scale(1.02); }
              }

              @keyframes triangle-glow {
                0%, 100% { filter: drop-shadow(0 0 0 rgba(178, 57, 40, 0)); }
                50% { filter: drop-shadow(0 0 18px rgba(178, 57, 40, 0.28)); }
              }

              @keyframes mark-alert {
                0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
                20% { transform: translateY(-4px) scale(1.04); }
                32% { transform: translateY(0) scale(0.98); }
                44% { transform: translateY(-2px) scale(1.02); }
              }

              @keyframes dot-blink {
                0%, 100% { opacity: 1; transform: scale(1); }
                50% { opacity: 0.55; transform: scale(0.86); }
              }

              .warning-ring {
                animation: ring-pulse 3.2s ease-in-out infinite;
                transform-origin: 120px 120px;
              }

              .warning-shape {
                animation:
                  triangle-float 3.2s ease-in-out infinite,
                  triangle-glow 3.2s ease-in-out infinite;
                transform-origin: 120px 124px;
              }

              .warning-bar {
                animation: mark-alert 3.2s cubic-bezier(0.45, 0, 0.2, 1) infinite;
                transform-origin: 120px 126px;
              }

              .warning-dot {
                animation: dot-blink 3.2s ease-in-out infinite;
                transform-origin: 120px 157px;
              }
            `}
          </style>

          <circle
            cx="120"
            cy="120"
            r="84"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeDasharray="10 12"
            className="warning-ring opacity-25"
          />

          <g className="warning-shape">
            <path
              d="M 108 72
                 Q 120 50 132 72
                 L 183 160
                 Q 194 182 168 182
                 L 72 182
                 Q 46 182 57 160
                 Z"
              className="fill-primary drop-shadow-lg"
            />
            <path
              d="M 110 82
                 Q 120 64 130 82
                 L 171 153
                 Q 180 169 161 169
                 L 79 169
                 Q 60 169 69 153
                 Z"
              className="fill-background/15"
            />
          </g>

          <rect
            x="113"
            y="90"
            width="14"
            height="50"
            rx="7"
            className="warning-bar fill-primary-foreground"
          />
          <circle cx="120" cy="157" r="8" className="warning-dot fill-primary-foreground" />
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
