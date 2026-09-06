import { cacheLife, cacheTag } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET as getAtomFeed } from "@/app/atom.xml/route";
import { GET as getJsonFeed } from "@/app/feed.json/route";
import { GET as getRssFeed } from "@/app/feed.xml/route";
import type { Post } from "@/payload-types";
import { getSyndicationFeeds } from "./syndication-feed";

const { find } = vi.hoisted(() => ({ find: vi.fn() }));

vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
vi.mock("@/utilities/payload-client", () => ({
  getPayloadClient: () => Promise.resolve({ find }),
}));
vi.mock("@/utilities/getURL", () => ({
  getCanonicalURL: () => "https://www.lyovson.com",
}));

const publishedAt = "2026-09-01T10:00:00.000Z";
const post: Post = {
  id: 1,
  title: "A book & its ideas",
  slug: "a-book",
  description: "A short summary",
  type: "article",
  publishedAt,
  createdAt: publishedAt,
  updatedAt: publishedAt,
  populatedAuthors: [{ id: "1", name: "Rafa Lyóvson", username: "rafa" }],
  project: {
    id: 1,
    name: "Reading",
    slug: "reading",
    createdAt: publishedAt,
    updatedAt: publishedAt,
  },
  topics: [
    {
      id: 1,
      name: "Books",
      slug: "books",
      createdAt: publishedAt,
      updatedAt: publishedAt,
    },
  ],
  content: {
    root: {
      type: "root",
      version: 1,
      direction: "ltr",
      format: "",
      indent: 0,
      children: [{ type: "text", version: 1, text: "The complete article." }],
    },
  },
};

beforeEach(() => {
  vi.clearAllMocks();
  find.mockResolvedValue({ docs: [post, { ...post, id: 2, slug: null }] });
});

describe("syndication feeds", () => {
  it("builds matching full-text feeds with one bounded published-post query", async () => {
    const feeds = await getSyndicationFeeds();
    const json = JSON.parse(feeds.json);

    expect(find).toHaveBeenCalledTimes(1);
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "posts",
        limit: 50,
        pagination: false,
        where: { _status: { equals: "published" } },
        select: expect.objectContaining({ authors: true, content: true }),
      })
    );
    expect(cacheTag).toHaveBeenCalledWith(
      "posts",
      "projects",
      "topics",
      "lyovsons"
    );
    expect(cacheLife).toHaveBeenCalledWith("rss");
    expect(json.items).toHaveLength(1);
    expect(json.items.at(0)).toMatchObject({
      id: "https://www.lyovson.com/posts/a-book",
      title: post.title,
      summary: post.description,
      content_html: "The complete article.",
      date_modified: publishedAt,
      author: { name: "Rafa Lyóvson", url: "https://www.lyovson.com/rafa" },
      tags: ["reading", "Books"],
    });

    for (const xml of [feeds.rss, feeds.atom]) {
      expect(xml).toContain("https://www.lyovson.com/posts/a-book");
      expect(xml).toContain("The complete article.");
      expect(xml).toContain("Rafa Lyóvson");
      expect(xml).not.toContain("/posts/null");
    }
    expect(feeds.rss).toContain("Next.js RSS for Lyóvson.com");
    expect(feeds.atom).toContain("Next.js Atom Feed for Lyóvson.com");
  });

  it("keeps content and author fallbacks for posts without optional metadata", async () => {
    find.mockResolvedValue({
      docs: [
        {
          ...post,
          description: null,
          populatedAuthors: null,
          project: null,
          topics: null,
        },
      ],
    });

    const feeds = await getSyndicationFeeds();
    expect(JSON.parse(feeds.json).items.at(0)).toMatchObject({
      summary: "The complete article.",
      author: { name: "Lyóvson Team", url: "https://www.lyovson.com" },
      tags: [],
    });
  });

  it("returns valid empty feeds when there are no published posts", async () => {
    find.mockResolvedValue({ docs: [] });

    const feeds = await getSyndicationFeeds();
    expect(JSON.parse(feeds.json).items).toEqual([]);
    expect(feeds.rss).toContain("<channel>");
    expect(feeds.atom).toContain('<feed xmlns="http://www.w3.org/2005/Atom">');
  });
});

describe("feed responses", () => {
  it.each([
    ["RSS", getRssFeed, "application/rss+xml; charset=utf-8"],
    ["Atom", getAtomFeed, "application/atom+xml; charset=utf-8"],
    ["JSON", getJsonFeed, "application/feed+json; charset=utf-8"],
  ] as const)(
    "preserves %s response headers",
    async (_format, getFeed, contentType) => {
      const response = await getFeed();

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toBe(contentType);
      expect(response.headers.get("Cache-Control")).toBe(
        "public, max-age=21600, s-maxage=43200"
      );
      expect(response.headers.get("Vercel-CDN-Cache-Control")).toBe(
        "max-age=43200"
      );
      expect(await response.text()).toContain("The complete article.");
    }
  );

  it.each([
    ["RSS", getRssFeed],
    ["Atom", getAtomFeed],
    ["JSON", getJsonFeed],
  ] as const)(
    "keeps %s failure responses uncached",
    async (_format, getFeed) => {
      find.mockRejectedValue(new Error("Database unavailable"));

      const response = await getFeed();
      expect(response.status).toBe(200);
      expect(response.headers.get("Cache-Control")).toBe("no-cache");
      expect(response.headers.has("Vercel-CDN-Cache-Control")).toBe(false);
      expect(await response.text()).toContain("Feed Temporarily Unavailable");
    }
  );
});
