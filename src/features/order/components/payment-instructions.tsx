"use client";

import { useState } from "react";
import { Check, Copy, Landmark, QrCode } from "lucide-react";

import { Button } from "@/components/ui/button";
import { STORE_BANK_ACCOUNTS } from "@/lib/payment-config";
import { copyToClipboard } from "@/lib/utils";

export function PaymentInstructions() {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (text: string, id: string) => {
    const success = await copyToClipboard(text);
    if (success) {
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 text-primary">
          <Landmark className="size-4" />
        </span>
        <div>
          <h2 className="text-lg font-semibold text-foreground">
            Payment Instructions
          </h2>
          <p className="text-sm text-muted-foreground">
            Transfer the total amount to one of our accounts below.
          </p>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2">
        {STORE_BANK_ACCOUNTS.map((account, index) => (
          <div
            key={`${account.accountNumber}-${index}`}
            className="group relative overflow-hidden rounded-[2rem] border border-border/70 bg-card/95 p-6 shadow-[0_18px_55px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_22px_70px_rgba(0,0,0,0.08)]"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <p className="text-[10px] font-semibold tracking-[0.24em] uppercase text-muted-foreground">
                    {account.bankName}
                  </p>
                  <p className="text-xl font-bold tracking-tight text-foreground">
                    {account.accountName}
                  </p>
                </div>
                <div className="size-10 rounded-full bg-muted/30 p-2 text-muted-foreground/60">
                   <Landmark className="size-full" />
                </div>
              </div>

              <div className="rounded-2xl border border-border/60 bg-background/50 p-4">
                <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-muted-foreground">
                  Account Number
                </p>
                <div className="mt-2 flex items-center justify-between gap-4">
                  <p className="text-2xl font-mono font-semibold tracking-tighter text-foreground">
                    {account.accountNumber}
                  </p>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="size-10 shrink-0 rounded-full hover:bg-primary/10 hover:text-primary"
                    onClick={() => handleCopy(account.accountNumber, `acc-${index}`)}
                  >
                    {copiedId === `acc-${index}` ? (
                      <Check className="size-4 text-green-500" />
                    ) : (
                      <Copy className="size-4" />
                    )}
                  </Button>
                </div>
              </div>
            </div>
            
            {account.qrCodeUrl ? (
              <div className="mt-4 flex items-center gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4">
                <QrCode className="size-5 text-primary" />
                <p className="text-xs font-medium text-primary/80">
                  QR Code available below
                </p>
              </div>
            ) : null}
          </div>
        ))}
      </div>

      <div className="rounded-2xl border border-dashed border-border/80 bg-muted/20 p-5 text-center">
        <p className="text-sm leading-6 text-muted-foreground">
          After completing the transfer, please <strong>upload your payment slip</strong> in the form below
          to move your order into the review queue. We typically process verifications within 15-30 minutes during business hours.
        </p>
      </div>
    </section>
  );
}
