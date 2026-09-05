import { getCanonicalURL } from "@/utilities/getURL";

export function GET() {
  const siteUrl = getCanonicalURL();

  return Response.json(
    {
      site: {
        name: "Lyóvson.com",
        description: "Official website of Rafa and Jess Lyóvson",
        url: siteUrl,
        authors: ["Rafa Lyóvson", "Jess Lyóvson"],
      },
      publicAccess: {
        recommended: {
          html: {
            home: siteUrl,
            posts: `${siteUrl}/posts`,
            projects: `${siteUrl}/projects`,
            rafa: `${siteUrl}/rafa`,
            jess: `${siteUrl}/jess`,
          },
          feeds: {
            rss: `${siteUrl}/feed.xml`,
            json: `${siteUrl}/feed.json`,
            atom: `${siteUrl}/atom.xml`,
          },
          discovery: {
            sitemap: `${siteUrl}/sitemap.xml`,
            robots: `${siteUrl}/robots.txt`,
            llms: `${siteUrl}/llms.txt`,
          },
        },
        notCrawlerSurfaces: [
          "/api",
          "/api/graphql",
          "/api/media/file",
          "/api/search",
          "/api/embeddings",
        ],
      },
      policy: {
        api: "Public REST, GraphQL, search, media proxy, and embedding endpoints are reserved for first-party UI, admin workflows, or authenticated maintenance tasks.",
        attribution: `Attribution required: Lyóvson.com - ${siteUrl}`,
        contact: "hello@lyovson.com",
      },
      metadata: {
        framework: "Next.js 16 with App Router",
        cms: "Payload CMS 3.x",
        hosting: "Vercel",
        database: "Neon Postgres",
      },
      version: "4.0.0",
      lastUpdated: "2026-06-04",
    },
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=86400, s-maxage=86400",
        "Vercel-CDN-Cache-Control": "max-age=86400",
        "X-Robots-Tag": "noindex, nofollow",
      },
    }
  );
}
