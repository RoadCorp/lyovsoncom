import configPromise from "@payload-config";
import type { NextRequest } from "next/server";
import { getPayload } from "payload";
import { logApiTelemetry } from "@/utilities/api-telemetry";

export async function GET(_request: NextRequest) {
  const startedAt = Date.now();
  // NOTE: "use cache" removed due to Next.js 16 canary bug
  // See: https://github.com/vercel/next.js/issues/76612
  // Route handlers with "use cache" throw: "Only plain objects can be passed to Client Components"
  // Additionally, cached functions cannot accept non-serializable parameters like Payload instances
  // Using traditional HTTP caching via Cache-Control headers instead (line 365)

  const SITE_URL =
    process.env.NEXT_PUBLIC_SERVER_URL || "https://www.lyovson.com";

  try {
    const payload = await getPayload({ config: configPromise });

    // Get content statistics for AI context
    const [posts, projects, topics, notes, activities, authors] =
      await Promise.all([
        payload.find({
          collection: "posts",
          where: { _status: { equals: "published" } },
          limit: 1,
          pagination: false,
        }),
        payload.find({
          collection: "projects",
          limit: 1,
          pagination: false,
        }),
        payload.find({
          collection: "topics",
          limit: 1,
          pagination: false,
        }),
        payload.find({
          collection: "notes",
          where: {
            _status: { equals: "published" },
            visibility: { equals: "public" },
          },
          limit: 1,
          pagination: false,
        }),
        payload.find({
          collection: "activities",
          where: {
            _status: { equals: "published" },
            visibility: { equals: "public" },
          },
          limit: 1,
          pagination: false,
        }),
        payload.find({
          collection: "lyovsons",
          overrideAccess: true,
          limit: 1,
          pagination: false,
        }),
      ]);

    const apiDocumentation = {
      site: {
        name: "Lyóvson.com",
        description: "Official website of Rafa and Jess Lyóvson",
        url: SITE_URL,
        authors: ["Rafa Lyóvson", "Jess Lyóvson"],
        topics: [
          "programming",
          "design",
          "philosophy",
          "technology",
          "research",
        ],
        contentStats: {
          totalPosts: posts.totalDocs,
          totalProjects: projects.totalDocs,
          totalTopics: topics.totalDocs,
          totalNotes: notes.totalDocs,
          totalActivities: activities.totalDocs,
          totalAuthors: authors.totalDocs,
        },
      },
      openapi: "3.1.0",
      contentAccess: {
        description:
          "All content is accessible via standard HTTP GET requests to documented endpoints",
        api: {
          type: "REST",
          description:
            "RESTful API for accessing posts, projects, topics, notes, and activities",
          rest: {
            endpoints: [
              {
                path: "/",
                method: "GET",
                description: "Homepage with latest posts and featured projects",
                response: "HTML page",
                access: "public",
              },
              {
                path: "/posts/{postSlug}",
                method: "GET",
                description: "Individual post pages",
                parameters: {
                  postSlug: "URL-friendly post identifier",
                },
                response: "HTML page with full post content",
                access: "public",
              },
              {
                path: "/api/docs",
                method: "GET",
                description: "API documentation (this endpoint)",
                response: "JSON",
                access: "public",
                caching: "3600s",
              },
            ],
          },
        },
        collections: {
          description:
            "Content organized into collections accessible through Payload CMS",
          available: [
            {
              name: "posts",
              endpoint: `${SITE_URL}/posts`,
              description: "Blog posts and articles",
              fields: [
                "title",
                "content",
                "authors",
                "project",
                "topics",
                "meta",
              ],
              access: "published posts are public",
              sorting: "newest first by default",
            },
            {
              name: "projects",
              endpoint: `${SITE_URL}/projects`,
              description: "Project collections and categories",
              fields: ["name", "slug", "description"],
              access: "public",
            },
            {
              name: "topics",
              endpoint: `${SITE_URL}/topics`,
              description: "Content categorization tags",
              fields: ["name", "description", "color"],
              access: "public",
            },
            {
              name: "notes",
              endpoint: `${SITE_URL}/notes`,
              description: "Short-form notes, quotes, and reflections",
              fields: ["title", "content", "author", "type", "topics"],
              access: "published public notes are accessible",
            },
            {
              name: "activities",
              endpoint: `${SITE_URL}/activities`,
              description:
                "Reading, watching, listening, and playing activity logs",
              fields: [
                "reference",
                "activityType",
                "participants",
                "notes",
                "startedAt",
                "finishedAt",
              ],
              access: "published public activities are accessible",
            },
            {
              name: "authors",
              endpoint: `${SITE_URL}/{username}`,
              description: "Public author profile and bio pages",
              fields: ["name", "username", "bio", "socialLinks"],
              access:
                "public profile routes; underlying user collection is private",
            },
          ],
        },
        embeddings: {
          description:
            "Semantic search using pgvector embeddings for posts, notes, and activities",
          model: "text-embedding-3-small (OpenAI)",
          dimensions: 1536,
          endpoints: {
            embeddings: {
              path: "/api/embeddings",
              methods: {
                bulk: {
                  description:
                    "Get embeddings for multiple items (posts, activities, notes)",
                  parameters: {
                    type: "posts | activities | notes | all (optional, defaults to 'all')",
                    limit: "number (optional, max 100, defaults to 50)",
                    vector:
                      "boolean (optional, include vector data, defaults to true)",
                    content:
                      "boolean (optional, include full content, defaults to false)",
                  },
                  examples: [
                    `${SITE_URL}/api/embeddings?type=posts&limit=10`,
                    `${SITE_URL}/api/embeddings?type=activities&vector=false`,
                    `${SITE_URL}/api/embeddings?type=all&limit=25`,
                  ],
                  caching: "3600s",
                  notes:
                    "Returns pre-computed embeddings only for fast response times",
                },
                specific: {
                  description: "Get embedding for a specific item by ID",
                  parameters: {
                    type: "posts | activities | notes (required)",
                    id: "item ID (required)",
                  },
                  example: `${SITE_URL}/api/embeddings?type=posts&id=123`,
                  caching: "3600s",
                },
                query: {
                  description:
                    "Generate embedding for a text query (on-demand, disabled for public by default)",
                  parameters: {
                    q: "text query (required)",
                  },
                  example: `${SITE_URL}/api/embeddings?q=programming+philosophy`,
                  caching: "3600s",
                  notes:
                    "Requires admin auth/CRON_SECRET unless ENABLE_PUBLIC_QUERY_EMBEDDINGS=true",
                },
              },
            },
            sync: {
              path: "/api/embeddings/sync",
              description:
                "Batch-generate stale/missing embeddings (designed for daily cron)",
              method: "POST",
              auth: "admin session or Bearer CRON_SECRET",
            },
            status: {
              path: "/api/embeddings/status",
              description:
                "Get embedding system health and coverage statistics",
              response: {
                system: "health status and configuration",
                statistics: "coverage percentages per collection",
                recommendations: "actionable improvement suggestions",
              },
              caching: "300s",
            },
            search: {
              path: "/api/search",
              description:
                "Semantic search across all content using embeddings",
              parameters: {
                q: "search query (required)",
                limit: "number of results (optional, defaults to 10)",
                threshold:
                  "similarity threshold 0-1 (optional, defaults to 0.7)",
              },
              example: `${SITE_URL}/api/search?q=web+development&limit=5`,
              response: "ranked results with similarity scores",
              caching: "300s",
            },
          },
          features: [
            "Pre-computed embeddings for fast bulk access",
            "Batched embedding sync for stale/missing content",
            "Optional on-demand query embeddings (auth-gated by default)",
            "HNSW expression indexes for casted vector search",
            "Cosine similarity ranking",
            "Collection-specific coverage tracking",
          ],
          storage: "PostgreSQL with pgvector extension",
          indexing: "HNSW on embedding_vector::vector(1536)",
        },
      },
      dataFormat: {
        posts: {
          structure: "Lexical rich text format (JSON)",
          features: [
            "Nested block structure",
            "Custom components (banners, code blocks, media)",
            "Relationship links to other content",
            "Version control via _status field",
          ],
          serialization: {
            internal: "Lexical JSON",
            public: "Converted to HTML/Markdown for display",
          },
        },
        notes: {
          structure: "Lexical rich text format (JSON)",
          features: [
            "Short-form thought and quote content",
            "Topic relationships",
            "Connection graph to posts/references/notes",
          ],
          serialization: {
            internal: "Lexical JSON",
            public: "Rendered HTML with card summaries",
          },
        },
        activities: {
          structure: "Structured activity metadata + optional rich text notes",
          features: [
            "Activity type (read/watch/listen/play/visit)",
            "Reference relationships",
            "Participant relationships",
            "Timeline fields (startedAt/finishedAt/publishedAt)",
          ],
          serialization: {
            internal: "Payload document fields + Lexical JSON for notes",
            public: "Rendered activity pages with stable date+slug URLs",
          },
        },
      },
      rateLimits: {
        default: "No explicit limits in development",
        production: "Subject to Vercel edge function limits",
        caching: "Aggressive caching via Cache-Control headers",
      },
      metadata: {
        framework: "Next.js 16 with App Router",
        cms: "Payload CMS 3.x",
        database: "Vercel Postgres with pgvector",
        hosting: "Vercel",
        search: "Semantic search via OpenAI embeddings",
      },
      usage: {
        aiAgents: {
          description:
            "This API is designed for AI agents to understand and access site content",
          recommendations: [
            "Use /api/docs to understand available endpoints",
            "Use /api/embeddings for semantic search",
            "Use /api/search for natural language queries",
            "Use /api/embeddings/status to check system health",
            "Access individual posts via /posts/{postSlug}",
            "Respect Cache-Control headers for optimal performance",
          ],
          bestPractices: [
            "Start with /api/search for content discovery",
            "Use embeddings similarity scores to rank relevance",
            "Filter by topics for focused content areas",
            "Check embedding coverage before bulk operations",
            "Use vector=false parameter when vectors aren't needed",
          ],
        },
        humanDevelopers: {
          description: "Standard REST API access patterns apply",
          recommendations: [
            "All GET endpoints return JSON",
            "CORS enabled for public endpoints",
            "Standard HTTP status codes (200, 404, 500)",
            "Errors include descriptive messages",
          ],
        },
      },
      contact: {
        general: "hello@lyovson.com",
        technical: "rafa@lyovson.com",
        github: "https://github.com/rafalyovson",
      },
      links: {
        documentation: `${SITE_URL}/api/docs`,
        embeddingStatus: `${SITE_URL}/api/embeddings/status`,
        search: `${SITE_URL}/api/search`,
        home: SITE_URL,
      },
      version: "3.0.0",
      lastUpdated: new Date().toISOString(),
    };

    logApiTelemetry({
      route: "api.docs.completed",
      startedAt,
      summary: {
        status: 200,
        totalActivities: activities.totalDocs,
        totalNotes: notes.totalDocs,
        totalPosts: posts.totalDocs,
      },
    });

    return new Response(JSON.stringify(apiDocumentation, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    });
  } catch (error) {
    logApiTelemetry({
      route: "api.docs.failed",
      startedAt,
      level: "error",
      summary: {
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return new Response(
      JSON.stringify({
        error: "API documentation temporarily unavailable",
        message: "Please try again later or contact hello@lyovson.com",
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "no-cache",
        },
      }
    );
  }
}
