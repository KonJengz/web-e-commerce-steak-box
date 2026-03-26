import { Button } from "@/components/ui/button";

interface AuthGoogleButtonProps {
  href: string;
  label?: string;
}

const GoogleIcon = () => {
  return (
    <svg
      aria-hidden="true"
      className="size-[1.1rem]"
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M21.805 12.23c0-.74-.066-1.45-.189-2.132H12v4.037h5.498a4.71 4.71 0 0 1-2.04 3.09v2.563h3.304c1.934-1.782 3.043-4.41 3.043-7.558Z"
        fill="#4285F4"
      />
      <path
        d="M12 22c2.754 0 5.063-.913 6.75-2.473l-3.304-2.563c-.913.612-2.082.974-3.446.974-2.65 0-4.894-1.788-5.695-4.193H2.889v2.647A10.19 10.19 0 0 0 12 22Z"
        fill="#34A853"
      />
      <path
        d="M6.305 13.745A6.122 6.122 0 0 1 5.987 12c0-.605.11-1.192.318-1.744V7.61H2.889A10.19 10.19 0 0 0 1.818 12c0 1.628.39 3.17 1.07 4.39l3.417-2.645Z"
        fill="#FBBC04"
      />
      <path
        d="M12 6.063c1.498 0 2.844.516 3.905 1.53l2.925-2.925C17.057 3.022 14.748 2 12 2 7.997 2 4.52 4.292 2.889 7.61l3.417 2.646c.801-2.406 3.044-4.193 5.694-4.193Z"
        fill="#EA4335"
      />
    </svg>
  );
};

export function AuthGoogleButton({
  href,
  label = "Continue with Google",
}: AuthGoogleButtonProps) {
  return (
    <Button
      asChild
      variant="outline"
      className="h-12 w-full rounded-full border-border/60 bg-background/80 font-semibold shadow-sm transition-all hover:bg-muted/60"
    >
      <a href={href}>
        <GoogleIcon />
        <span>{label}</span>
      </a>
    </Button>
  );
}
