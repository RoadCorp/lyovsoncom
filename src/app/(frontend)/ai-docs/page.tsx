export const prefetch = "partial";

import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import type { ReactNode } from "react";
import { GridCard, GridCardSection } from "@/components/grid";
import { getCanonicalURL } from "@/utilities/getURL";
import { buildSeoMetadata } from "@/utilities/seo-metadata";

const DOCS_CARD_CLASS_NAME =
  "aspect-auto h-auto g2:col-start-2 g2:col-end-3 g3:col-start-2 g3:col-end-4 g3:w-[var(--grid-card-2x1)]";
const DOCS_SECTION_CLASS_NAME = "docs-shell col-span-3 row-span-3 p-6 md:p-8";
const PANEL_CLASS_NAME = "surface-panel surface-docs-panel min-w-0";

const LAST_UPDATED_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

async function getLastUpdatedLabel() {
  "use cache";
  cacheLife("static");

  return LAST_UPDATED_FORMATTER.format(new Date("2026-06-04T00:00:00Z"));
}

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "Crawler Access Policy",
    description:
      "Crawler access policy for Lyóvson.com, including feeds, sitemap, robots policy, attribution, and contact information.",
    canonicalPath: "/ai-docs",
    keywords: ["crawler policy", "feeds", "sitemap", "robots.txt"],
    image: {
      url: "/og-image.png",
      width: 1200,
      height: 630,
      alt: "Crawler Access Policy",
    },
    robots: {
      index: false,
      follow: false,
    },
  }),
};

function ExternalLink({
  children,
  href,
}: {
  children: ReactNode;
  href: string;
}) {
  return (
    <a
      className="docs-link"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children}
    </a>
  );
}

export default async function AIDocsPage() {
  const siteUrl = getCanonicalURL();
  const lastUpdated = await getLastUpdatedLabel();

  return (
    <>
      <GridCard className={DOCS_CARD_CLASS_NAME}>
        <GridCardSection className={DOCS_SECTION_CLASS_NAME}>
          <div className="content-prose">
            <h1>Crawler Access Policy</h1>
            <p>
              Automated clients should use cached public pages, feeds, sitemap,
              and robots policy. REST, GraphQL, media proxy, search, and vector
              embedding endpoints are not crawler access surfaces.
            </p>
          </div>
        </GridCardSection>
      </GridCard>

      <GridCard className={DOCS_CARD_CLASS_NAME}>
        <GridCardSection className={DOCS_SECTION_CLASS_NAME}>
          <h2>Recommended Access</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className={PANEL_CLASS_NAME}>
              <h3 className="mb-2 font-medium">Feeds</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <ExternalLink href={`${siteUrl}/feed.xml`}>
                    RSS feed
                  </ExternalLink>
                </li>
                <li>
                  <ExternalLink href={`${siteUrl}/feed.json`}>
                    JSON feed
                  </ExternalLink>
                </li>
                <li>
                  <ExternalLink href={`${siteUrl}/atom.xml`}>
                    Atom feed
                  </ExternalLink>
                </li>
              </ul>
            </div>
            <div className={PANEL_CLASS_NAME}>
              <h3 className="mb-2 font-medium">Discovery</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  <ExternalLink href={`${siteUrl}/sitemap.xml`}>
                    XML sitemap
                  </ExternalLink>
                </li>
                <li>
                  <ExternalLink href={`${siteUrl}/robots.txt`}>
                    Robots policy
                  </ExternalLink>
                </li>
                <li>
                  <ExternalLink href={`${siteUrl}/llms.txt`}>
                    Discovery guide
                  </ExternalLink>
                </li>
              </ul>
            </div>
          </div>
        </GridCardSection>
      </GridCard>

      <GridCard className={DOCS_CARD_CLASS_NAME}>
        <GridCardSection className={DOCS_SECTION_CLASS_NAME}>
          <h2>Usage Policy</h2>
          <div className="space-y-4">
            <div className={PANEL_CLASS_NAME}>
              <h3 className="mb-2 font-medium">Do</h3>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>Respect Cache-Control and robots.txt directives.</li>
                <li>Use canonical page URLs and feeds for content access.</li>
                <li>Include a descriptive User-Agent for automated access.</li>
              </ul>
            </div>
            <div className={PANEL_CLASS_NAME}>
              <h3 className="mb-2 font-medium">Do Not</h3>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>Probe private, admin, or environment-file paths.</li>
                <li>
                  Use Payload REST, GraphQL, media proxy, or search routes.
                </li>
                <li>Fetch vector embeddings or trigger on-demand AI work.</li>
              </ul>
            </div>
          </div>
        </GridCardSection>
      </GridCard>

      <GridCard className={DOCS_CARD_CLASS_NAME}>
        <GridCardSection className={DOCS_SECTION_CLASS_NAME}>
          <h2>Contact</h2>
          <p className="mb-4">
            Contact hello@lyovson.com before high-volume access, licensing
            requests, or custom data access.
          </p>
          <p>
            <ExternalLink href="mailto:hello@lyovson.com">
              hello@lyovson.com
            </ExternalLink>
          </p>
          <p className="tone-muted mt-4 text-sm">Last updated: {lastUpdated}</p>
        </GridCardSection>
      </GridCard>
    </>
  );
}
