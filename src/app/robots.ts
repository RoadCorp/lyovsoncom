import type { MetadataRoute } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { getCanonicalURL } from "@/utilities/getURL";

/* biome-ignore lint/suspicious/useAwait: async required by "use cache" directive */
export default async function robots(): Promise<MetadataRoute.Robots> {
  "use cache";
  cacheTag("robots");
  cacheLife("static"); // Robots.txt changes very rarely

  const SITE_URL = getCanonicalURL();
  const HOSTNAME = new URL(SITE_URL).host;
  const sharedDisallowRules = [
    "/api/*",
    "/api/media/*",
    "/admin/*",
    "/ai-docs",
    "/.well-known/ai-resources",
    "/playground",
    "/search?*",
    "/rafa/search?*",
    "/jess/search?*",
    "/vercel-blob-client-upload-route",
    "/private/*",
    "/temp/*",
    "/drafts/*",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: sharedDisallowRules,
      },
      {
        userAgent: "Googlebot",
        allow: "/",
        disallow: sharedDisallowRules,
        crawlDelay: 1,
      },
      {
        userAgent: "Bingbot",
        allow: "/",
        disallow: sharedDisallowRules,
        crawlDelay: 1,
      },
      // AI and research bots may use cached discovery/feed surfaces only.
      {
        userAgent: [
          "GPTBot",
          "OAI-SearchBot",
          "Google-Extended",
          "CCBot",
          "ChatGPT-User",
          "FacebookBot",
          "Claude-Web",
          "ClaudeBot",
          "meta-externalagent",
          "PerplexityBot",
          "YouBot",
          "Bytespider",
          "Applebot-Extended",
        ],
        allow: [
          "/feed.xml",
          "/feed.json",
          "/atom.xml",
          "/llms.txt",
          "/robots.txt",
          "/sitemap.xml",
        ],
        disallow: ["/", ...sharedDisallowRules],
      },
      // Social media crawlers
      {
        userAgent: ["facebookexternalhit", "Twitterbot", "LinkedInBot"],
        allow: "/",
        disallow: sharedDisallowRules,
        crawlDelay: 2,
      },
      // Research and academic crawlers
      {
        userAgent: ["archive.org_bot", "ia_archiver", "Wayback"],
        allow: "/",
        crawlDelay: 10,
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: HOSTNAME,
  };
}
