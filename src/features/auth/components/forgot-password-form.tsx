"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { useEffect, useMemo, useState, useTransition } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { forgotPasswordAction } from "@/features/auth/actions/forgot-password.action";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@/features/auth/schemas/auth.schema";
import type { ForgotPasswordActionState } from "@/features/auth/types/auth.type";

const getCooldownStorageKey = (email: string): string => {
  return `forgot-password:${email.trim().toLowerCase()}`;
};

const formatCountdown = (totalSeconds: number): string => {
  const minutes = Math.floor(totalSeconds / 60)
    .toString()
    .padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");

  return `${minutes}:${seconds}`;
};

export function ForgotPasswordForm() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [submissionState, setSubmissionState] =
    useState<ForgotPasswordActionState | null>(null);
  const [cooldownUntil, setCooldownUntil] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(() => Date.now());
  const { control, clearErrors, handleSubmit, setError } =
    useForm<ForgotPasswordInput>({
      defaultValues: {
        email: "",
      },
      resolver: zodResolver(forgotPasswordSchema),
    });
  const emailValue =
    useWatch({
      control,
      name: "email",
    }) ?? "";
  const normalizedEmail = emailValue.trim().toLowerCase();
  const cooldownSeconds = useMemo(() => {
    if (!cooldownUntil || cooldownUntil <= currentTime) {
      return 0;
    }

    return Math.ceil((cooldownUntil - currentTime) / 1000);
  }, [cooldownUntil, currentTime]);

  useEffect(() => {
    if (cooldownSeconds <= 0) {
      return;
    }

    const timerId = window.setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timerId);
    };
  }, [cooldownSeconds]);

  useEffect(() => {
    if (cooldownSeconds > 0 || !normalizedEmail || typeof window === "undefined") {
      return;
    }

    window.sessionStorage.removeItem(getCooldownStorageKey(normalizedEmail));
  }, [cooldownSeconds, normalizedEmail]);

  const applyServerErrors = (state: ForgotPasswordActionState): void => {
    const emailError = state.fieldErrors?.email?.[0];

    if (emailError) {
      setError("email", {
        message: emailError,
        type: "server",
      });
    }
  };

  const syncCooldownForEmail = (email: string): void => {
    if (typeof window === "undefined") {
      return;
    }

    const normalizedCandidate = email.trim().toLowerCase();

    if (!normalizedCandidate) {
      setCooldownUntil(0);
      return;
    }

    const storedExpiry = window.sessionStorage.getItem(
      getCooldownStorageKey(normalizedCandidate),
    );
    const parsedExpiry = storedExpiry ? Number(storedExpiry) : 0;

    setCooldownUntil(Number.isFinite(parsedExpiry) ? parsedExpiry : 0);
  };

  const persistCooldown = (email: string, seconds: number): void => {
    if (!email || typeof window === "undefined" || seconds <= 0) {
      return;
    }

    const expiry = currentTime + seconds * 1000;

    window.sessionStorage.setItem(
      getCooldownStorageKey(email),
      expiry.toString(),
    );
    setCooldownUntil(expiry);
  };

  const handleRequestReset = (values: ForgotPasswordInput): void => {
    clearErrors();
    setSubmissionState(null);

    startTransition(async () => {
      const result = await forgotPasswordAction(values);

      setSubmissionState(result);

      if (result.cooldownSeconds) {
        persistCooldown(values.email, result.cooldownSeconds);
      }

      if (!result.success) {
        applyServerErrors(result);
        return;
      }

      router.prefetch("/reset-password");
    });
  };

  const isSubmitDisabled = isPending || cooldownSeconds > 0;

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
              Request a reset code
            </h2>
            <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
              Enter the email for your account and we&apos;ll send a 6-digit
              password reset code if that address is eligible.
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

        {cooldownSeconds > 0 ? (
          <div className="rounded-2xl border border-border/60 bg-background/70 px-4 py-3 text-sm leading-6 text-muted-foreground">
            You can request another password reset code for this email in{" "}
            <span className="font-semibold text-foreground">
              {formatCountdown(cooldownSeconds)}
            </span>
            .
          </div>
        ) : null}

        <form
          className="space-y-5"
          noValidate
          onSubmit={handleSubmit(handleRequestReset)}
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
                    id={field.name}
                    name={field.name}
                    type="email"
                    autoComplete="email"
                    placeholder="chef@steakbox.com"
                    aria-invalid={fieldState.invalid}
                    className="h-12 rounded-full pr-4 pl-11"
                    disabled={isPending}
                    value={field.value}
                    onChange={(event) => {
                      field.onChange(event);
                      syncCooldownForEmail(event.target.value);
                    }}
                    onBlur={field.onBlur}
                    ref={field.ref}
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
            disabled={isSubmitDisabled}
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                Sending...
              </>
            ) : cooldownSeconds > 0 ? (
              `Request another code in ${formatCountdown(cooldownSeconds)}`
            ) : (
              "Send Reset Code"
            )}
            <ArrowRight className="size-4" />
          </Button>
        </form>

        <div className="space-y-3 text-center text-sm leading-6 text-muted-foreground">
          <p>
            Already have the code?{" "}
            <Link
              href="/reset-password"
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Continue to reset password
            </Link>
          </p>
          <p>
            Remembered it instead?{" "}
            <Link
              href="/login"
              className="font-semibold text-primary transition-colors hover:text-primary/80"
            >
              Back to login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
