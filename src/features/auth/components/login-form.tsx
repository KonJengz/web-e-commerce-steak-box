"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
  Mail,
} from "lucide-react";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { loginAction } from "@/features/auth/actions/login.action";
import {
  loginSchema,
  type LoginInput,
} from "@/features/auth/schemas/auth.schema";
import type { LoginActionState } from "@/features/auth/types/auth.type";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const defaultValues: LoginInput = {
  email: "",
  password: "",
};

export function LoginForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [submissionState, setSubmissionState] =
    useState<LoginActionState | null>(null);
  const { control, clearErrors, handleSubmit, setError } = useForm<LoginInput>({
    defaultValues,
    resolver: zodResolver(loginSchema),
  });

  const applyServerErrors = (state: LoginActionState): void => {
    const emailError = state.fieldErrors?.email?.[0];
    const passwordError = state.fieldErrors?.password?.[0];

    if (emailError) {
      setError("email", {
        message: emailError,
        type: "server",
      });
    }

    if (passwordError) {
      setError("password", {
        message: passwordError,
        type: "server",
      });
    }
  };

  const handleLogin = (values: LoginInput): void => {
    clearErrors();
    setSubmissionState(null);

    startTransition(async () => {
      const result = await loginAction(values);

      if (!result.success) {
        setSubmissionState(result);
        applyServerErrors(result);
        return;
      }

      router.replace(result.redirectTo ?? "/");
      router.refresh();
    });
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card/95 p-6 shadow-[0_28px_120px_rgba(0,0,0,0.16)] sm:p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--color-primary)_24%,transparent),transparent_68%)]" />

      <div className="relative space-y-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.28em] text-primary/75 uppercase">
            Kitchen Access
          </p>

          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Welcome back
            </h2>
            <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
              Sign in to review orders, update your profile, and move through
              checkout without losing your cart.
            </p>
          </div>
        </div>

        {submissionState?.message ? (
          <div className="rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm leading-6 whitespace-pre-line text-destructive">
            {submissionState.message}
          </div>
        ) : null}

        {submissionState?.pendingVerificationEmail ? (
          <Button asChild variant="outline" className="w-full rounded-full">
            <Link
              href={`/verify-email?email=${encodeURIComponent(
                submissionState.pendingVerificationEmail,
              )}`}
            >
              Verify Email
            </Link>
          </Button>
        ) : null}

        <form
          className="space-y-5"
          noValidate
          onSubmit={handleSubmit(handleLogin)}
        >
          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <div className="relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    autoComplete="email"
                    placeholder="chef@steakbox.com"
                    aria-invalid={fieldState.invalid}
                    className="h-12 rounded-full pr-4 pl-11"
                    disabled={isPending}
                  />
                </div>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <div className="flex items-center justify-between gap-3">
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    8+ chars
                  </span>
                </div>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...field}
                    id={field.name}
                    type={isPasswordVisible ? "text" : "password"}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    aria-invalid={fieldState.invalid}
                    className="h-12 rounded-full pr-12 pl-11"
                    disabled={isPending}
                  />
                  <button
                    type="button"
                    aria-label={
                      isPasswordVisible ? "Hide password" : "Show password"
                    }
                    aria-pressed={isPasswordVisible}
                    className="absolute top-1/2 right-3 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60 disabled:pointer-events-none disabled:opacity-60"
                    disabled={isPending}
                    onClick={() => setIsPasswordVisible((visible) => !visible)}
                  >
                    {!isPasswordVisible ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Button
            type="submit"
            size="lg"
            className="h-12 w-full rounded-full text-sm font-semibold shadow-lg shadow-primary/20"
            disabled={isPending}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Loading...
              </>
            ) : (
              "Login"
            )}
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <p className="text-center text-sm leading-6 text-muted-foreground">
          New to Steak Box?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary transition-colors hover:text-primary/80"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
