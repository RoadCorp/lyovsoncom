import type { Metadata } from "next";
import { cacheLife } from "next/cache";
import { GridCard, GridCardSection } from "@/components/grid";
import { getServerSideURL } from "@/utilities/getURL";

const DOCS_CARD_CLASS_NAME =
  "aspect-auto h-auto g2:col-start-2 g2:col-end-3 g3:col-start-2 g3:col-end-4 g3:w-[var(--grid-card-2x1)]";

const DOCS_SECTION_CLASS_NAME =
  "content-prose col-span-3 row-span-3 p-6 md:p-8";

const LAST_UPDATED_FORMATTER = new Intl.DateTimeFormat("en-US", {
  month: "long",
  day: "numeric",
  year: "numeric",
});

async function getLastUpdatedLabel() {
  "use cache";
  cacheLife("static");

  return LAST_UPDATED_FORMATTER.format(new Date());
}

export const metadata: Metadata = {
  metadataBase: new URL(getServerSideURL()),
  title: "AI & Bot Access Documentation | Lyóvson.com",
  description:
    "Comprehensive guide for AI systems, bots, and crawlers to access and consume content from Lyóvson.com. Includes API endpoints, feeds, and best practices.",
  keywords: [
    "AI access",
    "bot documentation",
    "API",
    "RSS feeds",
    "GraphQL",
    "crawler friendly",
    "machine readable",
  ],
  alternates: {
    canonical: "/ai-docs",
  },
  openGraph: {
    siteName: "Lyóvson.com",
    title: "AI & Bot Access Documentation",
    description:
      "Comprehensive guide for AI systems and bots to access content from Lyóvson.com",
    type: "website",
    url: "/ai-docs",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "AI & Bot Access Documentation - Lyóvson.com",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI & Bot Access Documentation",
    description: "Guide for AI systems to access Lyóvson.com content",
    site: "@lyovson",
    creator: "@lyovson",
    images: [
      {
        url: "/og-image.png",
        alt: "AI & Bot Access Documentation - Lyóvson.com",
        width: 1200,
        height: 630,
      },
    ],
  },
  robots: {
    index: true,
    follow: true,
  },
};

function CodeBlock({ children, title }: { children: string; title?: string }) {
  return (
    <div className="content-block">
      {title && (
        <h4 className="tone-muted mb-2 font-medium text-sm">{title}</h4>
      )}
      <pre className="text-sm content-code-block">
        <code>{children}</code>
      </pre>
    </div>
  );
}

function ExternalLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      className="tone-heading underline decoration-current/40 underline-offset-3 transition-opacity duration-300 hover:opacity-80"
      href={href}
      rel="noopener noreferrer"
      target="_blank"
    >
      {children} ↗
    </a>
  );
}

