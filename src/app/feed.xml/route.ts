import configPromise from "@payload-config";
import { Feed } from "feed";
import type { NextRequest } from "next/server";
import { getPayload } from "payload";
import type { Project } from "@/payload-types";
import { extractLexicalText } from "@/utilities/extract-lexical-text";
import { getCanonicalURL } from "@/utilities/getURL";

// Note: Removed force-dynamic to allow Next.js ISR caching
// With weekly publishing, feeds are regenerated only when content changes via revalidateTag()
// This prevents RSS readers from waking the database on every poll

export async function GET(_request: NextRequest) {
  const SITE_URL = getCanonicalURL();

  try {
    const payload = await getPayload({ config: configPromise });

    const posts = await payload.find({
      collection: "posts",
      where: {
        _status: { equals: "published" },
      },
      limit: 50, // Latest 50 posts
      sort: "-publishedAt",
      depth: 2,
      select: {
        title: true,
        slug: true,
        publishedAt: true,
        updatedAt: true,
        description: true,
        populatedAuthors: true,
        project: true,
        content: true,
      },
    });

    // Create feed instance with site information
    const feed = new Feed({
      title: "Lyóvson.com - Writing, Projects & Research",
      description:
        "Latest posts and articles from Rafa and Jess Lyóvson covering programming, design, philosophy, and technology.",
      id: SITE_URL,
      link: SITE_URL,
      language: "en-US",
      image: `${SITE_URL}/og-image.png`,
      favicon: `${SITE_URL}/favicon.ico`,
      copyright: `All rights reserved ${new Date().getFullYear()}, Lyóvson.com`,
      updated: new Date(),
      generator: "Next.js RSS for Lyóvson.com",
      feedLinks: {
        rss2: `${SITE_URL}/feed.xml`,
        json: `${SITE_URL}/feed.json`,
        atom: `${SITE_URL}/atom.xml`,
      },
      author: {
        name: "Rafa & Jess Lyóvson",
        email: "hello@lyovson.com",
        link: SITE_URL,
      },
    });

    // Add posts to feed
    for (const post of posts.docs) {
      if (!post.slug) {
        continue;
      }

      const title = post.title;
      const description = post.description || "";
      const link = `${SITE_URL}/posts/${post.slug}`;
      const projectSlug =
        typeof post.project === "object" && post.project !== null
          ? (post.project as Project).slug || ""
          : "";
      const primaryAuthor = post.populatedAuthors?.[0];
      const authorName = primaryAuthor?.name || "Lyóvson Team";
      const authorUrl = primaryAuthor?.username
        ? `${SITE_URL}/${primaryAuthor.username}`
        : SITE_URL;

      // Extract full content from Lexical format for AI consumption
      const fullContent = post.content ? extractLexicalText(post.content) : "";

      // Use description as summary, full content as main content
      let contentText = description || fullContent;
      if (!contentText) {
        contentText = "Read the full article on Lyóvson.com";
      }

      feed.addItem({
        title,
        id: link,
        link,
        description: contentText,
        content: fullContent || contentText,
        author: [
          {
            name: authorName,
            email: "hello@lyovson.com",
            link: authorUrl,
          },
        ],
        contributor: [
          {
            name: "Lyóvson.com",
            email: "hello@lyovson.com",
            link: SITE_URL,
          },
        ],
        date: new Date(post.publishedAt || post.updatedAt),
        category: [
          {
            name: projectSlug,
            domain: `${SITE_URL}/projects`,
          },
        ],
      });
    }

    return new Response(feed.rss2(), {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=21600, s-maxage=43200", // Cache for 6-12 hours (weekly publishing pattern)
      },
    });
  } catch (_error) {
    // Fallback RSS feed
    const fallbackRss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>Lyóvson.com</title>
    <link>${SITE_URL}</link>
    <description>Writing, Projects & Research by Rafa and Jess Lyóvson</description>
    <language>en-US</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <generator>Next.js RSS for Lyóvson.com</generator>
    <item>
      <title>RSS Feed Temporarily Unavailable</title>
      <link>${SITE_URL}</link>
      <description>The RSS feed is temporarily unavailable. Please visit the website directly.</description>
      <pubDate>${new Date().toUTCString()}</pubDate>
      <guid isPermaLink="false">${SITE_URL}/rss-error-${Date.now()}</guid>
    </item>
  </channel>
</rss>`;

    return new Response(fallbackRss, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "no-cache", // Don't cache error responses
      },
    });
  }
}
