import type { Metadata } from "next";
import { Badge } from "@/components/ui/badge";

import { AccountPageHero } from "@/components/account/account-page-hero";
import { requireCurrentUser } from "@/features/auth/services/current-user.service";
import {
  GoogleLinkCard,
  type GoogleLinkNotice,
} from "@/features/auth/components/google-link-card";
import { authService } from "@/features/auth/services/auth.service";
import { ProfilePasswordEditor } from "@/features/user/components/profile-password-editor";

export const metadata: Metadata = {
  title: "Security",
};

const getGoogleLinkNotice = (
  provider: string | null | undefined,
  status: string | null | undefined,
  error: string | null | undefined,
): GoogleLinkNotice | null => {
  if (provider !== "google") {
    return null;
  }

  if (status === "success") {
    return {
      message:
        "Google was linked to this account successfully. You can keep using your current sign-in method, and Google is now available for this account too.",
      tone: "success",
    };
  }

  switch (error) {
    case "google_link_access_denied":
      return {
        message: "Google account linking was canceled before completion.",
        tone: "error",
      };
    case "invalid_oauth_state":
    case "invalid_oauth_link_session":
    case "missing_oauth_code":
    case "missing_oauth_pkce_verifier":
    case "link_session_expired":
      return {
        message:
          "The Google linking session expired or could not be verified. Start the flow again from this page.",
        tone: "error",
      };
    case "oauth_account_already_linked":
      return {
        message:
          "This Google account is already linked to another user and cannot be attached here.",
        tone: "error",
      };
    case "oauth_provider_conflict":
      return {
        message:
          "This account is already connected to a different Google identity. Use the originally linked Google account instead.",
        tone: "error",
      };
    case "account_suspended":
      return {
        message:
          "This account is suspended. Contact support if you need help restoring access.",
        tone: "error",
      };
    case "google_link_failed":
    default:
      return error
        ? {
            message:
              "Google account linking could not be completed. Please try again.",
            tone: "error",
          }
        : null;
  }
};

interface SecurityPageProps {
  searchParams: Promise<{
    link_error?: string | string[];
    link_provider?: string | string[];
    link_status?: string | string[];
  }>;
}

export default async function SecurityPage({
  searchParams,
}: SecurityPageProps) {
  const profile = await requireCurrentUser("/security");

  const resolvedSearchParams = await searchParams;
  const linkProviderParam = resolvedSearchParams.link_provider;
  const linkStatusParam = resolvedSearchParams.link_status;
  const linkErrorParam = resolvedSearchParams.link_error;
  const linkProvider =
    typeof linkProviderParam === "string"
      ? linkProviderParam
      : linkProviderParam?.[0];
  const linkStatus =
    typeof linkStatusParam === "string" ? linkStatusParam : linkStatusParam?.[0];
  const linkError =
    typeof linkErrorParam === "string" ? linkErrorParam : linkErrorParam?.[0];
  const googleLinkNotice = getGoogleLinkNotice(
    linkProvider,
    linkStatus,
    linkError,
  );
  const googleLinkHref = authService.buildGoogleLinkStartHref("/security");

  return (
    <div className="space-y-6">
      <AccountPageHero
        badge="Security"
        title="Protect access and connect trusted sign-in methods."
        description="Manage your password and link Google to this account without leaving the protected account area."
        variant="security"
      >
        <Badge className="rounded-full px-3 py-1">
          {profile.isVerified ? "Verified Account" : "Verification Pending"}
        </Badge>
      </AccountPageHero>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <ProfilePasswordEditor profile={profile} redirectPath="/security" />
        <GoogleLinkCard
          email={profile.email}
          href={googleLinkHref}
          notice={googleLinkNotice}
        />
      </div>
    </div>
  );
}
