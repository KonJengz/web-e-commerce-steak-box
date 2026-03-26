import type { Metadata } from "next";
 import { Suspense } from "react";
 import { AlertCircle, Loader2 } from "lucide-react";
 import { VerifyEmailForm } from "@/features/auth/components/verify-email-form";
 
export const metadata: Metadata = {
  title: "Verify Email - Steak Box",
   description: "Confirm your email and sign in automatically.",
};
 
 export default function VerifyEmailPage() {
   return (
     <div className="flex min-h-[calc(100vh-16rem)] flex-col items-center justify-center py-10">
       <Suspense fallback={
         <div className="flex flex-col items-center gap-4">
           <Loader2 className="size-8 animate-spin text-primary" />
           <p className="text-sm text-muted-foreground">Loading verification...</p>
         </div>
       }>
         <VerifyEmailForm />
       </Suspense>
 
       <div className="mt-12 flex max-w-xs items-start gap-3 rounded-2xl border border-border/50 bg-muted/30 p-4">
         <AlertCircle className="mt-0.5 size-4 text-muted-foreground" />
         <p className="text-[11px] leading-relaxed text-muted-foreground">
           Check your spam or junk folder if you don&apos;t see the message in your inbox within a few minutes.
           The code is valid for 15 minutes, and once it succeeds you&apos;ll be signed in automatically.
         </p>
       </div>
     </div>
   );
 }
