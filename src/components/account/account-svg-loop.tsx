import { cn } from "@/lib/utils";

interface AccountSvgLoopProps {
  className?: string;
  variant: "addresses" | "cart" | "orders" | "profile" | "security";
}

export function AccountSvgLoop({
  className,
  variant,
}: AccountSvgLoopProps) {
  if (variant === "profile") {
    return (
      <svg
        viewBox="0 0 260 260"
        className={cn("h-full w-full", className)}
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="profile-ring" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f6c168" />
            <stop offset="100%" stopColor="#c7642f" />
          </linearGradient>
        </defs>
        <circle
          cx="130"
          cy="130"
          r="86"
          stroke="url(#profile-ring)"
          strokeWidth="2"
          strokeDasharray="8 12"
          opacity="0.55"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 130 130"
            to="360 130 130"
            dur="16s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="130" cy="130" r="58" fill="#2b1613" opacity="0.92">
          <animate
            attributeName="r"
            values="56;60;56"
            dur="4.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="130" cy="112" r="22" fill="#f6c168" opacity="0.9" />
        <path
          d="M88 172c10-20 28-30 42-30s32 10 42 30"
          stroke="#f6c168"
          strokeWidth="18"
          strokeLinecap="round"
          opacity="0.9"
        />
        <circle cx="130" cy="130" r="106" stroke="#fff5e1" strokeOpacity="0.12" />
        <g>
          <circle cx="130" cy="34" r="8" fill="#f6c168" />
          <circle cx="130" cy="34" r="16" stroke="#f6c168" strokeOpacity="0.35">
            <animate
              attributeName="r"
              values="10;24;10"
              dur="3.6s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0;0.6"
              dur="3.6s"
              repeatCount="indefinite"
            />
          </circle>
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 130 130"
            to="360 130 130"
            dur="10s"
            repeatCount="indefinite"
          />
        </g>
      </svg>
    );
  }

  if (variant === "orders") {
    return (
      <svg
        viewBox="0 0 260 260"
        className={cn("h-full w-full", className)}
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="orders-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd27d" />
            <stop offset="100%" stopColor="#c7642f" />
          </linearGradient>
        </defs>
        <rect x="24" y="186" width="212" height="10" rx="5" fill="#3e2620" />
        <rect x="42" y="166" width="176" height="8" rx="4" fill="#5c3427" opacity="0.8" />
        <g>
          <rect x="90" y="78" width="80" height="80" rx="18" fill="#231110" stroke="url(#orders-glow)" strokeWidth="2.5" />
          <path d="M90 106h80M130 78v80" stroke="#f6c168" strokeOpacity="0.5" strokeWidth="2" />
          <rect x="106" y="94" width="48" height="48" rx="10" fill="#f6c168" fillOpacity="0.18" />
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="translate"
            values="0 0;0 -5;0 0"
            dur="4.4s"
            repeatCount="indefinite"
          />
        </g>
        <g>
          <circle cx="50" cy="120" r="6" fill="#f6c168" />
          <animateMotion
            dur="6s"
            repeatCount="indefinite"
            path="M 34 120 C 60 118, 80 100, 102 100"
          />
        </g>
        <g>
          <circle cx="210" cy="136" r="6" fill="#f6c168" />
          <animateMotion
            dur="6s"
            begin="-3s"
            repeatCount="indefinite"
            path="M 226 136 C 206 138, 182 156, 158 156"
          />
        </g>
        <path
          d="M54 64c24-24 128-24 152 0"
          stroke="#f6c168"
          strokeOpacity="0.3"
          strokeWidth="2"
          strokeDasharray="10 10"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-40"
            dur="5s"
            repeatCount="indefinite"
          />
        </path>
      </svg>
    );
  }

  if (variant === "security") {
    return (
      <svg
        viewBox="0 0 260 260"
        className={cn("h-full w-full", className)}
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="security-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd27d" />
            <stop offset="100%" stopColor="#d96e32" />
          </linearGradient>
        </defs>
        <circle
          cx="130"
          cy="130"
          r="92"
          stroke="url(#security-glow)"
          strokeWidth="2.5"
          strokeDasharray="12 12"
          opacity="0.45"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 130 130"
            to="360 130 130"
            dur="15s"
            repeatCount="indefinite"
          />
        </circle>
        <path
          d="M130 54 188 78v42c0 44-27 67-58 86-31-19-58-42-58-86V78l58-24Z"
          fill="#211111"
          stroke="#f6c168"
          strokeWidth="3"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="translate"
            values="0 0;0 -3;0 0"
            dur="4.4s"
            repeatCount="indefinite"
          />
        </path>
        <rect
          x="108"
          y="110"
          width="44"
          height="40"
          rx="10"
          fill="#f6c168"
          fillOpacity="0.16"
          stroke="#f6c168"
          strokeOpacity="0.7"
          strokeWidth="2"
        />
        <path
          d="M116 108v-8c0-8 6-14 14-14s14 6 14 14v8"
          stroke="#f6c168"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <circle cx="130" cy="128" r="5" fill="#f6c168">
          <animate
            attributeName="opacity"
            values="1;0.35;1"
            dur="2.6s"
            repeatCount="indefinite"
          />
        </circle>
        <path
          d="M130 128v10"
          stroke="#f6c168"
          strokeWidth="4"
          strokeLinecap="round"
        />
        <circle cx="130" cy="130" r="106" stroke="#fff5e1" strokeOpacity="0.1" />
      </svg>
    );
  }

  if (variant === "cart") {
    return (
      <svg
        viewBox="0 0 260 260"
        className={cn("h-full w-full", className)}
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="cart-glow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ffd27d" />
            <stop offset="100%" stopColor="#d96e32" />
          </linearGradient>
        </defs>
        <circle cx="88" cy="194" r="18" fill="#1f1212" stroke="#f6c168" strokeWidth="3" />
        <circle cx="176" cy="194" r="18" fill="#1f1212" stroke="#f6c168" strokeWidth="3" />
        <path
          d="M54 72h24l18 78h86l22-54H86"
          stroke="url(#cart-glow)"
          strokeWidth="8"
          strokeLinejoin="round"
          strokeLinecap="round"
        />
        <path
          d="M112 76h30l18 38h-48z"
          fill="#f6c168"
          fillOpacity="0.18"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="translate"
            values="0 0;0 -4;0 0"
            dur="4.6s"
            repeatCount="indefinite"
          />
        </path>
        <path
          d="M100 108h74"
          stroke="#fff1d2"
          strokeOpacity="0.28"
          strokeWidth="2"
          strokeDasharray="10 10"
        >
          <animate
            attributeName="stroke-dashoffset"
            from="0"
            to="-40"
            dur="4s"
            repeatCount="indefinite"
          />
        </path>
        <circle cx="184" cy="72" r="8" fill="#f6c168">
          <animateMotion
            dur="4.8s"
            repeatCount="indefinite"
            path="M 0 0 C -8 28, -22 58, -50 92"
          />
        </circle>
        <circle cx="130" cy="130" r="100" stroke="#fff6e0" strokeOpacity="0.08" />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 260 260"
      className={cn("h-full w-full", className)}
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="addresses-glow" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ffd27d" />
          <stop offset="100%" stopColor="#d96e32" />
        </linearGradient>
      </defs>
      <rect x="34" y="56" width="192" height="150" rx="28" fill="#1f1212" />
      <path
        d="M66 170c24-64 58-72 90-44s54 18 74-26"
        stroke="url(#addresses-glow)"
        strokeWidth="4"
        strokeLinecap="round"
        strokeDasharray="10 12"
      >
        <animate
          attributeName="stroke-dashoffset"
          from="0"
          to="-66"
          dur="6s"
          repeatCount="indefinite"
        />
      </path>
      <g>
        <path
          d="M130 86c-14 0-26 11-26 25 0 19 26 46 26 46s26-27 26-46c0-14-12-25-26-25Z"
          fill="#f6c168"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="translate"
            values="0 0;0 -4;0 0"
            dur="3.4s"
            repeatCount="indefinite"
          />
        </path>
        <circle cx="130" cy="111" r="8" fill="#2a1512" />
      </g>
      <circle cx="76" cy="176" r="6" fill="#fff1d2">
        <animateMotion
          dur="5.5s"
          repeatCount="indefinite"
          path="M 0 0 C 34 -54, 88 -60, 152 -100"
        />
      </circle>
      <circle cx="130" cy="130" r="98" stroke="#fff6e0" strokeOpacity="0.08" />
    </svg>
  );
}
