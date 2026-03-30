import type { Metadata } from "next";
import { AlertCircle } from "lucide-react";

import {
  getPendingVerificationEmail,
  maskEmailAddress,
} from "@/features/auth/services/auth-session.service";
import { BASE_PRIVATE_METADATA } from "@/lib/metadata";
import { VerifyEmailForm } from "@/features/auth/components/verify-email-form";

export const metadata: Metadata = {
  ...BASE_PRIVATE_METADATA,
  title: "Verify Email",
  description: "Confirm your email and sign in automatically.",
};

export default async function VerifyEmailPage() {
  const pendingVerificationEmail = await getPendingVerificationEmail();
  const maskedEmail = pendingVerificationEmail
    ? maskEmailAddress(pendingVerificationEmail)
    : null;

  return (
    <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center py-10">
      <VerifyEmailForm maskedEmail={maskedEmail} />

      {maskedEmail ? (
        <div className="mt-12 flex max-w-xs items-start gap-3 rounded-2xl border border-border/50 bg-muted/30 p-4">
          <AlertCircle className="mt-0.5 size-4 text-muted-foreground" />
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            Check spam or junk if the message is slow to arrive. The
            verification code stays valid for 15 minutes, and the resend
            button issues a fresh code when you need one.
          </p>
        </div>
      ) : null}
    </div>
  );
}
