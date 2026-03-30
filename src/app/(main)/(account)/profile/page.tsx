import type { Metadata } from "next";
import { CalendarDays, ShieldCheck } from "lucide-react";

import { BASE_PRIVATE_METADATA } from "@/lib/metadata";

import { AccountPageHero } from "@/components/account/account-page-hero";
import { formatAccountDate } from "@/components/account/account.utils";
import { Badge } from "@/components/ui/badge";
import { requireCurrentUser } from "@/features/auth/services/current-user.service";
import { ProfileEmailEditor } from "@/features/user/components/profile-email-editor";
import { ProfileNameEditor } from "@/features/user/components/profile-name-editor";
import { ProfilePhotoEditor } from "@/features/user/components/profile-photo-editor";

export const metadata: Metadata = {
  ...BASE_PRIVATE_METADATA,
  title: "My Profile",
};

export default async function ProfilePage() {
  const profile = await requireCurrentUser();

  return (
    <div className="space-y-6">
      <AccountPageHero
        badge="Profile"
        title="Keep your account details sharp."
        description="Use this space to keep your display name and profile photo current. Everything here stays focused on the identity attached to your account."
        variant="profile"
      >
        <Badge className="rounded-full px-3 py-1">
          {profile.isVerified ? "Verified Account" : "Verification Pending"}
        </Badge>
      </AccountPageHero>

      <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)] sm:p-8">
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] xl:items-start">
          <div className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs font-semibold tracking-[0.24em] uppercase text-primary">
                Account Overview
              </p>
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="text-2xl font-semibold tracking-tight text-foreground">
                    {profile.name}
                  </h2>
                  <Badge className="rounded-full px-2.5 py-1">
                    {profile.isActive ? "Active" : "Suspended"}
                  </Badge>
                  {profile.isVerified ? (
                    <Badge
                      variant="outline"
                      className="rounded-full px-2.5 py-1"
                    >
                      Verified
                    </Badge>
                  ) : null}
                </div>
                <p className="max-w-2xl text-sm leading-7 text-muted-foreground">
                  Keep the identity tied to your orders current. Update the name
                  customers see, change your email safely, and manage the
                  profile image shown across the account area without repeating
                  the same visual block multiple times.
                </p>
              </div>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-background/60 px-4 py-4">
              <p className="text-xs font-semibold tracking-[0.2em] uppercase text-muted-foreground">
                Current Email
              </p>
              <p className="mt-2 text-base font-medium text-foreground">
                {profile.email}
              </p>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
            <div className="rounded-[1.5rem] border border-border/70 bg-background/65 p-4">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                <ShieldCheck className="size-4" />
              </div>
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                Account Status
              </p>
              <p className="mt-2 text-base font-medium text-foreground">
                {profile.isActive ? "Ready to order" : "Temporarily unavailable"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Verification: {profile.isVerified ? "Completed" : "Pending"}
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-background/65 p-4">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                <CalendarDays className="size-4" />
              </div>
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                Member Since
              </p>
              <p className="mt-2 text-base font-medium text-foreground">
                {formatAccountDate(profile.createdAt)}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Your order history and account changes build from this date.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <div className="space-y-4">
            <ProfileNameEditor
              key={`${profile.id}:${profile.name}`}
              profile={profile}
            />
            <ProfileEmailEditor
              key={`${profile.id}:${profile.email}`}
              profile={profile}
            />
          </div>

          <div className="space-y-4">
            <ProfilePhotoEditor
              key={`${profile.id}:${profile.image ?? "no-image"}`}
              profile={profile}
            />
          </div>
        </div>
      </section>
    </div>
  );
}
