"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";
import { logoutAction } from "@/features/auth/actions/logout.action";

export function AdminLogoutButton() {
  const [isPending, startTransition] = useTransition();

  const handleLogout = (): void => {
    startTransition(async () => {
      const result = await logoutAction();
      window.location.assign(result.redirectTo);
    });
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={handleLogout}
      disabled={isPending}
      aria-label="Sign out"
      className="size-9 rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
    >
      <LogOut className="size-4" />
    </Button>
  );
}
