import { CalendarDays, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";

import { AccountPageHero } from "@/components/account/account-page-hero";
import { formatAccountDate } from "@/components/account/account.utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { getCurrentUser } from "@/features/auth/services/current-user.service";
import { ProfileEmailEditor } from "@/features/user/components/profile-email-editor";
import { ProfileNameEditor } from "@/features/user/components/profile-name-editor";
import { ProfilePhotoEditor } from "@/features/user/components/profile-photo-editor";
import { resolveUserAvatar } from "@/features/user/utils/avatar";

export default async function ProfilePage() {
  const profile = await getCurrentUser();

  if (!profile) {
    redirect("/login");
  }

  const avatar = resolveUserAvatar(profile.email, profile.image);

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
        <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
          <Avatar className="size-20 border-border shadow-md">
            <AvatarImage
              src={avatar}
              alt={profile.name}
              referrerPolicy="no-referrer"
            />
            <AvatarFallback className="bg-primary/10 font-semibold text-primary">
              {profile.name.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-2">
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
            <p className="text-sm leading-6 text-muted-foreground">
              {profile.email}
            </p>
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
                Your account history starts from this date.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
