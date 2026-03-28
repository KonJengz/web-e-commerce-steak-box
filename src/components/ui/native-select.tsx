import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

interface NativeSelectProps extends React.ComponentProps<"select"> {
  indicatorClassName?: string;
  wrapperClassName?: string;
}

const NativeSelect = React.forwardRef<HTMLSelectElement, NativeSelectProps>(
  (
    {
      children,
      className,
      indicatorClassName,
      wrapperClassName,
      ...props
    },
    ref,
  ) => {
    return (
      <div className={cn("relative", wrapperClassName)}>
        <select
          ref={ref}
          data-slot="native-select"
          className={cn(
            "h-10 w-full appearance-none rounded-xl border border-border/50 bg-background/80 px-4 py-2 pr-11 text-sm text-foreground outline-none transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown
          className={cn(
            "pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-muted-foreground",
            indicatorClassName,
          )}
        />
      </div>
    );
  },
);

NativeSelect.displayName = "NativeSelect";

export { NativeSelect };
