import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";

import { ResetPasswordForm } from "@/features/auth/components/reset-password-form";
import {
  getPendingPasswordResetEmail,
  maskEmailAddress,
} from "@/features/auth/services/auth-session.service";
import { BASE_PRIVATE_METADATA } from "@/lib/metadata";

export const metadata: Metadata = {
  ...BASE_PRIVATE_METADATA,
  title: "Reset Password",
  description: "Reset your Steak Box password with the code sent to your email.",
};

export default async function ResetPasswordPage() {
  const pendingPasswordResetEmail = await getPendingPasswordResetEmail();
  const maskedEmail = pendingPasswordResetEmail
    ? maskEmailAddress(pendingPasswordResetEmail)
    : null;

  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center py-10">
      <ResetPasswordForm maskedEmail={maskedEmail} />

      {maskedEmail ? (
        <div className="mt-12 flex max-w-xs items-start gap-3 rounded-2xl border border-border/50 bg-muted/30 p-4">
          <AlertCircle className="mt-0.5 size-4 text-muted-foreground" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Reset codes stay valid for 15 minutes and can only be used once. If
            the code expires, request a new one from the forgot password page.
          </p>
        </div>
      ) : null}
    </div>
  );
}
