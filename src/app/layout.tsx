import type { Metadata } from "next";

import "@/styles/globals.css";
import { notoSans } from "@/styles/font";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: {
    default: "Steak Box",
    template: "%s | Steak Box",
  },
  description: "Steak Box",
};

import { ThemeProvider } from "@/components/providers/theme-provider";
import { Header } from "@/components/layout/header";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", notoSans.className, "font-sans")}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <Header />
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
