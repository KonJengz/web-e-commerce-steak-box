import type { Metadata } from "next";

import "@/styles/globals.css";
import { notoSans } from "@/styles/font";
import { cn } from "@/lib/utils";
import { Geist } from "next/font/google";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: {
    default: "Steak Box",
    template: "%s | Steak Box",
  },
  description: "Steak Box",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", notoSans.className, "font-sans", geist.variable)}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
