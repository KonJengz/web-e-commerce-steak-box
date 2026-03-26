"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { setTheme, theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-[68px] h-8 rounded-full bg-muted/50 animate-pulse border-2 border-transparent" />
    );
  }

  const isDark = resolvedTheme === "dark" || theme === "dark";

  return (
    <button
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={cn(
        "relative flex h-8 w-[68px] shrink-0 cursor-pointer items-center justify-center rounded-full border-2 transition-all duration-300 ease-in-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
        isDark
          ? "border-primary/20 bg-primary/10 shadow-[inset_0_2px_8px_rgba(0,0,0,0.3)] hover:bg-primary/20 hover:border-primary/30"
          : "border-border/50 bg-secondary/80 shadow-[inset_0_2px_8px_rgba(0,0,0,0.05)] hover:bg-secondary hover:border-border",
      )}
      aria-label="Toggle theme"
    >
      {/* Background Icons */}
      <div className="pointer-events-none absolute flex w-full justify-between px-1.5">
        <Sun
          className={cn(
            "h-5 w-5 transition-all duration-300",
            isDark
              ? "text-muted-foreground/30 scale-75 -rotate-90"
              : "text-amber-500 scale-100 rotate-0 drop-shadow-sm",
          )}
        />
        <Moon
          className={cn(
            "h-5 w-5 transition-all duration-300",
            isDark
              ? "text-primary scale-100 rotate-0 drop-shadow-md"
              : "text-muted-foreground/30 scale-75 rotate-90",
          )}
        />
      </div>

      {/* Sliding Thumb */}
      <span
        className={cn(
          "absolute left-1 flex size-6 items-center justify-center rounded-full shadow-lg transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)]",
          isDark
            ? "translate-x-8 bg-primary shadow-primary/40 rotate-360"
            : "translate-x-0 bg-white shadow-black/10 rotate-0",
        )}
      >
        {isDark ? (
          <Moon className="h-4 w-4 text-primary-foreground fill-primary-foreground" />
        ) : (
          <Sun className="h-4 w-4 text-amber-500 fill-amber-500" />
        )}
      </span>
    </button>
  );
}
