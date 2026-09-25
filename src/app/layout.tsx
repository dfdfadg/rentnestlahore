import type { Metadata, Viewport } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { SessionProvider } from "@/components/SessionProvider";
import { Analytics } from "@/components/Analytics";
import { JsonLd } from "@/components/JsonLd";
import { SITE_DESCRIPTION, SITE_NAME, SITE_URL } from "@/lib/site";
import { organizationJsonLd, websiteJsonLd } from "@/lib/seo";

const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const heading = Plus_Jakarta_Sans({ subsets: ["latin"], variable: "--font-heading", display: "swap", weight: ["600", "700", "800"] });

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: `Properties for Rent in Lahore | ${SITE_NAME}`, template: `%s` },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  formatDetection: { telephone: false },
  verification: process.env.NEXT_PUBLIC_GSC_VERIFICATION ? { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION } : undefined,
};

export const viewport: Viewport = {
  themeColor: "#0f1d31",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en-PK" className={`${body.variable} ${heading.variable}`}>
      <body className="flex min-h-dvh flex-col">
        <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-white focus:px-4 focus:py-2">
          Skip to content
        </a>
        <SessionProvider>
          <Header />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer />
        </SessionProvider>
        <JsonLd data={[organizationJsonLd(), websiteJsonLd()]} />
        <Analytics />
      </body>
    </html>
  );
}
