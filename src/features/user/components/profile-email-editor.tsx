"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { Loader2, Mail, PencilLine } from "lucide-react";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Controller, useForm, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { buildLoginRedirectPath } from "@/features/auth/utils/auth-redirect";
import {
  requestEmailChangeAction,
  verifyEmailChangeAction,
} from "@/features/user/actions/email-change.action";
import {
  requestEmailChangeSchema,
  verifyEmailChangeCodeSchema,
  type RequestEmailChangeInput,
  type VerifyEmailChangeCodeInput,
} from "@/features/user/schemas/profile.schema";
import type {
  RequestEmailChangeActionState,
  UserProfile,
  VerifyEmailChangeActionState,
} from "@/features/user/types/user.type";

interface ProfileEmailEditorProps {
  profile: UserProfile;
}

type EmailEditorMode = "edit" | "verify" | "view";

export function ProfileEmailEditor({ profile }: ProfileEmailEditorProps) {
  const router = useRouter();
  const [mode, setMode] = useState<EmailEditorMode>("view");
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [requestState, setRequestState] =
    useState<RequestEmailChangeActionState | null>(null);
  const [verifyState, setVerifyState] =
    useState<VerifyEmailChangeActionState | null>(null);
  const [isRequestPending, startRequestTransition] = useTransition();
  const [isVerifyPending, startVerifyTransition] = useTransition();
  const {
    control: emailControl,
    clearErrors: clearEmailErrors,
    handleSubmit: handleEmailSubmit,
    reset: resetEmailForm,
    setError: setEmailError,
  } = useForm<RequestEmailChangeInput>({
      defaultValues: {
        email: profile.email,
      },
      resolver: zodResolver(requestEmailChangeSchema),
  });
  const {
    control: codeControl,
    clearErrors: clearCodeErrors,
    handleSubmit: handleCodeSubmit,
    reset: resetCodeForm,
    setError: setCodeError,
  } = useForm<VerifyEmailChangeCodeInput>({
    defaultValues: {
      code: "",
    },
    resolver: zodResolver(verifyEmailChangeCodeSchema),
  });
  const currentInputEmail =
    useWatch({
      control: emailControl,
      name: "email",
    })?.trim() ?? "";
  const hasEmailChanged = currentInputEmail !== profile.email;

  const openEditor = (): void => {
    setMode("edit");
    setPendingEmail(null);
    setRequestState(null);
    setVerifyState(null);
    clearEmailErrors();
    clearCodeErrors();
    resetEmailForm({
      email: profile.email,
    });
    resetCodeForm({
      code: "",
    });
  };

  const closeEditor = (): void => {
    setMode("view");
    setPendingEmail(null);
    setRequestState(null);
    setVerifyState(null);
    clearEmailErrors();
    clearCodeErrors();
    resetEmailForm({
      email: profile.email,
    });
    resetCodeForm({
      code: "",
    });
  };

  const applyEmailRequestErrors = (
    state: RequestEmailChangeActionState,
  ): void => {
    const emailError = state.fieldErrors?.email?.[0];

    if (emailError) {
      setEmailError("email", {
        message: emailError,
        type: "server",
      });
    }
  };

  const applyEmailVerifyErrors = (
    state: VerifyEmailChangeActionState,
  ): void => {
    const emailError = state.fieldErrors?.email?.[0];
    const codeError = state.fieldErrors?.code?.[0];

    if (emailError) {
      setEmailError("email", {
        message: emailError,
        type: "server",
      });
    }

    if (codeError) {
      setCodeError("code", {
        message: codeError,
        type: "server",
      });
    }
  };

  const handleRequestEmailChange = (values: RequestEmailChangeInput): void => {
    clearEmailErrors();
    clearCodeErrors();
    setRequestState(null);
    setVerifyState(null);

    if (values.email.trim() === profile.email) {
      setEmailError("email", {
        message: "Please use a different email address.",
        type: "manual",
      });
      return;
    }

    startRequestTransition(async () => {
      const result = await requestEmailChangeAction({
        email: values.email.trim(),
      });

      if (!result.success) {
        setRequestState(result);
        applyEmailRequestErrors(result);

        if (result.requiresReauthentication) {
          router.replace(buildLoginRedirectPath("/profile"));
        }

        return;
      }

      setPendingEmail(result.pendingEmail ?? values.email.trim());
      setRequestState(result);
      setVerifyState(null);
      resetCodeForm({
        code: "",
      });
      setMode("verify");
    });
  };

  const handleVerifyEmailChange = (
    values: VerifyEmailChangeCodeInput,
  ): void => {
    if (!pendingEmail) {
      return;
    }

    clearCodeErrors();
    setVerifyState(null);

    startVerifyTransition(async () => {
      const result = await verifyEmailChangeAction({
        code: values.code,
        email: pendingEmail,
      });

      if (!result.success) {
        setVerifyState(result);
        applyEmailVerifyErrors(result);

        if (result.requiresReauthentication) {
          router.replace(buildLoginRedirectPath("/profile"));
        }

        return;
      }

      closeEditor();
    });
  };

  return (
    <section className="rounded-[1.5rem] border border-border/70 bg-background/65 p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
            <Mail className="size-4" />
          </span>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-foreground">
              Email Address
            </h3>
            <p className="text-sm leading-6 text-muted-foreground">
              Order updates and account verification go to this address.
            </p>
          </div>
        </div>

        {mode === "view" ? (
          <Button
            type="button"
            variant="outline"
            className="rounded-full"
            onClick={openEditor}
          >
            <PencilLine className="size-4" />
            Edit
          </Button>
        ) : null}
      </div>

      <div className="mt-5 rounded-[1.25rem] border border-border/60 bg-card/85 px-4 py-3">
        <p className="text-base font-medium text-foreground">{profile.email}</p>
      </div>

      {mode === "edit" ? (
        <form
          className="mt-5 space-y-4"
          noValidate
          onSubmit={handleEmailSubmit(handleRequestEmailChange)}
        >
          {requestState?.message ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm leading-6 whitespace-pre-line text-destructive">
              {requestState.message}
            </div>
          ) : null}

          <Controller
            control={emailControl}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>New Email</FieldLabel>
                <Input
                  {...field}
                  id={field.name}
                  type="email"
                  autoComplete="email"
                  aria-invalid={fieldState.invalid}
                  className="mt-2 h-12 rounded-2xl border-border/70 bg-card/85 px-4"
                  disabled={isRequestPending}
                  placeholder="you@example.com"
                />
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="outline"
              className="rounded-full"
              disabled={isRequestPending}
              onClick={closeEditor}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="rounded-full"
              disabled={isRequestPending || !hasEmailChanged}
            >
              {isRequestPending ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Verification Code"
              )}
            </Button>
          </div>
        </form>
      ) : null}

      {mode === "verify" && pendingEmail ? (
        <div className="mt-5 space-y-4">
          {requestState?.success ? (
            <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm leading-6 text-emerald-700 dark:text-emerald-300">
              We sent a 6-digit code to <span className="font-medium">{pendingEmail}</span>.
            </div>
          ) : null}

          {verifyState?.message ? (
            <div className="rounded-2xl border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm leading-6 whitespace-pre-line text-destructive">
              {verifyState.message}
            </div>
          ) : null}

          <form
            className="space-y-4"
            noValidate
            onSubmit={handleCodeSubmit(handleVerifyEmailChange)}
          >
            <Controller
              control={codeControl}
              name="code"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Verification Code</FieldLabel>
                  <div className="mt-2">
                    <InputOTP
                      maxLength={6}
                      value={field.value}
                      onChange={field.onChange}
                      disabled={isVerifyPending}
                      pattern={REGEXP_ONLY_DIGITS}
                      onComplete={() => handleCodeSubmit(handleVerifyEmailChange)()}
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

            <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={isVerifyPending}
                onClick={() => {
                  setMode("edit");
                  setVerifyState(null);
                  clearCodeErrors();
                  resetCodeForm({
                    code: "",
                  });
                }}
              >
                Change Email
              </Button>
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                disabled={isVerifyPending}
                onClick={closeEditor}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="rounded-full"
                disabled={isVerifyPending}
              >
                {isVerifyPending ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify Email"
                )}
              </Button>
            </div>
          </form>
        </div>
      ) : null}
    </section>
  );
}
