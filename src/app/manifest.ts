import type { MetadataRoute } from "next";
import { browserTheme } from "@/utilities/browserTheme";
import { getCanonicalURL } from "@/utilities/getURL";

export default function manifest(): MetadataRoute.Manifest {
  const siteUrl = getCanonicalURL();

  return {
    name: "Lyóvson.com - Writing, Projects & Research",
    short_name: "Lyóvson",
    description:
      "Official website of Rafa and Jess Lyóvson featuring writing, projects, and research on programming, design, philosophy, and technology.",
    start_url: "/",
    display: "standalone",
    background_color: browserTheme.manifest,
    theme_color: browserTheme.manifest,
    orientation: "portrait-primary",
    scope: "/",
    lang: "en-US",
    categories: [
      "blog",
      "education",
      "technology",
      "lifestyle",
      "productivity",
    ],
    icons: [
      {
        src: "/favicon-16x16.png",
        sizes: "16x16",
        type: "image/png",
      },
      {
        src: "/favicon-32x32.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/apple-touch-icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "any",
      },
    ],
    screenshots: [
      {
        src: `${siteUrl}/og-image.png`,
        sizes: "1200x630",
        type: "image/png",
        form_factor: "wide",
        label: "Homepage of Lyóvson.com",
      },
      {
        src: `${siteUrl}/og-image.png`,
        sizes: "1200x630",
        type: "image/png",
        form_factor: "narrow",
        label: "Lyóvson.com mobile view",
      },
    ],
    shortcuts: [
      {
        name: "Latest Posts",
        short_name: "Posts",
        description: "View the latest blog posts and articles",
        url: "/posts",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Projects",
        short_name: "Projects",
        description: "Browse all projects and research",
        url: "/projects",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Rafa's Posts",
        short_name: "Rafa",
        description: "Posts and articles by Rafa Lyóvson",
        url: "/rafa",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
      {
        name: "Jess's Posts",
        short_name: "Jess",
        description: "Posts and articles by Jess Lyóvson",
        url: "/jess",
        icons: [
          {
            src: "/android-chrome-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
        ],
      },
    ],
    related_applications: [],
    prefer_related_applications: false,
    dir: "ltr",
    display_override: ["window-controls-overlay", "standalone", "minimal-ui"],
    launch_handler: {
      client_mode: "navigate-existing",
    },
    protocol_handlers: [
      {
        protocol: "web+lyovson",
        url: "/search?q=%s",
      },
    ],
  };
}
