import configPromise from "@payload-config";
import type { NextRequest } from "next/server";
import { getPayload } from "payload";
import type { Activity, Note, Post, Project, Topic } from "@/payload-types";
import { getActivityPath } from "@/utilities/activity-path";
import { getActivityTypeLabel } from "@/utilities/activity-type";
import { logApiTelemetry } from "@/utilities/api-telemetry";
import { authorizeEmbeddingMutation } from "@/utilities/embedding-auth";
import {
  EMBEDDING_VECTOR_DIMENSIONS,
  generateEmbedding,
} from "@/utilities/generate-embedding";

// Extended types with pgvector fields
type ItemWithEmbedding = (Post | Note | Activity | Project) & {
  embedding_vector?: string | null;
  embedding_model?: string | null;
  embedding_dimensions?: number | null;
};

const MAX_EMBEDDINGS_LIMIT = 100;
const PUBLIC_QUERY_EMBEDDINGS_ENABLED =
  process.env.ENABLE_PUBLIC_QUERY_EMBEDDINGS === "true";

/* biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Legacy endpoint supports query, item, and bulk embedding modes */
export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") || "all"; // 'posts', 'projects', 'all' - defaults to 'all'
  const id = searchParams.get("id"); // specific item ID
  const query = searchParams.get("q"); // text query to embed
  const includeContent = searchParams.get("content") === "true";
  const includeVector = searchParams.get("vector") !== "false"; // Include vector by default
  const limit = Math.min(
    Number.parseInt(searchParams.get("limit") || "50", 10),
    MAX_EMBEDDINGS_LIMIT
  );

  const SITE_URL =
    process.env.NEXT_PUBLIC_SERVER_URL || "https://www.lyovson.com";

  try {
    const payload = await getPayload({ config: configPromise });

    // Handle text query embedding - generate on-demand
    if (query) {
      if (!PUBLIC_QUERY_EMBEDDINGS_ENABLED) {
        const authResult = await authorizeEmbeddingMutation(request, payload);
        if (!authResult.authorized) {
          return new Response(
            JSON.stringify({
              error:
                "Query embedding is disabled for public access. Use admin auth or valid CRON_SECRET.",
            }),
            {
              status: 403,
              headers: { "Content-Type": "application/json; charset=utf-8" },
            }
          );
        }
      }

      const { vector, model, dimensions } = await generateEmbedding(query);
      logApiTelemetry({
        route: "api.embeddings.query.completed",
        startedAt,
        summary: {
          dimensions,
          queryLength: query.length,
          status: 200,
        },
      });

      return new Response(
        JSON.stringify({
          query,
          embedding: vector,
          dimensions,
          model,
          timestamp: new Date().toISOString(),
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            "Cache-Control":
              "public, max-age=300, s-maxage=600, stale-while-revalidate=1800",
            "Access-Control-Allow-Origin": "*",
          },
        }
      );
    }

    // Handle specific item embedding
    if (id && type) {
      // TODO: Properly type this as union of Post | Note | Project with embedding fields
      let item: ItemWithEmbedding | null = null;

      if (type === "posts") {
        item = await payload.findByID({
          collection: "posts",
          id: Number.parseInt(id, 10),
          overrideAccess: false,
          depth: 2,
          select: {
            id: true,
            title: true,
            slug: true,
            content: true,
            meta: true,
            topics: true,
            project: true,
            populatedAuthors: true,
            publishedAt: true,
            updatedAt: true,
            embedding_vector: true, // pgvector field
            embedding_model: true,
            embedding_dimensions: true,
            embedding_generated_at: true,
          },
        });
      } else if (type === "notes") {
        item = await payload.findByID({
          collection: "notes",
          id: Number.parseInt(id, 10),
          overrideAccess: false,
          depth: 1,
          select: {
            id: true,
            title: true,
            slug: true,
            content: true,
            updatedAt: true,
            embedding_vector: true,
            embedding_model: true,
            embedding_dimensions: true,
          },
        });
      } else if (type === "activities") {
        item = await payload.findByID({
          collection: "activities",
          id: Number.parseInt(id, 10),
          overrideAccess: false,
          depth: 1,
          select: {
            id: true,
            slug: true,
            activityType: true,
            reference: true,
            notes: true,
            startedAt: true,
            finishedAt: true,
            publishedAt: true,
            updatedAt: true,
            embedding_vector: true,
            embedding_model: true,
            embedding_dimensions: true,
          },
        });
      } else if (type === "projects") {
        item = await payload.findByID({
          collection: "projects",
          id: Number.parseInt(id, 10),
          overrideAccess: false,
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            updatedAt: true,
          },
        });
      }

      if (!item) {
        return new Response(JSON.stringify({ error: "Item not found" }), {
          status: 404,
          headers: { "Content-Type": "application/json" },
        });
      }

      // Use pre-computed embedding for posts/notes/activities.
      // Projects don't have pre-computed vectors, so keep on-demand generation there only.
      let embedding: number[] = [];
      let model = "unknown";
      let dimensions = 0;
      const isPrecomputedType =
        type === "posts" || type === "notes" || type === "activities";

      if (isPrecomputedType) {
        if (!item.embedding_vector) {
          return new Response(
            JSON.stringify({
              error: "Embedding not available yet. Run /api/embeddings/sync.",
              type,
              id: item.id,
            }),
            {
              status: 409,
              headers: { "Content-Type": "application/json; charset=utf-8" },
            }
          );
        }

        const vectorString = item.embedding_vector;
        embedding =
          typeof vectorString === "string"
            ? JSON.parse(vectorString)
            : vectorString;
        model = item.embedding_model || "pre-computed";
        dimensions = item.embedding_dimensions || embedding.length;

        if (dimensions !== EMBEDDING_VECTOR_DIMENSIONS) {
          return new Response(
            JSON.stringify({
              error: `Embedding dimension mismatch. Expected ${EMBEDDING_VECTOR_DIMENSIONS}D.`,
              type,
              id: item.id,
              currentDimensions: dimensions,
            }),
            {
              status: 409,
              headers: { "Content-Type": "application/json; charset=utf-8" },
            }
          );
        }
      } else {
        const projectTitle = "name" in item ? item.name || "" : "";
        const projectDescription =
          "description" in item ? item.description || "" : "";
        const textToEmbed = [projectTitle, projectDescription]
          .filter(Boolean)
          .join(" ");

        const result = await generateEmbedding(textToEmbed);
        embedding = result.vector;
        model = result.model;
        dimensions = result.dimensions;
      }

      const result = {
        id: item.id,
        type,
        ...(includeVector && { embedding }),
        dimensions,
        metadata: {
          title: (() => {
            if ("title" in item) {
              return item.title || "";
            }
            if ("name" in item) {
              return item.name || "";
            }
            return "";
          })(),
          slug: item.slug,
          url: (() => {
            if (type === "posts") {
              return `${SITE_URL}/posts/${item.slug}`;
            }
            if (type === "notes") {
              return `${SITE_URL}/notes/${item.slug}`;
            }
            if (type === "activities") {
              const activityPath = getActivityPath(item as Activity);
              return activityPath
                ? `${SITE_URL}${activityPath}`
                : `${SITE_URL}/activities/unknown/${item.slug}`;
            }
            return `${SITE_URL}/${item.slug}`;
          })(),
          lastModified: item.updatedAt,
          hasPrecomputedEmbedding: !!item.embedding_vector,
        },
        model,
        timestamp: new Date().toISOString(),
      };

      logApiTelemetry({
        route: "api.embeddings.item.completed",
        startedAt,
        summary: {
          id: item.id,
          itemType: type,
          precomputed: Boolean(item.embedding_vector),
          status: 200,
        },
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Cache-Control": "public, max-age=7200, s-maxage=7200", // Cache individual embeddings longer
          "Access-Control-Allow-Origin": "*",
          "X-Embedding-Source": item.embedding_vector
            ? "pre-computed"
            : "on-demand",
        },
      });
    }

    // Handle bulk embeddings
    const embeddings: Array<{
      id: number | string;
      type: string;
      embedding?: number[];
      dimensions: number;
      metadata: Record<string, unknown>;
      model: string;
    }> = [];

    if (type === "posts" || type === "all") {
      const posts = await payload.find({
        collection: "posts",
        overrideAccess: false,
        where: { _status: { equals: "published" } },
        limit,
        depth: 2,
        select: {
          id: true,
          title: true,
          slug: true,
          meta: true,
          topics: true,
          project: true,
          populatedAuthors: true,
          updatedAt: true,
          embedding_vector: true, // pgvector field
          embedding_model: true,
          embedding_dimensions: true,
        },
      });

      for (const post of posts.docs) {
        const postWithEmbedding = post as ItemWithEmbedding;
        let embedding: number[] = [];
        let model = "unknown";
        let dimensions = 0;

        if (postWithEmbedding.embedding_vector) {
          // Use pre-computed embedding - parse pgvector format
          const vectorString = postWithEmbedding.embedding_vector;
          embedding =
            typeof vectorString === "string"
              ? JSON.parse(vectorString)
              : vectorString;
          model = postWithEmbedding.embedding_model || "pre-computed";
          dimensions =
            postWithEmbedding.embedding_dimensions || embedding.length;
        } else {
          // Skip posts without pre-computed embeddings in bulk requests
          // to avoid long response times
          continue;
        }

        embeddings.push({
          id: post.id,
          type: "post",
          ...(includeVector && { embedding }),
          dimensions,
          metadata: {
            title: post.title,
            slug: post.slug,
            url: `${SITE_URL}/posts/${post.slug}`,
            lastModified: post.updatedAt,
            topics: post.topics
              ?.map((t) =>
                typeof t === "object" && t !== null ? (t as Topic).name : t
              )
              .filter(Boolean),
            authors: post.populatedAuthors
              ?.map((author) => {
                if (!author || typeof author !== "object") {
                  return null;
                }
                if (!("name" in author)) {
                  return null;
                }
                return {
                  name: String(author.name),
                  username: "username" in author ? String(author.username) : "",
                };
              })
              .filter(Boolean),
            project:
              post.project && typeof post.project === "object"
                ? { name: post.project.name, slug: post.project.slug }
                : null,
            hasPrecomputedEmbedding: true,
          },
          model,
        });
      }
    }

    if (type === "notes" || type === "all") {
      const notes = await payload.find({
        collection: "notes",
        overrideAccess: false,
        where: { _status: { equals: "published" } },
        limit,
        depth: 1,
        select: {
          id: true,
          title: true,
          slug: true,
          updatedAt: true,
          embedding_vector: true,
          embedding_model: true,
          embedding_dimensions: true,
        },
      });

      for (const note of notes.docs) {
        const noteWithEmbedding = note as ItemWithEmbedding;
        let embedding: number[] = [];
        let model = "unknown";
        let dimensions = 0;

        if (noteWithEmbedding.embedding_vector) {
          const vectorString = noteWithEmbedding.embedding_vector;
          embedding =
            typeof vectorString === "string"
              ? JSON.parse(vectorString)
              : vectorString;
          model = noteWithEmbedding.embedding_model || "pre-computed";
          dimensions =
            noteWithEmbedding.embedding_dimensions || embedding.length;
        } else {
          continue;
        }

        embeddings.push({
          id: note.id,
          type: "note",
          ...(includeVector && { embedding }),
          dimensions,
          metadata: {
            title: note.title,
            slug: note.slug,
            url: `${SITE_URL}/notes/${note.slug}`,
            lastModified: note.updatedAt,
            hasPrecomputedEmbedding: true,
          },
          model,
        });
      }
    }

    if (type === "activities" || type === "all") {
      const activities = await payload.find({
        collection: "activities",
        overrideAccess: false,
        where: {
          _status: { equals: "published" },
          visibility: { equals: "public" },
        },
        limit,
        depth: 1,
        select: {
          id: true,
          slug: true,
          activityType: true,
          reference: true,
          startedAt: true,
          finishedAt: true,
          publishedAt: true,
          updatedAt: true,
          embedding_vector: true,
          embedding_model: true,
          embedding_dimensions: true,
        },
      });

      for (const activity of activities.docs) {
        const activityWithEmbedding = activity as ItemWithEmbedding;
        let embedding: number[] = [];
        let model = "unknown";
        let dimensions = 0;

        if (activityWithEmbedding.embedding_vector) {
          const vectorString = activityWithEmbedding.embedding_vector;
          embedding =
            typeof vectorString === "string"
              ? JSON.parse(vectorString)
              : vectorString;
          model = activityWithEmbedding.embedding_model || "pre-computed";
          dimensions =
            activityWithEmbedding.embedding_dimensions || embedding.length;
        } else {
          continue;
        }

        const referenceObj =
          typeof activity.reference === "object" && activity.reference !== null
            ? activity.reference
            : null;

        const title = referenceObj?.title
          ? `${getActivityTypeLabel(activity.activityType)} ${referenceObj.title}`
          : "Activity";

        embeddings.push({
          id: activity.id,
          type: "activity",
          ...(includeVector && { embedding }),
          dimensions,
          metadata: {
            title,
            slug: activity.slug,
            url: (() => {
              const activityPath = getActivityPath(activity as Activity);
              return activityPath
                ? `${SITE_URL}${activityPath}`
                : `${SITE_URL}/activities/unknown/${activity.slug}`;
            })(),
            lastModified: activity.updatedAt,
            activityType: activity.activityType,
            hasPrecomputedEmbedding: true,
          },
          model,
        });
      }
    }

    const response = {
      embeddings,
      count: embeddings.length,
      dimensions: embeddings[0]?.dimensions || 0,
      model: embeddings.length > 0 ? "mixed" : "none",
      usage: {
        type: type || "all",
        includeContent,
        includeVector,
        limit,
        precomputedOnly: true, // We only return pre-computed embeddings in bulk
      },
      timestamp: new Date().toISOString(),
      endpoints: {
        specificItem: `${SITE_URL}/api/embeddings?type={type}&id={id}`,
        queryEmbedding: `${SITE_URL}/api/embeddings?q={query}`,
        sync: `${SITE_URL}/api/embeddings/sync`,
        bulk: `${SITE_URL}/api/embeddings?type={type}&limit={limit}`,
        collections: {
          posts: `${SITE_URL}/api/embeddings/posts/{id}`,
          notes: `${SITE_URL}/api/embeddings/notes/{id}`,
          activities: `${SITE_URL}/api/embeddings/activities/{id}`,
        },
      },
      notes: {
        performance: "Using pre-computed embeddings for fast response times",
        coverage:
          "Only items with pre-computed embeddings are included in bulk requests",
        onDemand:
          "Use POST /api/embeddings/sync for batch generation; query mode is auth-gated unless explicitly enabled",
      },
    };

    logApiTelemetry({
      route: "api.embeddings.bulk.completed",
      startedAt,
      summary: {
        count: response.count,
        includeContent,
        includeVector,
        limit,
        status: 200,
        type,
      },
    });

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control": "public, max-age=3600, s-maxage=3600",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET",
        "Access-Control-Allow-Headers": "Content-Type",
        "X-Embeddings-Source": "pre-computed",
        "X-Total-Items-With-Embeddings": embeddings.length.toString(),
      },
    });
  } catch (error) {
    logApiTelemetry({
      route: "api.embeddings.failed",
      startedAt,
      level: "error",
      summary: {
        error: error instanceof Error ? error.message : "Unknown error",
        queryMode: Boolean(query),
        status: 500,
        type,
      },
    });

    return new Response(
      JSON.stringify({
        error: "Failed to generate embeddings",
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
