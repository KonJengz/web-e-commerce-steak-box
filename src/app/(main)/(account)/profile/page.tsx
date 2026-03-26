import Link from "next/link";
import { Mail, ShieldCheck, Sparkles, UserRound } from "lucide-react";
import { redirect } from "next/navigation";

import { AccountPageHero } from "@/components/account/account-page-hero";
import {
  formatAccountDate,
  formatAccountDateTime,
} from "@/components/account/account.utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/features/auth/services/current-user.service";

export default async function ProfilePage() {
  const profile = await getCurrentUser();

  if (!profile) {
    redirect("/login");
  }

  const avatar =
    profile.image ??
    `https://api.dicebear.com/9.x/initials/svg?seed=${encodeURIComponent(profile.email)}`;

  return (
    <div className="space-y-6">
      <AccountPageHero
        badge="Profile Deck"
        title="Keep your member profile sharp."
        description="Your account details live here. Review your verified email, profile identity, and account standing before moving into checkout or order support."
        variant="profile"
      >
        <Badge className="rounded-full px-3 py-1">
          {profile.isVerified ? "Verified Member" : "Pending Verification"}
        </Badge>
        <Badge variant="outline" className="rounded-full border-white/20 px-3 py-1 text-white/80">
          Role: {profile.role}
        </Badge>
      </AccountPageHero>

      <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <section className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <Avatar className="size-20 border-border shadow-md">
              <AvatarImage src={avatar} alt={profile.name} />
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
              </div>
              <p className="text-sm leading-6 text-muted-foreground">
                Signed in as <span className="font-medium text-foreground">{profile.email}</span>
              </p>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-[1.5rem] border border-border/70 bg-background/65 p-4">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                <Mail className="size-4" />
              </div>
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                Email
              </p>
              <p className="mt-2 text-base font-medium text-foreground">
                {profile.email}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Verified and ready for order confirmations.
              </p>
            </div>

            <div className="rounded-[1.5rem] border border-border/70 bg-background/65 p-4">
              <div className="mb-3 inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                <ShieldCheck className="size-4" />
              </div>
              <p className="text-xs font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                Account Status
              </p>
              <p className="mt-2 text-base font-medium text-foreground">
                {profile.isActive ? "Active" : "Suspended"}
              </p>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Email verified: {profile.isVerified ? "Yes" : "No"}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
            <div className="mb-5 flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                <UserRound className="size-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Membership Snapshot
                </h2>
                <p className="text-sm text-muted-foreground">
                  Quick profile metadata from the account service.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                <span className="text-sm text-muted-foreground">Member since</span>
                <span className="text-sm font-medium text-foreground">
                  {formatAccountDate(profile.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                <span className="text-sm text-muted-foreground">Created at</span>
                <span className="text-sm font-medium text-foreground">
                  {formatAccountDateTime(profile.createdAt)}
                </span>
              </div>
              <div className="flex items-center justify-between rounded-[1.25rem] border border-border/60 bg-background/55 px-4 py-3">
                <span className="text-sm text-muted-foreground">Role</span>
                <span className="text-sm font-medium text-foreground">
                  {profile.role}
                </span>
              </div>
            </div>
          </div>

          <div className="rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_22px_70px_rgba(0,0,0,0.06)]">
            <div className="mb-4 flex items-center gap-3">
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
                <Sparkles className="size-4" />
              </span>
              <div>
                <h2 className="text-lg font-semibold text-foreground">
                  Next Steps
                </h2>
                <p className="text-sm text-muted-foreground">
                  Jump deeper into your account.
                </p>
              </div>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="rounded-full">
                <Link href="/orders">Review Orders</Link>
              </Button>
              <Button asChild variant="outline" className="rounded-full">
                <Link href="/addresses">Manage Addresses</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
