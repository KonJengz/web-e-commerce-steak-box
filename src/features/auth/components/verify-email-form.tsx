"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Loader2, Mail } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { REGEXP_ONLY_DIGITS } from "input-otp";
import { verifyEmailAction } from "@/features/auth/actions/verify-email.action";
import {
  verifyEmailSchema,
  type VerifyEmailInput,
} from "@/features/auth/schemas/auth.schema";
import type { VerifyEmailActionState } from "@/features/auth/types/auth.type";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

export function VerifyEmailForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email")?.trim() ?? "";
  const [isPending, startTransition] = useTransition();
  const [submissionState, setSubmissionState] =
    useState<VerifyEmailActionState | null>(null);

  const { control, clearErrors, handleSubmit, setError, setValue } =
    useForm<VerifyEmailInput>({
      defaultValues: {
        code: "",
        email,
      },
      resolver: zodResolver(verifyEmailSchema),
    });

  useEffect(() => {
    if (!email) {
      return;
    }

    setValue("email", email, {
      shouldDirty: false,
      shouldValidate: false,
    });
  }, [email, setValue]);

  const applyServerErrors = (state: VerifyEmailActionState): void => {
    const emailError = state.fieldErrors?.email?.[0];
    const codeError = state.fieldErrors?.code?.[0];

    if (emailError) {
      setError("email", { message: emailError, type: "server" });
    }

    if (codeError) {
      setError("code", { message: codeError, type: "server" });
    }
  };

  const handleVerify = (values: VerifyEmailInput): void => {
    clearErrors();
    setSubmissionState(null);

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

  if (!email) {
    return (
      <div className="rounded-[2.5rem] border border-destructive/20 bg-destructive/5 p-8 text-center sm:p-12">
        <h3 className="text-xl font-bold text-destructive">Invalid Request</h3>
        <p className="mt-2 text-muted-foreground">
          No email address was provided for verification.
        </p>
        <Button asChild variant="link" className="mt-4">
          <Link href="/register">Go back to registration</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="relative mx-auto max-w-md overflow-hidden rounded-[2.5rem] border border-border/80 bg-card/95 p-6 shadow-[0_32px_120px_rgba(0,0,0,0.18)] sm:p-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--color-primary)_20%,transparent),transparent_75%)]" />

      <div className="relative space-y-8 text-center">
        <div className="space-y-4">
          <div className="mx-auto inline-flex size-16 items-center justify-center rounded-3xl border border-primary/20 bg-primary/10">
            <Mail className="size-8 text-primary" />
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground">
              Verify your email
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              We&apos;ve already created your account for{" "}
              <span className="font-semibold text-foreground">{email}</span>.
              Enter the 6-digit code to activate it and sign in automatically.
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
                  disabled={isPending}
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
              disabled={isPending}
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

            <div className="rounded-2xl border border-border/60 bg-background/50 px-4 py-3 text-left text-sm leading-6 text-muted-foreground">
              Need a new code or changed your details? Go back to registration
              and submit the form again with the same email. We avoid storing
              your password between steps, so resubmitting the form is the safe
              path here.
            </div>

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild variant="outline" className="flex-1 rounded-full">
                <Link href={`/register?email=${encodeURIComponent(email)}`}>
                  Back to Register
                </Link>
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
