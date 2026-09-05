import { getCanonicalURL } from "@/utilities/getURL";
import { getSyndicationFeeds } from "@/utilities/syndication-feed";

export async function GET() {
  const SITE_URL = getCanonicalURL();

  try {
    const feeds = await getSyndicationFeeds();

    return new Response(feeds.rss, {
      status: 200,
      headers: {
        "Content-Type": "application/rss+xml; charset=utf-8",
        "Cache-Control": "public, max-age=21600, s-maxage=43200", // Cache for 6-12 hours (weekly publishing pattern)
        "Vercel-CDN-Cache-Control": "max-age=43200",
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
