import { getCanonicalURL } from "@/utilities/getURL";
import { siteConfig } from "@/utilities/site-config";

export function GET() {
  const siteUrl = getCanonicalURL();
  const lastUpdated = new Date().toISOString().slice(0, 10);

  const body = `# ${siteConfig.name} - AI Discovery Guide

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
- AI Resources Manifest: ${siteUrl}/.well-known/ai-resources
- API Documentation: ${siteUrl}/api/docs
- GraphQL Endpoint: ${siteUrl}/api/graphql
- XML Sitemap: ${siteUrl}/sitemap.xml
- Human AI Docs: ${siteUrl}/ai-docs

## Usage

- Attribution required: "${siteConfig.name} - ${siteUrl}"
- Commercial/licensing contact: hello@lyovson.com
- Respect Cache-Control headers and use feeds for bulk access when possible.

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
    },
  });
}
