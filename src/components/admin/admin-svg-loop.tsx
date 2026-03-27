import { cn } from "@/lib/utils";

interface AdminSvgLoopProps {
  className?: string;
  variant: "categories" | "dashboard" | "products";
}

export function AdminSvgLoop({ className, variant }: AdminSvgLoopProps) {
  if (variant === "products") {
    return (
      <svg
        viewBox="0 0 260 260"
        className={cn("h-full w-full", className)}
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="admin-products" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8ef2c5" />
            <stop offset="100%" stopColor="#f6c168" />
          </linearGradient>
        </defs>
        <circle
          cx="130"
          cy="130"
          r="96"
          stroke="url(#admin-products)"
          strokeWidth="2.5"
          strokeDasharray="10 14"
          opacity="0.4"
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
        <rect
          x="70"
          y="82"
          width="120"
          height="96"
          rx="24"
          fill="#111a18"
          stroke="#8ef2c5"
          strokeOpacity="0.55"
          strokeWidth="2.5"
        />
        <path
          d="M88 112h84M88 136h48M88 160h62"
          stroke="#d5ffe8"
          strokeOpacity="0.75"
          strokeWidth="6"
          strokeLinecap="round"
        />
        <rect
          x="150"
          y="120"
          width="28"
          height="28"
          rx="8"
          fill="#8ef2c5"
          fillOpacity="0.18"
          stroke="#8ef2c5"
          strokeWidth="2"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="translate"
            values="0 0;0 -4;0 0"
            dur="4.6s"
            repeatCount="indefinite"
          />
        </rect>
      </svg>
    );
  }

  if (variant === "categories") {
    return (
      <svg
        viewBox="0 0 260 260"
        className={cn("h-full w-full", className)}
        fill="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient
            id="admin-categories"
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#8ef2c5" />
            <stop offset="100%" stopColor="#79d4ff" />
          </linearGradient>
        </defs>
        <path
          d="M130 40 208 86v88l-78 46-78-46V86l78-46Z"
          stroke="url(#admin-categories)"
          strokeWidth="2.5"
          fill="#111a18"
          fillOpacity="0.9"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 130 130"
            to="360 130 130"
            dur="22s"
            repeatCount="indefinite"
          />
        </path>
        <path
          d="M130 76 176 102v56l-46 26-46-26v-56l46-26Z"
          fill="#8ef2c5"
          fillOpacity="0.12"
          stroke="#8ef2c5"
          strokeOpacity="0.65"
          strokeWidth="2"
        />
        <circle cx="130" cy="130" r="16" fill="#8ef2c5">
          <animate
            attributeName="r"
            values="14;20;14"
            dur="4.2s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.8;0.3;0.8"
            dur="4.2s"
            repeatCount="indefinite"
          />
        </circle>
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
        <linearGradient id="admin-dashboard" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#8ef2c5" />
          <stop offset="100%" stopColor="#f6c168" />
        </linearGradient>
      </defs>
      <circle cx="130" cy="130" r="104" stroke="#ebfff5" strokeOpacity="0.08" />
      <circle
        cx="130"
        cy="130"
        r="86"
        stroke="url(#admin-dashboard)"
        strokeWidth="2.5"
        strokeDasharray="12 10"
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
      <rect x="72" y="72" width="48" height="48" rx="16" fill="#8ef2c5" fillOpacity="0.16" />
      <rect x="138" y="72" width="50" height="78" rx="18" fill="#f6c168" fillOpacity="0.18" />
      <rect x="72" y="138" width="72" height="54" rx="18" fill="#f2fff8" fillOpacity="0.08" />
      <rect x="154" y="166" width="34" height="26" rx="12" fill="#8ef2c5" fillOpacity="0.2">
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="translate"
          values="0 0;0 -6;0 0"
          dur="4.4s"
          repeatCount="indefinite"
        />
      </rect>
    </svg>
  );
}
