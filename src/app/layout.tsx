import type { Metadata } from "next";

import "@/styles/globals.css";
import { inter } from "@/styles/font";
import { cn } from "@/lib/utils";
import { metadataBase, siteDescription, siteName } from "@/lib/metadata";

import { ThemeProvider } from "@/components/providers/theme-provider";

export const metadata: Metadata = {
  applicationName: siteName,
  alternates: {
    canonical: "/",
  },
  description: siteDescription,
  keywords: [
    "steak",
    "premium meat",
    "e-commerce",
    "cold chain delivery",
    "beef cuts",
  ],
  metadataBase,
  openGraph: {
    description: siteDescription,
    siteName,
    title: siteName,
    type: "website",
    url: "/",
  },
  title: {
    default: siteName,
    template: `%s | ${siteName}`,
  },
  twitter: {
    card: "summary_large_image",
    description: siteDescription,
    title: siteName,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={cn("h-full", "antialiased", inter.variable, "font-sans")}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
        >
          <main className="flex-1">{children}</main>
        </ThemeProvider>
      </body>
    </html>
  );
}
