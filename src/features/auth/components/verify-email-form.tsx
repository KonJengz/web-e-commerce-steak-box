"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, Mail, RefreshCw } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { resendVerificationAction } from "@/features/auth/actions/resend-verification.action";
import { verifyEmailAction } from "@/features/auth/actions/verify-email.action";
import {
  verifyEmailSubmissionSchema,
  type VerifyEmailSubmissionInput,
} from "@/features/auth/schemas/auth.schema";
import type {
  ResendVerificationActionState,
  VerifyEmailActionState,
} from "@/features/auth/types/auth.type";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

const OTP_EXPIRY_SECONDS = 15 * 60;
const REDIRECT_DELAY_MS = 1800;
const RESEND_NOTICE_DURATION_MS = 3200;

const formatCountdown = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
};

interface VerifyEmailFormProps {
  maskedEmail: string | null;
}

export function VerifyEmailForm({ maskedEmail }: VerifyEmailFormProps) {
  if (!maskedEmail) {
    return (
      <div className="rounded-[2.5rem] border border-destructive/20 bg-destructive/5 p-8 text-center sm:p-12">
        <h3 className="text-xl font-bold text-destructive">
          Verification Session Expired
        </h3>
        <p className="mt-2 text-muted-foreground">
          This verification step is no longer available. Start a new signup or
          sign in again to continue.
        </p>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row sm:justify-center">
          <Button asChild variant="outline" className="rounded-full">
            <Link href="/register">Go to Register</Link>
          </Button>
          <Button asChild variant="ghost" className="rounded-full">
            <Link href="/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <VerifyEmailFormContent key={maskedEmail} maskedEmail={maskedEmail} />
  );
}

interface VerifyEmailFormContentProps {
  maskedEmail: string;
}

function VerifyEmailFormContent({
  maskedEmail,
}: VerifyEmailFormContentProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isResending, startResendTransition] = useTransition();
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const [otpCountdown, setOtpCountdown] = useState<number>(OTP_EXPIRY_SECONDS);
  const [resendState, setResendState] =
    useState<ResendVerificationActionState | null>(null);
  const [submissionState, setSubmissionState] =
    useState<VerifyEmailActionState | null>(null);

  const { control, clearErrors, handleSubmit, setError, reset } =
    useForm<VerifyEmailSubmissionInput>({
      defaultValues: {
        code: "",
      },
      resolver: zodResolver(verifyEmailSubmissionSchema),
    });

  useEffect(() => {
    if (otpCountdown <= 0 && resendCooldown <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setOtpCountdown((currentCountdown) =>
        currentCountdown > 0 ? currentCountdown - 1 : 0,
      );
      setResendCooldown((currentCooldown) =>
        currentCooldown > 0 ? currentCooldown - 1 : 0,
      );
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [otpCountdown, resendCooldown]);

  useEffect(() => {
    if (!resendState?.success) {
      return;
    }

    const dismissId = window.setTimeout(() => {
      setResendState((currentState) =>
        currentState?.success ? null : currentState,
      );
    }, RESEND_NOTICE_DURATION_MS);

    return () => {
      window.clearTimeout(dismissId);
    };
  }, [resendState]);

  useEffect(() => {
    const redirectTo = submissionState?.redirectTo ?? resendState?.redirectTo;

    if (!redirectTo) {
      return;
    }

    const redirectId = window.setTimeout(() => {
      router.replace(redirectTo);
    }, REDIRECT_DELAY_MS);

    return () => {
      window.clearTimeout(redirectId);
    };
  }, [resendState?.redirectTo, router, submissionState?.redirectTo]);

  const applyServerErrors = (state: VerifyEmailActionState): void => {
    const codeError = state.fieldErrors?.code?.[0];

    if (codeError) {
      setError("code", { message: codeError, type: "server" });
    }
  };

  const handleVerify = (values: VerifyEmailSubmissionInput): void => {
    clearErrors();
    setSubmissionState(null);
    setResendState(null);

    startTransition(async () => {
      const result = await verifyEmailAction(values);

      if (!result.success) {
        setSubmissionState(result);
        applyServerErrors(result);
        return;
      }

      router.replace(result.redirectTo ?? "/");
      router.refresh();
    });
  };

  const handleResend = (): void => {
    if (resendCooldown > 0) {
      return;
    }

    setResendState(null);

    startResendTransition(async () => {
      const result = await resendVerificationAction();

      setResendState(result);
      setResendCooldown(result.cooldownSeconds ?? 0);

      if (!result.success) {
        return;
      }

      clearErrors("code");
      setSubmissionState(null);
      reset({ code: "" });
      setOtpCountdown(OTP_EXPIRY_SECONDS);
    });
  };

  return (
    <div className="relative mx-auto max-w-md overflow-hidden rounded-[2.5rem] border border-border/80 bg-card/95 p-6 shadow-[0_32px_120px_rgba(0,0,0,0.18)] sm:p-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--color-primary)_20%,transparent),transparent_75%)]" />

      <div className="relative space-y-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto inline-flex size-16 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10">
            <Mail className="size-8 text-primary" />
          </div>

          <div className="space-y-3">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Verify your email
            </h2>
            <div className="flex flex-wrap items-center justify-center gap-2">
              <span className="rounded-full border border-border/60 bg-background/70 px-3 py-1 text-xs font-medium text-foreground">
                {maskedEmail}
              </span>
              <span
                className={
                  otpCountdown > 0
                    ? "rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-xs font-medium text-primary"
                    : "rounded-full border border-destructive/20 bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive"
                }
              >
                {otpCountdown > 0
                  ? `OTP expires in ${formatCountdown(otpCountdown)}`
                  : "OTP expired. Request a new one."}
              </span>
            </div>
            <p className="text-sm leading-6 text-muted-foreground">
              Enter the 6-digit OTP to activate your account and sign in
              automatically.
            </p>
          </div>
        </div>

        {submissionState?.message ? (
          <div className="rounded-2xl border border-destructive/25 bg-destructive/10 px-5 py-4 text-sm leading-6 whitespace-pre-line text-destructive">
            {submissionState.message}
          </div>
        ) : null}

        <form
          className="space-y-8"
          noValidate
          onSubmit={handleSubmit(handleVerify)}
        >
          <Controller
            control={control}
            name="code"
            render={({ field, fieldState }) => (
              <Field
                className="flex flex-col items-center"
                data-invalid={fieldState.invalid}
              >
                <FieldLabel className="sr-only">Verification Code</FieldLabel>
                <InputOTP
                  maxLength={6}
                  value={field.value}
                  onChange={field.onChange}
                  disabled={
                    isPending ||
                    Boolean(submissionState?.redirectTo) ||
                    Boolean(resendState?.redirectTo)
                  }
                  pattern={REGEXP_ONLY_DIGITS}
                  onComplete={() => handleSubmit(handleVerify)()}
                >
                  <InputOTPGroup className="gap-2">
                    <InputOTPSlot index={0} className="h-14 w-12 rounded-xl text-xl font-bold ring-offset-background" />
                    <InputOTPSlot index={1} className="h-14 w-12 rounded-xl text-xl font-bold ring-offset-background" />
                    <InputOTPSlot index={2} className="h-14 w-12 rounded-xl text-xl font-bold ring-offset-background" />
                    <InputOTPSlot index={3} className="h-14 w-12 rounded-xl text-xl font-bold ring-offset-background" />
                    <InputOTPSlot index={4} className="h-14 w-12 rounded-xl text-xl font-bold ring-offset-background" />
                    <InputOTPSlot index={5} className="h-14 w-12 rounded-xl text-xl font-bold ring-offset-background" />
                  </InputOTPGroup>
                </InputOTP>
                <div className="mt-2 h-4">
                  <FieldError errors={[fieldState.error]} />
                </div>
              </Field>
            )}
          />

          <div className="space-y-4">
            <Button
              type="submit"
              size="lg"
              className="group h-13 w-full rounded-full bg-primary text-sm font-bold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98]"
              disabled={
                isPending ||
                Boolean(submissionState?.redirectTo) ||
                Boolean(resendState?.redirectTo)
              }
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Verifying...
                </>
              ) : (
                <>
                  Verify and Continue
                  <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>

            <div className="rounded-2xl border border-border/60 bg-background/50 px-4 py-4 text-left text-sm leading-6 text-muted-foreground">
              <p>
                If your OTP expires or you need a new one, use the resend
                button below. After each request, the button unlocks again in 1
                minute.
              </p>

              <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-full"
                  disabled={
                    isPending ||
                    isResending ||
                    resendCooldown > 0 ||
                    Boolean(resendState?.redirectTo) ||
                    Boolean(submissionState?.redirectTo)
                  }
                  onClick={handleResend}
                >
                  {isResending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <RefreshCw className="size-4" />
                      {resendCooldown > 0
                        ? `Resend OTP in ${formatCountdown(resendCooldown)}`
                        : "Resend OTP"}
                    </>
                  )}
                </Button>

                <p className="text-xs leading-5 text-muted-foreground sm:text-right">
                  The latest OTP stays valid for 15 minutes.
                </p>
              </div>
            </div>

            {resendState?.message ? (
              <div
                aria-live="polite"
                className={
                  resendState.success
                    ? "rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-5 py-4 text-sm leading-6 text-emerald-700 dark:text-emerald-400"
                    : "rounded-2xl border border-destructive/25 bg-destructive/10 px-5 py-4 text-sm leading-6 text-destructive"
                }
              >
                {resendState.message}
              </div>
            ) : null}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="flex-1 rounded-full">
                <Link href="/register">Back to Register</Link>
              </Button>
              <Button asChild variant="ghost" className="flex-1 rounded-full">
                <Link href="/login">Go to Login</Link>
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