export default async function AIDocsPage() {
  const SITE_URL = getServerSideURL();
  const lastUpdated = await getLastUpdatedLabel();

  return (
    <>
      <GridCard className={DOCS_CARD_CLASS_NAME}>
        <GridCardSection className={DOCS_SECTION_CLASS_NAME}>
          <div className="content-prose">
            <h1>AI and Bot Access Documentation</h1>
            <p>
              Comprehensive guide for AI systems, research bots, and automated
              tools to access and consume content from Lyovson.com.
            </p>
          </div>
        </GridCardSection>
      </GridCard>

      {/* Quick Access Links */}
      <GridCard className={DOCS_CARD_CLASS_NAME}>
        <GridCardSection className={DOCS_SECTION_CLASS_NAME}>
          <h2 className="mb-4 font-semibold text-xl">Quick Access</h2>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="mb-2 font-medium">Programmatic Access</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  📊{" "}
                  <ExternalLink href={`${SITE_URL}/api/docs`}>
                    API Documentation
                  </ExternalLink>
                </li>
                <li>
                  🔍{" "}
                  <ExternalLink href={`${SITE_URL}/api/graphql`}>
                    GraphQL Endpoint
                  </ExternalLink>
                </li>
                <li>
                  🗺️{" "}
                  <ExternalLink href={`${SITE_URL}/sitemap.xml`}>
                    XML Sitemap
                  </ExternalLink>
                </li>
                <li>
                  🤖{" "}
                  <ExternalLink href={`${SITE_URL}/robots.txt`}>
                    Robots.txt
                  </ExternalLink>
                </li>
                <li>
                  🧠{" "}
                  <ExternalLink href={`${SITE_URL}/llms.txt`}>
                    llms.txt (AI Discovery)
                  </ExternalLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-medium">Content Feeds</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  📡{" "}
                  <ExternalLink href={`${SITE_URL}/feed.xml`}>
                    RSS Feed
                  </ExternalLink>
                </li>
                <li>
                  📋{" "}
                  <ExternalLink href={`${SITE_URL}/feed.json`}>
                    JSON Feed
                  </ExternalLink>
                </li>
                <li>
                  ⚛️{" "}
                  <ExternalLink href={`${SITE_URL}/atom.xml`}>
                    Atom Feed
                  </ExternalLink>
                </li>
                <li>
                  🔎{" "}
                  <ExternalLink href={`${SITE_URL}/search`}>
                    Search Interface
                  </ExternalLink>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-medium">AI & Embeddings</h3>
              <ul className="space-y-1 text-sm">
                <li>
                  🧠{" "}
                  <ExternalLink href={`${SITE_URL}/api/embeddings`}>
                    Vector Embeddings
                  </ExternalLink>
                </li>
                <li>
                  📰{" "}
                  <ExternalLink href={`${SITE_URL}/api/embeddings/posts/1`}>
                    Posts API
                  </ExternalLink>
                </li>
                <li>
                  📚{" "}
                  <ExternalLink
                    href={`${SITE_URL}/api/embeddings/activities/1`}
                  >
                    Activities API
                  </ExternalLink>
                </li>
                <li>
                  📝{" "}
                  <ExternalLink href={`${SITE_URL}/api/embeddings/notes/1`}>
                    Notes API
                  </ExternalLink>
                </li>
                <li>
                  📈{" "}
                  <ExternalLink href={`${SITE_URL}/api/embeddings/status`}>
                    System Status
                  </ExternalLink>
                </li>
                <li>
                  🔧{" "}
                  <ExternalLink href={`${SITE_URL}/.well-known/ai-resources`}>
                    AI Resources
                  </ExternalLink>
                </li>
                <li>
                  ⚡ <span className="tone-heading">pgvector + OpenAI</span>
                </li>
              </ul>
            </div>
          </div>
        </GridCardSection>
      </GridCard>

      {/* Content Access Methods */}
      <GridCard className={DOCS_CARD_CLASS_NAME}>
        <GridCardSection className={DOCS_SECTION_CLASS_NAME}>
          <h2 className="mb-4 font-semibold text-xl">Content Access Methods</h2>

          <h3 className="mb-3 font-medium text-lg">
            1. RSS/JSON/Atom Feeds (Recommended)
          </h3>
          <p className="mb-3">
            For bulk content consumption, use our syndication feeds. They
            include full article content, metadata, and are refreshed multiple
            times per day (typically every 6-12 hours).
          </p>

          <CodeBlock title="JSON Feed with Enhanced Metadata">
            {`GET ${SITE_URL}/feed.json

// Returns JSON with full content + AI-friendly metadata:
{
  "items": [{
    "title": "Article Title",
    "content_text": "Full article content...",
    "_lyovson_metadata": {
      "wordCount": 1200,
      "readingTime": 6,
      "contentType": "article",
      "language": "en",
      "projectSlug": "next",
      "apiUrl": "${SITE_URL}/api/posts/123"
    }
  }]
}`}
          </CodeBlock>

          <h3 className="mt-6 mb-3 font-medium text-lg">2. GraphQL API</h3>
          <p className="mb-3">
            For structured queries and real-time data access. Supports
            filtering, sorting, and relationship traversal.
          </p>

          <CodeBlock title="GraphQL Query Example">
            {`POST ${SITE_URL}/api/graphql

query LatestPosts {
  Posts(limit: 10, sort: "-publishedAt", where: { _status: { equals: "published" } }) {
    docs {
      title
      slug
      content
      publishedAt
      populatedAuthors {
        name
        username
      }
      project {
        name
        slug
      }
      topics {
        name
        slug
      }
      meta {
        title
        description
      }
    }
  }
}`}
          </CodeBlock>

          <h3 className="mt-6 mb-3 font-medium text-lg">3. REST API</h3>
          <p className="mb-3">
            Standard REST endpoints for all content types. Supports pagination,
            filtering, and depth control.
          </p>

          <CodeBlock title="REST API Examples">
            {`# Get latest posts
GET ${SITE_URL}/api/posts?limit=10&sort=-publishedAt&where[_status][equals]=published

# Get all projects with related posts
GET ${SITE_URL}/api/projects?depth=1

# Search content
GET ${SITE_URL}/api/search?q=programming&limit=20

# Get specific post with full depth
GET ${SITE_URL}/api/posts/[id]?depth=2`}
          </CodeBlock>

          <h3 className="mt-6 mb-3 font-medium text-lg">
            4. Vector Embeddings API
          </h3>
          <p className="mb-3">
            Get vector embeddings for semantic search, content similarity, and
            AI applications. Supports both OpenAI embeddings and fallback
            hash-based vectors.
          </p>

          <CodeBlock title="Embeddings API Examples">
            {`# Collection-specific endpoints (pre-computed, ~50ms)
GET ${SITE_URL}/api/embeddings/posts/123      # Articles & blog posts
GET ${SITE_URL}/api/embeddings/activities/456 # Reading/watching/listening logs
GET ${SITE_URL}/api/embeddings/notes/789      # Personal notes

# Bulk access for training/analysis
GET ${SITE_URL}/api/embeddings?type=posts&limit=50

# Real-time query embedding
GET ${SITE_URL}/api/embeddings?q=programming tutorials

# System health across all collections
GET ${SITE_URL}/api/embeddings/status

# Advanced options
GET ${SITE_URL}/api/embeddings/posts/123?content=true&format=full
GET ${SITE_URL}/api/embeddings/activities/456?regenerate=true

# Response structure:
{
  "id": 123,
  "embedding": [0.1, -0.2, 0.3, ...], // 1536-dimensional vector
  "dimensions": 1536,
  "metadata": {
    "type": "post", // or "activity", "note"
    "title": "Post Title",
    "url": "${SITE_URL}/posts/post-slug",
    "wordCount": 1200,
    "readingTime": 6,
    "topics": ["programming", "javascript"]
  },
  "model": "text-embedding-3-small"
}`}
          </CodeBlock>
        </GridCardSection>
      </GridCard>

      {/* Vector Embeddings System */}
      <GridCard className={DOCS_CARD_CLASS_NAME}>
        <GridCardSection className={DOCS_SECTION_CLASS_NAME}>
          <h2 className="mb-4 font-semibold text-xl">
            🧠 Advanced Vector Embeddings System
          </h2>

          <div className="surface-emphasis mb-4 rounded-lg p-4">
            <h3 className="mb-2 font-medium">
              ⚡ High-Performance Pre-computed Embeddings
            </h3>
            <p className="text-sm">
              Our embedding system uses pgvector + OpenAI&apos;s
              text-embedding-3-small model with collection-specific endpoints
              and automatic pre-computation for lightning-fast API responses
              (&lt;100ms vs 1-3s traditional).
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <h3 className="mb-3 font-medium">🚀 Performance Features</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  • <strong>pgvector storage</strong> - 44% smaller than JSONB
                </li>
                <li>
                  • <strong>HNSW indexes</strong> - Sub-millisecond similarity
                  search
                </li>
                <li>
                  • <strong>Collection-specific</strong> - Posts, Activities,
                  Notes endpoints
                </li>
                <li>
                  • <strong>1536-dimensional</strong> OpenAI
                  text-embedding-3-small
                </li>
                <li>
                  • <strong>Smart regeneration</strong> - Only when content
                  changes
                </li>
                <li>
                  • <strong>Fallback system</strong> - Works without OpenAI API
                  key
                </li>
                <li>
                  • <strong>Sub-100ms responses</strong> for individual items
                </li>
                <li>
                  • <strong>Bulk access</strong> for training and analysis
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-3 font-medium">🔧 AI Applications</h3>
              <ul className="space-y-2 text-sm">
                <li>
                  • <strong>Semantic search</strong> - Find related content
                </li>
                <li>
                  • <strong>Content clustering</strong> - Group similar articles
                </li>
                <li>
                  • <strong>Recommendation engines</strong> - Suggest related
                  posts
                </li>
                <li>
                  • <strong>Content analysis</strong> - Theme and topic
                  discovery
                </li>
                <li>
                  • <strong>Similarity scoring</strong> - Measure content
                  relationships
                </li>
                <li>
                  • <strong>AI training data</strong> - High-quality labeled
                  vectors
                </li>
              </ul>
            </div>
          </div>

          <div className="surface-panel mt-6 rounded-lg p-4">
            <h4 className="mb-2 font-medium">📊 Monitor System Health</h4>
            <p className="mb-2 text-sm">
              Check embedding coverage and system status:
            </p>
            <code className="text-sm content-inline-code">
              GET{" "}
              <ExternalLink href={`${SITE_URL}/api/embeddings/status`}>
                {SITE_URL}/api/embeddings/status
              </ExternalLink>
            </code>
          </div>
        </GridCardSection>
      </GridCard>

      {/* Best Practices */}
      <GridCard className={DOCS_CARD_CLASS_NAME}>
        <GridCardSection className={DOCS_SECTION_CLASS_NAME}>
          <h2 className="mb-4 font-semibold text-xl">
            Best Practices for AI Systems
          </h2>

          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-medium">🚀 Performance</h3>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>Use feeds for bulk content access whenever possible</li>
                <li>Respect Cache-Control headers for optimal performance</li>
                <li>
                  API access is subject to platform limits and abuse controls
                </li>
                <li>
                  Include descriptive User-Agent header identifying your service
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-medium">📝 Content Understanding</h3>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>All content includes structured metadata (JSON-LD)</li>
                <li>
                  Articles are categorized by project and tagged with topics
                </li>
                <li>Full-text search available across all content</li>
                <li>
                  Content relationships are explicit (author, project, topics)
                </li>
              </ul>
            </div>

            <div>
              <h3 className="mb-2 font-medium">🤝 Attribution</h3>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>Content copyright: Rafa & Jess Lyóvson</li>
                <li>
                  Attribution required: &quot;Lyóvson.com -
                  https://www.lyovson.com&quot;
                </li>
                <li>Contact hello@lyovson.com for licensing questions</li>
                <li>
                  Academic and research use generally permitted with attribution
                </li>
              </ul>
            </div>
          </div>
        </GridCardSection>
      </GridCard>

      {/* Structured Data */}
      <GridCard className={DOCS_CARD_CLASS_NAME}>
        <GridCardSection className={DOCS_SECTION_CLASS_NAME}>
          <h2 className="mb-4 font-semibold text-xl">
            Structured Data & Metadata
          </h2>

          <p className="mb-4">
            All pages include comprehensive structured data following Schema.org
            standards:
          </p>

          <div className="grid gap-4 text-sm md:grid-cols-2">
            <div>
              <h3 className="mb-2 font-medium">Schema Types</h3>
              <ul className="space-y-1">
                <li>📄 Article (posts)</li>
                <li>🗂️ CollectionPage (archive and taxonomy pages)</li>
                <li>🧭 BreadcrumbList (hierarchy context)</li>
                <li>🏢 Organization (site info)</li>
                <li>🌐 WebSite (global metadata)</li>
                <li>👤 Person (authors)</li>
                <li>🔍 SearchAction (search capability)</li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 font-medium">Metadata Fields</h3>
              <ul className="space-y-1">
                <li>📅 Publication/modification dates</li>
                <li>📖 Word count & reading time</li>
                <li>🏷️ Topics and categories</li>
                <li>👥 Author information</li>
                <li>🔗 Canonical URLs</li>
              </ul>
            </div>
          </div>

          <div className="surface-panel rounded-lg p-4 text-sm">
            <p className="mb-2 font-medium">Article Schema includes:</p>
            <ul className="list-inside list-disc space-y-1">
              <li>Context and type information</li>
              <li>Headline and description</li>
              <li>Publication and modification dates</li>
              <li>Author information with URLs</li>
              <li>Publisher organization data</li>
              <li>Word count and reading time</li>
            </ul>
          </div>
        </GridCardSection>
      </GridCard>

      {/* Contact */}
      <GridCard className={DOCS_CARD_CLASS_NAME}>
        <GridCardSection className={DOCS_SECTION_CLASS_NAME}>
          <h2 className="mb-4 font-semibold text-xl">Contact & Support</h2>
          <p className="mb-4">
            Need custom access patterns, partnership support, or have questions
            about using our content?
          </p>
          <div className="space-y-2">
            <p>
              📧 Email:{" "}
              <ExternalLink href="mailto:hello@lyovson.com">
                hello@lyovson.com
              </ExternalLink>
            </p>
            <p>
              🐛 Issues:{" "}
              <ExternalLink href="https://github.com/rafalyovson">
                GitHub
              </ExternalLink>
            </p>
            <p>
              📱 Twitter:{" "}
              <ExternalLink href="https://x.com/rafalyovson">
                @lyovson
              </ExternalLink>
            </p>
          </div>
          <p className="tone-muted mt-4 text-sm">
            Last updated: {lastUpdated} •{" "}
            <ExternalLink href={`${SITE_URL}/api/docs`}>
              Machine-readable version
            </ExternalLink>
          </p>
        </GridCardSection>
      </GridCard>
    </>
  );
}
