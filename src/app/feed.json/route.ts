import configPromise from "@payload-config";
import { Feed } from "feed";
import type { NextRequest } from "next/server";
import { getPayload } from "payload";
import type { Project, Topic } from "@/payload-types";
import { extractLexicalText } from "@/utilities/extract-lexical-text";
import { getCanonicalURL } from "@/utilities/getURL";

// Note: Removed force-dynamic to allow Next.js ISR caching
// With weekly publishing, feeds are regenerated only when content changes via revalidateTag()
// This prevents JSON feed readers from waking the database on every poll

const WORDS_PER_MINUTE = 200;

/* biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Feed generation includes multiple formatting, metadata, and fallback branches */
export async function GET(_request: NextRequest) {
  const SITE_URL = getCanonicalURL();

  try {
    const payload = await getPayload({ config: configPromise });

    const posts = await payload.find({
      collection: "posts",
      where: {
        _status: { equals: "published" },
      },
      limit: 50,
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
        topics: true,
      },
    });

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
      generator: "Next.js JSON Feed for Lyóvson.com",
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

    // Add posts to feed (same logic as RSS)
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

      let contentText = description || fullContent;
      if (!contentText) {
        contentText = "Read the full article on Lyóvson.com";
      }

      // Enhanced feed item with AI-friendly metadata
      const feedItem = {
        title,
        id: link,
        link,
        description: contentText,
        content: fullContent || contentText, // Full content for AI consumption
        author: [
          {
            name: authorName,
            email: "hello@lyovson.com",
            link: authorUrl,
          },
        ],
        date: new Date(post.publishedAt || post.updatedAt),
        category: [
          {
            name: projectSlug,
            domain: `${SITE_URL}/projects`,
          },
        ],
      };

      // Add topics as additional categories for AI understanding
      if (post.topics && Array.isArray(post.topics)) {
        for (const topic of post.topics) {
          const topicObj =
            typeof topic === "object" && topic !== null
              ? (topic as Topic)
              : null;
          const topicName = topicObj?.name || topicObj?.slug || String(topic);
          if (topicName) {
            feedItem.category.push({
              name: topicName,
              domain: `${SITE_URL}/topics`,
            });
          }
        }
      }

      // Add custom metadata for AI systems
      const fullContentWordCount = fullContent
        ? Math.ceil(fullContent.split(" ").length)
        : undefined;

      const customMetadata = {
        wordCount: fullContentWordCount,
        readingTime: fullContentWordCount
          ? Math.ceil(fullContentWordCount / WORDS_PER_MINUTE)
          : undefined,
        contentType: "article",
        language: "en",
        projectSlug,
        originalUrl: link,
        apiUrl: `${SITE_URL}/api/posts/${post.id}`,
      };

      // Add metadata as extensions (JSON Feed 1.1 supports extensions)
      Object.assign(feedItem, { _lyovson_metadata: customMetadata });

      feed.addItem(feedItem);
    }

    return new Response(feed.json1(), {
      status: 200,
      headers: {
        "Content-Type": "application/feed+json; charset=utf-8",
        "Cache-Control": "public, max-age=21600, s-maxage=43200", // Cache for 6-12 hours (weekly publishing pattern)
      },
    });
  } catch (_error) {
    const fallbackJson = {
      version: "https://jsonfeed.org/version/1.1",
      title: "Lyóvson.com",
      home_page_url: SITE_URL,
      feed_url: `${SITE_URL}/feed.json`,
      description: "Writing, Projects & Research by Rafa and Jess Lyóvson",
      authors: [
        {
          name: "Rafa & Jess Lyóvson",
          url: SITE_URL,
        },
      ],
      items: [
        {
          id: `${SITE_URL}/feed-error-${Date.now()}`,
          url: SITE_URL,
          title: "Feed Temporarily Unavailable",
          content_text:
            "The JSON feed is temporarily unavailable. Please visit the website directly.",
          date_published: new Date().toISOString(),
        },
      ],
    };

    return new Response(JSON.stringify(fallbackJson, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/feed+json; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }
}
