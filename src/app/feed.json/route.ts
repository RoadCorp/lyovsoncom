import { getCanonicalURL } from "@/utilities/getURL";
import { getSyndicationFeeds } from "@/utilities/syndication-feed";

export async function GET() {
  const SITE_URL = getCanonicalURL();

  try {
    const feeds = await getSyndicationFeeds();

    return new Response(feeds.json, {
      status: 200,
      headers: {
        "Content-Type": "application/feed+json; charset=utf-8",
        "Cache-Control": "public, max-age=21600, s-maxage=43200", // Cache for 6-12 hours (weekly publishing pattern)
        "Vercel-CDN-Cache-Control": "max-age=43200",
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
