import type { Item } from "feed";
import { Feed } from "feed";
import { cacheLife, cacheTag } from "next/cache";
import type { Post } from "@/payload-types";
import { publishedPostsWhere } from "@/utilities/content-queries";
import { extractLexicalText } from "@/utilities/extract-lexical-text";
import { getCanonicalURL } from "@/utilities/getURL";
import { getPayloadClient } from "@/utilities/payload-client";

const FEED_POST_LIMIT = 50;

function createFeed(siteUrl: string, updated: Date, generator: string) {
  return new Feed({
    title: "Lyóvson.com - Writing, Projects & Research",
    description:
      "Latest posts and articles from Rafa and Jess Lyóvson covering programming, design, philosophy, and technology.",
    id: siteUrl,
    link: siteUrl,
    language: "en-US",
    image: `${siteUrl}/og-image.png`,
    favicon: `${siteUrl}/favicon.ico`,
    copyright: `All rights reserved ${updated.getFullYear()}, Lyóvson.com`,
    updated,
    generator,
    feedLinks: {
      rss2: `${siteUrl}/feed.xml`,
      json: `${siteUrl}/feed.json`,
      atom: `${siteUrl}/atom.xml`,
    },
    author: {
      name: "Rafa & Jess Lyóvson",
      email: "hello@lyovson.com",
      link: siteUrl,
    },
  });
}

function getFeedItem(
  post: Pick<
    Post,
    | "title"
    | "slug"
    | "description"
    | "content"
    | "populatedAuthors"
    | "project"
    | "publishedAt"
    | "updatedAt"
  >,
  siteUrl: string
): Item {
  const link = `${siteUrl}/posts/${post.slug}`;
  const primaryAuthor = post.populatedAuthors?.at(0);
  const projectSlug =
    post.project && typeof post.project === "object"
      ? post.project.slug || ""
      : "";
  const fullContent = post.content ? extractLexicalText(post.content) : "";
  const description =
    post.description || fullContent || "Read the full article on Lyóvson.com";

  return {
    title: post.title,
    id: link,
    link,
    description,
    content: fullContent || description,
    author: [
      {
        name: primaryAuthor?.name || "Lyóvson Team",
        email: "hello@lyovson.com",
        link: primaryAuthor?.username
          ? `${siteUrl}/${primaryAuthor.username}`
          : siteUrl,
      },
    ],
    date: new Date(post.publishedAt || post.updatedAt),
    category: [{ name: projectSlug, domain: `${siteUrl}/projects` }],
  };
}

function getTopicCategories(post: Pick<Post, "topics">, siteUrl: string) {
  return (post.topics || []).flatMap((topic) => {
    const name =
      topic && typeof topic === "object"
        ? topic.name || topic.slug || String(topic)
        : String(topic);

    return name ? [{ name, domain: `${siteUrl}/topics` }] : [];
  });
}

// Cache serialized output, since Feed instances cannot cross a use-cache boundary.
// All formats share this entry and the tags used by the content update hooks.
export async function getSyndicationFeeds() {
  "use cache";
  cacheTag("posts", "projects", "topics", "lyovsons");
  cacheLife("rss");

  const payload = await getPayloadClient();
  const posts = await payload.find({
    collection: "posts",
    where: publishedPostsWhere(),
    limit: FEED_POST_LIMIT,
    pagination: false,
    sort: "-publishedAt",
    depth: 2,
    select: {
      title: true,
      slug: true,
      publishedAt: true,
      updatedAt: true,
      description: true,
      authors: true,
      populatedAuthors: true,
      project: true,
      content: true,
      topics: true,
    },
  });

  const siteUrl = getCanonicalURL();
  const updated = new Date();
  const rss = createFeed(siteUrl, updated, "Next.js RSS for Lyóvson.com");
  const atom = createFeed(
    siteUrl,
    updated,
    "Next.js Atom Feed for Lyóvson.com"
  );
  const json = createFeed(
    siteUrl,
    updated,
    "Next.js JSON Feed for Lyóvson.com"
  );

  for (const post of posts.docs) {
    if (!post.slug) {
      continue;
    }

    const item = getFeedItem(post, siteUrl);
    rss.addItem({
      ...item,
      contributor: [
        { name: "Lyóvson.com", email: "hello@lyovson.com", link: siteUrl },
      ],
    });
    atom.addItem(item);
    json.addItem({
      ...item,
      category: [
        ...(item.category || []),
        ...getTopicCategories(post, siteUrl),
      ],
    });
  }

  return { rss: rss.rss2(), atom: atom.atom1(), json: json.json1() };
}
