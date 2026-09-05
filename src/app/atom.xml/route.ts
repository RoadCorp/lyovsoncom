import { getCanonicalURL } from "@/utilities/getURL";
import { getSyndicationFeeds } from "@/utilities/syndication-feed";

export async function GET() {
  const SITE_URL = getCanonicalURL();

  try {
    const feeds = await getSyndicationFeeds();

    return new Response(feeds.atom, {
      status: 200,
      headers: {
        "Content-Type": "application/atom+xml; charset=utf-8",
        "Cache-Control": "public, max-age=21600, s-maxage=43200", // Cache for 6-12 hours (weekly publishing pattern)
        "Vercel-CDN-Cache-Control": "max-age=43200",
      },
    });
  } catch (_error) {
    const fallbackAtom = `<?xml version="1.0" encoding="UTF-8" ?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>Lyóvson.com</title>
  <link href="${SITE_URL}" />
  <link href="${SITE_URL}/atom.xml" rel="self" />
  <id>${SITE_URL}</id>
  <updated>${new Date().toISOString()}</updated>
  <author>
    <name>Rafa &amp; Jess Lyóvson</name>
  </author>
  <entry>
    <title>Feed Temporarily Unavailable</title>
    <link href="${SITE_URL}" />
    <id>${SITE_URL}/feed-error-${Date.now()}</id>
    <updated>${new Date().toISOString()}</updated>
    <summary>The Atom feed is temporarily unavailable. Please visit the website directly.</summary>
  </entry>
</feed>`;

    return new Response(fallbackAtom, {
      status: 200,
      headers: {
        "Content-Type": "application/atom+xml; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    });
  }
}
