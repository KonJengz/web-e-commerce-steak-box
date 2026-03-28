import { Link2, ShieldCheck } from "lucide-react";

import {
  GoogleIcon,
} from "@/features/auth/components/auth-google-button";
import { Button } from "@/components/ui/button";

type GoogleLinkNoticeTone = "error" | "success";

export interface GoogleLinkNotice {
  message: string;
  tone: GoogleLinkNoticeTone;
}

interface GoogleLinkCardProps {
  email: string;
  notice?: GoogleLinkNotice | null;
  redirectTo: string;
}

export function GoogleLinkCard({
  email,
  notice = null,
  redirectTo,
}: GoogleLinkCardProps) {
  return (
    <section className="rounded-[1.5rem] border border-border/70 bg-background/65 p-5">
      <div className="flex items-start gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
          <Link2 className="size-4" />
        </span>
        <div className="space-y-1">
          <h3 className="text-base font-semibold text-foreground">
            Connected Google Account
          </h3>
          <p className="text-sm leading-6 text-muted-foreground">
            Link the Google account you want to use with <span className="font-medium text-foreground">{email}</span>.
            The flow is safe to run again if this same Google account is already
            attached.
          </p>
        </div>
      </div>

      {notice ? (
        <div
          className={`mt-5 rounded-2xl px-4 py-3 text-sm leading-6 whitespace-pre-line ${
            notice.tone === "success"
              ? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              : "border border-destructive/20 bg-destructive/10 text-destructive"
          }`}
        >
          {notice.message}
        </div>
      ) : null}

      <div className="mt-5 rounded-[1.25rem] border border-border/60 bg-card/85 p-4">
        <div className="flex items-start gap-3">
          <span className="mt-0.5 inline-flex size-9 items-center justify-center rounded-full bg-primary/12 text-primary">
            <ShieldCheck className="size-4" />
          </span>
          <div className="space-y-1">
            <p className="text-base font-medium text-foreground">
              Start linking in a new Google step
            </p>
            <p className="text-sm leading-6 text-muted-foreground">
              We keep this inside the protected account area, redirect through the
              backend callback, then bring you back here with the final result.
            </p>
          </div>
        </div>
      </div>

      <form action="/api/auth/google/link/start" method="post" className="mt-5">
        <input type="hidden" name="redirectTo" value={redirectTo} />
        <Button
          type="submit"
          variant="outline"
          className="h-12 w-full rounded-full border-border/60 bg-background/80 font-semibold shadow-sm transition-all hover:bg-muted/60"
        >
          <GoogleIcon />
          <span>Link Google Account</span>
        </Button>
      </form>
    </section>
  );
}
