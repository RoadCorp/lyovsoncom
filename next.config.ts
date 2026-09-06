import { withPayload } from "@payloadcms/next/withPayload";
import type { NextConfig } from "next";
import redirects from "./redirects.js";
import { getRuntimeSiteOrigin } from "./src/utilities/site-config";

// Webpack optimization regexes
const TAILWIND_REGEX = /[\\/]node_modules[\\/]tailwindcss[\\/]/;

// Image quality presets for Next.js Image Optimization
const IMAGE_QUALITIES: number[] = [25, 50, 75, 80, 90, 100];
const IMAGE_SIZES: number[] = [
  16, 32, 48, 64, 96, 128, 256, 384, 400, 800, 1200,
];

const NEXT_PUBLIC_SERVER_URL = getRuntimeSiteOrigin();
const VERCEL_BLOB_STORE_ID = process.env.BLOB_READ_WRITE_TOKEN?.match(
  /^vercel_blob_rw_([a-z\d]+)_[a-z\d]+$/i
)?.[1]?.toLowerCase();
const VERCEL_BLOB_HOST = VERCEL_BLOB_STORE_ID
  ? `${VERCEL_BLOB_STORE_ID}.public.blob.vercel-storage.com`
  : null;
const VERCEL_BLOB_CSP_SOURCE = VERCEL_BLOB_HOST
  ? `https://${VERCEL_BLOB_HOST}`
  : null;

const IS_VERCEL_DEPLOYMENT =
  process.env.VERCEL === "1" ||
  Boolean(process.env.VERCEL_ENV) ||
  Boolean(process.env.VERCEL_URL);

