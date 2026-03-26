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
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useState, useTransition } from "react";
import { Controller, useForm } from "react-hook-form";

import { registerAction } from "@/features/auth/actions/register.action";
import {
  registerSchema,
  type RegisterInput,
} from "@/features/auth/schemas/auth.schema";
import type { RegisterActionState } from "@/features/auth/types/auth.type";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";

const defaultValues: RegisterInput = {
  confirmPassword: "",
  email: "",
  name: "",
  password: "",
};

interface RegisterFormProps {
  prefilledEmail?: string;
}

export function RegisterForm({
  prefilledEmail = "",
}: RegisterFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isPasswordVisible, setIsPasswordVisible] = useState<boolean>(false);
  const [submissionState, setSubmissionState] =
    useState<RegisterActionState | null>(null);
  const { control, clearErrors, handleSubmit, setError } =
    useForm<RegisterInput>({
      defaultValues: {
        ...defaultValues,
        email: prefilledEmail,
      },
      resolver: zodResolver(registerSchema),
    });

  const applyServerErrors = (state: RegisterActionState): void => {
    const nameError = state.fieldErrors?.name?.[0];
    const emailError = state.fieldErrors?.email?.[0];
    const passwordError = state.fieldErrors?.password?.[0];
    const confirmPasswordError = state.fieldErrors?.confirmPassword?.[0];

    if (nameError) {
      setError("name", { message: nameError, type: "server" });
    }

    if (emailError) {
      setError("email", { message: emailError, type: "server" });
    }

    if (passwordError) {
      setError("password", { message: passwordError, type: "server" });
    }

    if (confirmPasswordError) {
      setError("confirmPassword", {
        message: confirmPasswordError,
        type: "server",
      });
    }
  };

  const handleRegister = (values: RegisterInput): void => {
    clearErrors();
    setSubmissionState(null);

    startTransition(async () => {
      const result = await registerAction(values);

      if (!result.success) {
        setSubmissionState(result);
        applyServerErrors(result);
        return;
      }

      router.replace(result.redirectTo ?? "/verify-email");
    });
  };

  return (
    <div className="relative overflow-hidden rounded-[2.5rem] border border-border/80 bg-card/95 p-6 shadow-[0_32px_120px_rgba(0,0,0,0.18)] sm:p-10">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,color-mix(in_oklab,var(--color-primary)_20%,transparent),transparent_75%)]" />

      <div className="relative space-y-8">
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-[10px] font-bold tracking-[0.2em] text-primary uppercase">
            <ShieldCheck className="size-3" />
            Secure Enrollment
          </div>

          <div className="space-y-2">
            <h2 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Create your account
            </h2>
            <p className="max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
              We&apos;ll create your account now and send a 6-digit verification
              code. Once you confirm it, you&apos;ll be signed in automatically.
            </p>
          </div>
        </div>

        {submissionState?.message ? (
          <div className="rounded-2xl border border-destructive/25 bg-destructive/10 px-5 py-4 text-sm leading-6 whitespace-pre-line text-destructive">
            {submissionState.message}
          </div>
        ) : null}

        <form
          className="space-y-6"
          noValidate
          onSubmit={handleSubmit(handleRegister)}
        >
          <Controller
            control={control}
            name="name"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Full Name</FieldLabel>
                <div className="relative mt-2">
                  <UserRound className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-muted-foreground/70" />
                  <Input
                    {...field}
                    id={field.name}
                    autoComplete="name"
                    placeholder="Jane Doe"
                    aria-invalid={fieldState.invalid}
                    className="h-13 rounded-full border-border/60 bg-background/50 pr-5 pl-12 transition-all focus:bg-background focus:ring-primary/20"
                    disabled={isPending}
                  />
                </div>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor={field.name}>Email Address</FieldLabel>
                <div className="relative mt-2">
                  <Mail className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-muted-foreground/70" />
                  <Input
                    {...field}
                    id={field.name}
                    type="email"
                    autoComplete="email"
                    placeholder="chef@steakbox.com"
                    aria-invalid={fieldState.invalid}
                    className="h-13 rounded-full border-border/60 bg-background/50 pr-5 pl-12 transition-all focus:bg-background focus:ring-primary/20"
                    disabled={isPending}
                  />
                </div>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />

          <div className="grid gap-6 sm:grid-cols-2">
            <Controller
              control={control}
              name="password"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                  <div className="relative mt-2">
                    <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      {...field}
                      id={field.name}
                      type={isPasswordVisible ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="At least 8 characters"
                      aria-invalid={fieldState.invalid}
                      className="h-13 rounded-full border-border/60 bg-background/50 pr-12 pl-12 transition-all focus:bg-background focus:ring-primary/20"
                      disabled={isPending}
                    />
                    <button
                      type="button"
                      aria-label={
                        isPasswordVisible ? "Hide password" : "Show password"
                      }
                      aria-pressed={isPasswordVisible}
                      className="absolute top-1/2 right-4 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
                      disabled={isPending}
                      onClick={() => setIsPasswordVisible((visible) => !visible)}
                    >
                      {isPasswordVisible ? (
                        <EyeOff className="size-4.5" />
                      ) : (
                        <Eye className="size-4.5" />
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
                  <div className="relative mt-2">
                    <LockKeyhole className="pointer-events-none absolute top-1/2 left-4 size-4.5 -translate-y-1/2 text-muted-foreground/70" />
                    <Input
                      {...field}
                      id={field.name}
                      type={isPasswordVisible ? "text" : "password"}
                      autoComplete="new-password"
                      placeholder="Repeat your password"
                      aria-invalid={fieldState.invalid}
                      className="h-13 rounded-full border-border/60 bg-background/50 pr-5 pl-12 transition-all focus:bg-background focus:ring-primary/20"
                      disabled={isPending}
                    />
                  </div>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          </div>

          <div className="rounded-2xl border border-border/60 bg-background/50 px-4 py-3 text-sm leading-6 text-muted-foreground">
            Already registered but still waiting for a code? Submit this form
            again with the same email to update your pending account and issue a
            fresh verification code.
          </div>

          <div className="space-y-4 pt-2">
            <Button
              type="submit"
              size="lg"
              className="group h-13 w-full rounded-full bg-primary text-sm font-bold text-white shadow-xl shadow-primary/25 transition-all hover:bg-primary/90 active:scale-[0.98]"
              disabled={isPending}
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 size-5 animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Continue to Verification
                  <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </Button>

            <p className="text-center text-xs leading-relaxed text-muted-foreground">
              By creating an account, you agree to our{" "}
              <Link
                href="#"
                className="underline decoration-border/50 underline-offset-4 hover:text-foreground"
              >
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link
                href="#"
                className="underline decoration-border/50 underline-offset-4 hover:text-foreground"
              >
                Privacy Policy
              </Link>
              .
            </p>
          </div>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border/50" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-3 font-medium tracking-widest text-muted-foreground">
              Already a member?
            </span>
          </div>
        </div>

        <Button
          variant="outline"
          asChild
          className="h-13 w-full rounded-full border-border/60 font-semibold transition-all hover:bg-muted/50"
        >
          <Link href="/login">Sign In to Your Account</Link>
        </Button>
      </div>
    </div>
  );
}
