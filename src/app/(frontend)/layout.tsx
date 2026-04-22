import { Analytics } from "@vercel/analytics/next";
import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import { draftMode } from "next/headers";
import Script from "next/script";
import type React from "react";
import { Suspense } from "react";
import { Grid, GridCardNav, SkeletonCard } from "@/components/grid";
import { JsonLd } from "@/components/JsonLd";
import { Toaster } from "@/components/ui/sonner";
import { cn } from "@/lib/utils";
import { Providers } from "@/providers";
import { browserTheme } from "@/utilities/browserTheme";
import { getSiteEntitySchemas } from "@/utilities/generate-json-ld";
import { getCanonicalURL } from "@/utilities/getURL";
import { LEGACY_BROWSER_CLEANUP_SCRIPT } from "@/utilities/legacy-browser-cleanup";
import { mergeOpenGraph } from "@/utilities/mergeOpenGraph";
import { siteConfig } from "@/utilities/site-config";
import "./globals.css";

const fontMono = localFont({
  src: [
    {
      path: "./fonts/ibm-plex-mono-400-latin.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/ibm-plex-mono-500-latin.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/ibm-plex-mono-600-latin.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-mono",
  display: "swap",
  fallback: [
    "ui-monospace",
    "SFMono-Regular",
    "Monaco",
    "Consolas",
    "Liberation Mono",
    "Courier New",
    "monospace",
  ],
  preload: true,
});

const fontSerif = localFont({
  src: [
    {
      path: "./fonts/ibm-plex-serif-400-latin.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/ibm-plex-serif-500-latin.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/ibm-plex-serif-600-latin.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-serif",
  display: "swap",
  fallback: [
    "ui-serif",
    "Georgia",
    "Cambria",
    "Times New Roman",
    "Times",
    "serif",
  ],
  preload: true,
});

const fontSans = localFont({
  src: [
    {
      path: "./fonts/ibm-plex-sans-400-latin.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./fonts/ibm-plex-sans-500-latin.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./fonts/ibm-plex-sans-600-latin.woff2",
      weight: "600",
      style: "normal",
    },
  ],
  variable: "--font-sans",
  display: "swap",
  fallback: [
    "ui-sans-serif",
    "system-ui",
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Roboto",
    "Helvetica Neue",
    "Arial",
    "sans-serif",
  ],
  preload: true,
});

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Draft mode check - enables preview functionality
  await draftMode();

  return (
    <html
      className={cn(fontMono.variable, fontSerif.variable, fontSans.variable)}
      lang="en"
      suppressHydrationWarning
    >
      <head>
        {/* Icon and manifest links are now managed by the metadata object below */}
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Controlled inline recovery script for legacy localhost service-worker/cache state
          dangerouslySetInnerHTML={{
            __html: LEGACY_BROWSER_CLEANUP_SCRIPT,
          }}
        />
        {/* Performance hints */}
        <link href="//vercel.live" rel="dns-prefetch" />
        <link href="//vitals.vercel-insights.com" rel="dns-prefetch" />
      </head>
      <body>
        <JsonLd data={getSiteEntitySchemas()} />
        <Providers>
          <Grid>
            <Suspense fallback={<SkeletonCard />}>
              <GridCardNav />
            </Suspense>

            {children}
          </Grid>
          <Toaster />
        </Providers>
        <Analytics />
      </body>
      <Script
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Required for GA initialization
        dangerouslySetInnerHTML={{
          __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-R4R3XJRY28');
          `,
        }}
        id="google-analytics-init"
        strategy="lazyOnload"
      />
      <Script
        id="google-analytics-script"
        src="https://www.googletagmanager.com/gtag/js?id=G-R4R3XJRY28"
        strategy="lazyOnload"
      />
    </html>
  );
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: browserTheme.light },
    { media: "(prefers-color-scheme: dark)", color: browserTheme.dark },
  ],
};

export const metadata: Metadata = {
  metadataBase: new URL(getCanonicalURL()),
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.defaultDescription,
  applicationName: siteConfig.name,
  authors: [
    { name: "Rafa Lyóvson", url: getCanonicalURL("/rafa") },
    { name: "Jess Lyóvson", url: getCanonicalURL("/jess") },
  ],
  generator: "Next.js",
  keywords: [
    "programming",
    "writing",
    "design",
    "philosophy",
    "research",
    "projects",
  ],
  referrer: "origin-when-cross-origin",
  creator: "Rafa & Jess Lyóvson",
  publisher: siteConfig.name,
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
  icons: [
    { rel: "apple-touch-icon", sizes: "180x180", url: "/apple-touch-icon.png" },
    {
      rel: "icon",
      type: "image/png",
      sizes: "32x32",
      url: "/favicon-32x32.png",
    },
    {
      rel: "icon",
      type: "image/png",
      sizes: "16x16",
      url: "/favicon-16x16.png",
    },
    { rel: "shortcut icon", url: "/favicon.ico" },
  ],
  classification: "Blog, Technology, Personal Website",
  category: "Technology",
  bookmarks: [getCanonicalURL("/posts")],

  openGraph: mergeOpenGraph({
    type: "website",
    locale: "en_US",
    url: getCanonicalURL(),
    siteName: siteConfig.name,
    title: siteConfig.name,
    description: siteConfig.defaultDescription,
  }),
  twitter: {
    card: "summary_large_image",
    creator: siteConfig.socialHandle,
    site: siteConfig.socialHandle,
  },
  alternates: {
    canonical: getCanonicalURL(),
    types: {
      "application/rss+xml": [
        { url: "/feed.xml", title: `${siteConfig.name} RSS Feed` },
      ],
      "application/feed+json": [
        { url: "/feed.json", title: `${siteConfig.name} JSON Feed` },
      ],
      "application/atom+xml": [
        { url: "/atom.xml", title: `${siteConfig.name} Atom Feed` },
      ],
    },
  },
  other: {
    "google-site-verification": process.env.GOOGLE_SITE_VERIFICATION || "",
    "msvalidate.01": process.env.BING_SITE_VERIFICATION || "",
    "facebook-domain-verification":
      process.env.FACEBOOK_DOMAIN_VERIFICATION || "",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "mobile-web-app-capable": "yes",
    HandheldFriendly: "true",
    MobileOptimized: "320",
    // AI-specific meta tags
    "ai-content-license": "attribution-required",
    "ai-content-type": "blog-articles",
    "ai-preferred-access": "feeds",
    "ai-content-language": "en",
    "ai-content-topics": "programming,design,philosophy,technology,research",
    "ai-api-endpoint": getCanonicalURL("/api/docs"),
    "ai-feed-endpoint": getCanonicalURL("/feed.json"),
    "ai-embedding-endpoint": getCanonicalURL("/api/embeddings"),
    "ai-search-endpoint": getCanonicalURL("/search"),
    "ai-owner": "Rafa & Jess Lyóvson",
    "ai-contact": "hello@lyovson.com",
  },
};