const nextConfig: NextConfig = {
  cacheComponents: true,
  typedRoutes: true,
  images: {
    remotePatterns: [
      ...[NEXT_PUBLIC_SERVER_URL].map((item) => {
        const url = new URL(item);

        return {
          hostname: url.hostname,
          protocol: url.protocol.replace(":", "") as "https" | "http",
        };
      }),
      {
        hostname: "img.youtube.com",
        protocol: "https",
      },
      {
        hostname: "dev.lyovson.com",
        protocol: "https",
      },
      {
        hostname: "localhost",
        protocol: "http",
      },
      ...(VERCEL_BLOB_HOST
        ? [
            {
              hostname: VERCEL_BLOB_HOST,
              protocol: "https" as const,
            },
          ]
        : []),
    ],
    // Add quality configuration to fix Next.js 16 warnings
    qualities: IMAGE_QUALITIES,
    // Optimize image sizes for 400px grid system
    // Includes 400px (1x), 800px (2x retina), 1200px (3x high-DPI)
    // This ensures Next.js serves appropriately-sized images for our grid cards
    // instead of defaulting to 640px (smallest deviceSize)
    imageSizes: IMAGE_SIZES,
    // Next.js 16 default: 4 hours (14_400 seconds) - reduces CPU usage and costs
    minimumCacheTTL: 14_400,
  },
  reactStrictMode: true,
  redirects,
  async headers() {
    const contentSecurityPolicy = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' *.google-analytics.com *.googletagmanager.com *.vercel-scripts.com",
      "style-src 'self' 'unsafe-inline' fonts.googleapis.com",
      "font-src 'self' fonts.gstatic.com data:",
      [
        "img-src 'self' data: blob: *.vercel-insights.com *.google-analytics.com *.googletagmanager.com pbs.twimg.com abs.twimg.com *.twimg.com media.tenor.com",
        VERCEL_BLOB_CSP_SOURCE,
      ]
        .filter(Boolean)
        .join(" "),
      [
        "media-src 'self' blob: video.twimg.com media.tenor.com",
        VERCEL_BLOB_CSP_SOURCE,
      ]
        .filter(Boolean)
        .join(" "),
      "connect-src 'self' *.vercel-insights.com *.google-analytics.com *.googletagmanager.com cdn.syndication.twimg.com vitals.vercel-insights.com",
      "frame-src 'self' www.youtube.com youtube.com",
      "worker-src 'self' blob:",
      "child-src 'self' blob:",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'self'",
      ...(IS_VERCEL_DEPLOYMENT ? ["upgrade-insecure-requests"] : []),
    ].join("; ");

    const commonHeaders = [
      {
        key: "Content-Security-Policy",
        value: contentSecurityPolicy,
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      ...(IS_VERCEL_DEPLOYMENT
        ? [
            {
              key: "Strict-Transport-Security",
              value: "max-age=31536000; includeSubDomains",
            },
          ]
        : []),
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin-allow-popups",
      },
      {
        key: "Referrer-Policy",
        value: "origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];

    return await Promise.resolve([
      {
        source: "/api/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow",
          },
        ],
      },
      {
        source: "/admin/:path*",
        headers: [
          {
            key: "X-Robots-Tag",
            value: "noindex, nofollow, noarchive",
          },
        ],
      },
      {
        source: "/:path*",
        headers: commonHeaders,
      },
    ]);
  },
  reactCompiler: true,
  cacheLife: {
    static: {
      stale: 86_400, // 24 hours stale - rarely-changing taxonomy data
      revalidate: 172_800, // 48 hours revalidate
      expire: 604_800, // 7 days max
    },
    homepage: {
      stale: 3600, // 1 hour stale - event-driven revalidation makes longer safe
      revalidate: 7200, // 2 hours revalidate
      expire: 86_400, // 24 hours max
    },
    feed: {
      stale: 3600, // 1 hour stale - mixed content feeds track post/note/activity cadence
      revalidate: 7200, // 2 hours revalidate
      expire: 86_400, // 24 hours max
    },
    posts: {
      stale: 3600, // 1 hour stale - event-driven revalidation makes longer safe
      revalidate: 7200, // 2 hours revalidate
      expire: 86_400, // 24 hours max
    },
    notes: {
      stale: 3600, // 1 hour stale - event-driven revalidation makes longer safe
      revalidate: 7200, // 2 hours revalidate
      expire: 86_400, // 24 hours max
    },
    activities: {
      stale: 3600, // 1 hour stale - event-driven revalidation makes longer safe
      revalidate: 7200, // 2 hours revalidate
      expire: 86_400, // 24 hours max
    },
    "grid-cards": {
      stale: 3600, // 1 hour stale - event-driven revalidation makes longer safe
      revalidate: 7200, // 2 hours revalidate
      expire: 86_400, // 24 hours max
    },
    "user-session": {
      stale: 60, // 1 minute stale
      revalidate: 300, // 5 minutes revalidate
      expire: 1800, // 30 minutes max
    },
    projects: {
      stale: 14_400, // 4 hours stale
      revalidate: 28_800, // 8 hours revalidate
      expire: 86_400, // 24 hours max
    },
    topics: {
      stale: 7200, // 2 hours stale
      revalidate: 14_400, // 4 hours revalidate
      expire: 86_400, // 24 hours max
    },
    authors: {
      stale: 7200, // 2 hours stale
      revalidate: 14_400, // 4 hours revalidate
      expire: 86_400, // 24 hours max
    },
    sitemap: {
      stale: 14_400, // 4 hours stale
      revalidate: 28_800, // 8 hours revalidate
      expire: 172_800, // 48 hours max
    },
    search: {
      stale: 1800, // 30 minutes stale
      revalidate: 3600, // 1 hour revalidate
      expire: 7200, // 2 hours max
    },
    rss: {
      stale: 14_400, // 4 hours stale
      revalidate: 28_800, // 8 hours revalidate
      expire: 172_800, // 48 hours max
    },
    redirects: {
      stale: 14_400, // 4 hours stale
      revalidate: 28_800, // 8 hours revalidate
      expire: 172_800, // 48 hours max
    },
  },
  logging: {
    browserToTerminal: true,
  },
  experimental: {
    exposeTestingApiInProductionBuild: process.env.NEXT_TEST_MODE === "1",
    appNewScrollHandler: true,
    cachedNavigations: true,
    // Needed when using multiple root layouts so unmatched routes don't fall back
    // to the default framework 404 metadata pipeline.
    globalNotFound: true,

    // Enable Turbopack file system caching for faster builds (stores compiler artifacts between runs)
    turbopackFileSystemCacheForDev: true,
  },
  turbopack: {
    resolveExtensions: [".ts", ".tsx", ".js", ".jsx", ".mjs", ".cjs", ".json"],
  },
  // Fallback for builds using --webpack.
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks.cacheGroups = {
        ...config.optimization.splitChunks.cacheGroups,
        tailwind: {
          test: TAILWIND_REGEX,
          name: "tailwind",
          chunks: "all",
          priority: 30,
        },
      };
    }
    return config;
  },
};

export default withPayload(nextConfig);
