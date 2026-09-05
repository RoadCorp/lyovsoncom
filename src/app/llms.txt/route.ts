import { getCanonicalURL } from "@/utilities/getURL";
import { siteConfig } from "@/utilities/site-config";

export function GET() {
  const siteUrl = getCanonicalURL();
  const lastUpdated = new Date().toISOString().slice(0, 10);

  const body = `# ${siteConfig.name} - Discovery Guide

> Website and blog of Rafa and Jess Lyóvson featuring writing, projects, and research.

## About

${siteConfig.name} is a personal website showcasing technical writing, creative projects, and philosophical research by Rafa and Jess Lyóvson.

## Main Sections

- Writing & Articles: ${siteUrl}/posts
- Projects & Research: ${siteUrl}/projects
- Author: Rafa: ${siteUrl}/rafa
- Author: Jess: ${siteUrl}/jess
- Search: ${siteUrl}/search

## Machine-readable access

- JSON Feed: ${siteUrl}/feed.json
- RSS Feed: ${siteUrl}/feed.xml
- Atom Feed: ${siteUrl}/atom.xml
- XML Sitemap: ${siteUrl}/sitemap.xml
- Robots Policy: ${siteUrl}/robots.txt

## Usage

- Attribution required: "${siteConfig.name} - ${siteUrl}"
- Commercial/licensing contact: hello@lyovson.com
- Respect Cache-Control headers.
- Use feeds and canonical public pages for content access.
- Public REST, GraphQL, search, and embedding endpoints are not crawler access surfaces.

## Authors

- Rafa Lyóvson: ${siteUrl}/rafa
- Jess Lyóvson: ${siteUrl}/jess

## Contact

- Email: hello@lyovson.com
- Website: ${siteUrl}

---

Last Updated: ${lastUpdated}
Format: llms.txt v1.0
Protocol: https://github.com/llms-txt/llms-txt
`;

  return new Response(body, {
    status: 200,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=86400, s-maxage=86400",
      "Vercel-CDN-Cache-Control": "max-age=86400",
    },
  });
}
