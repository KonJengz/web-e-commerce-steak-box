import * as React from "react";
import type { FieldError as ReactHookFormFieldError } from "react-hook-form";

import { cn } from "@/lib/utils";

interface FieldErrorProps {
  className?: string;
  errors?: Array<ReactHookFormFieldError | undefined>;
}

function Field({ className, ...props }: React.ComponentProps<"div">) {
  return <div className={cn("grid gap-2", className)} {...props} />;
}

function FieldLabel({ className, ...props }: React.ComponentProps<"label">) {
  return (
    <label
      className={cn("text-sm font-medium tracking-tight text-foreground", className)}
      {...props}
    />
  );
}

function FieldError({ className, errors = [] }: FieldErrorProps) {
  const message = errors.find((error) => error?.message)?.message;

  if (!message) {
    return null;
  }

  return (
    <p
      role="alert"
      className={cn("text-sm leading-6 text-destructive", className)}
    >
      {message}
    </p>
  );
}

export { Field, FieldError, FieldLabel };
