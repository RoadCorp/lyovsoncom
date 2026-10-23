import type { MetadataRoute } from "next";
import { getSitemapData } from "@/utilities/get-sitemap-data";
import { getContentRoutes, getStaticRoutes } from "@/utilities/sitemap-routes";

// A route handler rather than app/sitemap.ts: the metadata route was
// prerendered at build and never picked up publish-time tag revalidation
// (Oct 22: a new post was missing for days). The data stays tag-cached in
// getSitemapData; the CDN keeps a response for at most an hour.
function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function renderSitemap(entries: MetadataRoute.Sitemap) {
  const urls = entries.map(({ changeFrequency, lastModified, priority, url }) =>
    [
      "<url>",
      `<loc>${escapeXml(url)}</loc>`,
      lastModified
        ? `<lastmod>${new Date(lastModified).toISOString()}</lastmod>`
        : "",
      changeFrequency ? `<changefreq>${changeFrequency}</changefreq>` : "",
      priority === undefined ? "" : `<priority>${priority}</priority>`,
      "</url>",
    ]
      .filter(Boolean)
      .join("\n")
  );

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...urls,
    "</urlset>",
    "",
  ].join("\n");
}

export async function GET() {
  const now = new Date();
  const data = await getSitemapData();
  const entries = [
    ...getStaticRoutes(now),
    ...(await getContentRoutes(data, now)),
  ];

  return new Response(renderSitemap(entries), {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
