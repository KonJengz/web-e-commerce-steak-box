import { LogoIconSteakBox } from "@/components/shared/icons/logo-icon";

export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-4 py-16"
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--color-primary)_20%,transparent),transparent_42%),radial-gradient(circle_at_bottom,color-mix(in_oklab,var(--color-foreground)_8%,transparent),transparent_40%)]" />

      <div className="relative flex items-center justify-center">
        <div className="relative h-64 w-64 sm:h-72 sm:w-72">
          <svg
            viewBox="0 0 240 240"
            className="h-full w-full text-foreground/70 drop-shadow-2xl"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <style>
              {`
                @keyframes loader-ring-spin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }

                @keyframes loader-core-breathe {
                  0%, 100% { transform: translateY(0) scale(0.96); }
                  50% { transform: translateY(-5px) scale(1.04); }
                }

                @keyframes loader-smoke-rise {
                  0%, 100% { opacity: 0.12; transform: translateY(0); }
                  50% { opacity: 0.4; transform: translateY(-10px); }
                }

                @keyframes loader-ember-orbit {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(-360deg); }
                }

                .loader-ring-outer {
                  animation: loader-ring-spin 9s linear infinite;
                  transform-origin: 120px 120px;
                }

                .loader-ring-inner {
                  animation: loader-ring-spin 6s linear infinite reverse;
                  transform-origin: 120px 120px;
                }

                .loader-core {
                  animation: loader-core-breathe 2.8s ease-in-out infinite;
                  transform-origin: 120px 126px;
                }

                .loader-smoke {
                  animation: loader-smoke-rise 2.6s ease-in-out infinite;
                  transform-origin: 120px 78px;
                }

                .loader-smoke-two {
                  animation-delay: 0.35s;
                }

                .loader-ember {
                  animation: loader-ember-orbit 4.2s linear infinite;
                  transform-origin: 120px 120px;
                }
              `}
            </style>

            <ellipse
              cx="120"
              cy="188"
              rx="58"
              ry="16"
              className="fill-foreground/8"
            />

            <circle
              cx="120"
              cy="120"
              r="86"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="12 16"
              className="loader-ring-outer opacity-20"
            />

            <circle
              cx="120"
              cy="120"
              r="66"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeDasharray="4 10"
              className="loader-ring-inner opacity-20"
            />

            <g className="loader-smoke">
              <path
                d="M94 72c0-8 6-14 13-14 6 0 11 3 14 8 3-7 9-11 16-11 9 0 16 7 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="5"
                strokeLinecap="round"
                className="opacity-15"
              />
            </g>

            <g className="loader-smoke loader-smoke-two">
              <path
                d="M104 86c0-6 5-11 10-11 4 0 8 2 10 6 2-5 6-8 11-8 7 0 12 5 12 12"
                fill="none"
                stroke="currentColor"
                strokeWidth="4"
                strokeLinecap="round"
                className="opacity-20"
              />
            </g>

            <g className="loader-ember">
              <circle
                cx="120"
                cy="34"
                r="7"
                className="fill-primary opacity-90"
              />
              <circle cx="120" cy="34" r="15" className="fill-primary/18" />
            </g>

            <g className="loader-core">
              <LogoIconSteakBox
                x="70"
                y="82"
                width="100"
                height="62"
                className="overflow-visible drop-shadow-[0_10px_18px_rgba(178,57,40,0.24)]"
              />
            </g>
          </svg>
        </div>
      </div>

      <span className="sr-only">Loading content</span>
    </div>
  );
}
