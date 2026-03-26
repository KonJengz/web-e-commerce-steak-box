"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import {
  ArrowRight,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
} from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { resetPasswordAction } from "@/features/auth/actions/reset-password.action";
import {
  resetPasswordSubmissionSchema,
  type ResetPasswordSubmissionInput,
} from "@/features/auth/schemas/auth.schema";
import type { ResetPasswordActionState } from "@/features/auth/types/auth.type";

const REDIRECT_DELAY_MS = 1800;

interface ResetPasswordFormProps {
  maskedEmail: string | null;
}

export function ResetPasswordForm({ maskedEmail }: ResetPasswordFormProps) {
  if (!maskedEmail) {
    return (
      <div className="rounded-[2.5rem] border border-destructive/20 bg-destructive/5 p-8 text-center sm:p-12">
        <h3 className="text-xl font-bold text-destructive">
          Reset Session Expired
        </h3>
        <p className="mt-2 text-muted-foreground">
          Request a new password reset code to continue.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/forgot-password">Request New Code</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return <ResetPasswordFormContent key={maskedEmail} maskedEmail={maskedEmail} />;
}

interface ResetPasswordFormContentProps {
  maskedEmail: string;
}

function ResetPasswordFormContent({
  maskedEmail,
}: ResetPasswordFormContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [submissionState, setSubmissionState] =
    useState<ResetPasswordActionState | null>(null);
  const { control, clearErrors, handleSubmit, setError } =
    useForm<ResetPasswordSubmissionInput>({
      defaultValues: {
        code: "",
        confirmPassword: "",
        newPassword: "",
      },
      resolver: zodResolver(resetPasswordSubmissionSchema),
    });

  useEffect(() => {
    if (!submissionState?.redirectTo) {
      return;
    }

    const redirectId = window.setTimeout(() => {
      router.replace(submissionState.redirectTo ?? "/login");
    }, REDIRECT_DELAY_MS);

    return () => {
      window.clearTimeout(redirectId);
    };
  }, [router, submissionState?.redirectTo]);

  const applyServerErrors = (state: ResetPasswordActionState): void => {
    const codeError = state.fieldErrors?.code?.[0];
    const newPasswordError = state.fieldErrors?.newPassword?.[0];
    const confirmPasswordError = state.fieldErrors?.confirmPassword?.[0];

    if (codeError) {
      setError("code", {
        message: codeError,
        type: "server",
      });
    }

    if (newPasswordError) {
      setError("newPassword", {
        message: newPasswordError,
        type: "server",
      });
    }

    if (confirmPasswordError) {
      setError("confirmPassword", {
        message: confirmPasswordError,
        type: "server",
      });
    }
  };

  const handleResetPassword = (
    values: ResetPasswordSubmissionInput,
  ): void => {
    clearErrors();
    setSubmissionState(null);

    startTransition(async () => {
      const result = await resetPasswordAction(values);

      setSubmissionState(result);

      if (!result.success) {
        applyServerErrors(result);
        return;
      }

      router.replace(result.redirectTo ?? "/login");
    });
  };

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-border/80 bg-card/95 p-6 shadow-[0_28px_120px_rgba(0,0,0,0.16)] sm:p-8">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--color-primary)_24%,transparent),transparent_68%)]" />

      <div className="relative space-y-8">
        <div className="space-y-3">
          <p className="text-xs font-semibold tracking-[0.28em] text-primary/75 uppercase">
            Password Recovery
          </p>

          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Reset your password
            </h2>
            <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
              Enter the 6-digit code sent to{" "}
              <span className="font-medium text-foreground">{maskedEmail}</span>{" "}
              and choose a new password.
            </p>
          </div>
        </div>

        {submissionState?.message ? (
          <div
            className={
              submissionState.success
                ? "rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-700 dark:text-emerald-300"
                : "rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm leading-6 whitespace-pre-line text-destructive"
            }
          >
            {submissionState.message}
          </div>
        ) : null}

        <form
          className="space-y-6"
          noValidate
          onSubmit={handleSubmit(handleResetPassword)}
        >
          <Controller
            control={control}
            name="code"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel>Verification Code</FieldLabel>
                <div className="mt-2">
                  <InputOTP
                    maxLength={6}
                    value={field.value}
                    onChange={field.onChange}
                    disabled={isPending}
                    pattern={REGEXP_ONLY_DIGITS}
                    onComplete={() => handleSubmit(handleResetPassword)()}
                  >
                    <InputOTPGroup className="gap-2">
                      <InputOTPSlot index={0} className="h-12 w-11 rounded-xl text-lg font-bold ring-offset-background" />
                      <InputOTPSlot index={1} className="h-12 w-11 rounded-xl text-lg font-bold ring-offset-background" />
                      <InputOTPSlot index={2} className="h-12 w-11 rounded-xl text-lg font-bold ring-offset-background" />
                      <InputOTPSlot index={3} className="h-12 w-11 rounded-xl text-lg font-bold ring-offset-background" />
                      <InputOTPSlot index={4} className="h-12 w-11 rounded-xl text-lg font-bold ring-offset-background" />
                      <InputOTPSlot index={5} className="h-12 w-11 rounded-xl text-lg font-bold ring-offset-background" />
                    </InputOTPGroup>
                  </InputOTP>
                </div>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="newPassword"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...field}
                    id={field.name}
                    type={isPasswordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="At least 8 characters"
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
                    {isPasswordVisible ? (
                      <Eye className="size-4" />
                    ) : (
                      <EyeOff className="size-4" />
                    )}
                  </button>
                </div>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="confirmPassword"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                <div className="relative">
                  <KeyRound className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    {...field}
                    id={field.name}
                    type={isPasswordVisible ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Repeat your new password"
                    aria-invalid={fieldState.invalid}
                    className="h-12 rounded-full pl-11 pr-4"
                    disabled={isPending}
                  />
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
                Resetting...
              </>
            ) : (
              "Reset Password"
            )}
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <div className="space-y-3 text-center text-sm leading-6 text-muted-foreground">
          <p>
            Need a fresh code?{" "}
            <Link
              href="/forgot-password"
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Request another one
            </Link>
          </p>
          <p>
            Back to{" "}
            <Link
              href="/login"
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
