import type { Metadata } from "next";

import "@/styles/globals.css";
import { inter } from "@/styles/font";
import { cn } from "@/lib/utils";
import { metadataBase, siteDescription, siteName } from "@/lib/metadata";

import { ThemeProvider } from "@/components/providers/theme-provider";
import { WebVitals } from "@/components/providers/web-vitals";
import { JsonLd } from "@/components/shared/json-ld";
import { buildAbsoluteSiteUrl } from "@/lib/metadata";

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
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "Organization",
            name: siteName,
            url: buildAbsoluteSiteUrl("/"),
            logo: buildAbsoluteSiteUrl("/icon.png"), // Assuming icon.png is the logo
            contactPoint: {
              "@type": "ContactPoint",
              telephone: "+66-2-xxx-xxxx", // Placeholder
              contactType: "customer service",
            },
          }}
        />
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: siteName,
            url: buildAbsoluteSiteUrl("/"),
            potentialAction: {
              "@type": "SearchAction",
              target: {
                "@type": "EntryPoint",
                urlTemplate: `${buildAbsoluteSiteUrl("/")}?search={search_term_string}`,
              },
              "query-input": "required name=search_term_string",
            },
          }}
        />
        <WebVitals />
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
