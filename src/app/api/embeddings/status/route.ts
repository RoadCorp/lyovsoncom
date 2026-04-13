import configPromise from "@payload-config";
import type { NextRequest } from "next/server";
import { getPayload } from "payload";
import { logApiTelemetry } from "@/utilities/api-telemetry";
import {
  EMBEDDING_MODEL,
  EMBEDDING_VECTOR_DIMENSIONS,
} from "@/utilities/generate-embedding";

interface EmbeddingDoc {
  embedding_dimensions?: number | null;
  embedding_model?: string | null;
  embedding_vector?: string | null;
}

interface CollectionEmbeddingStats {
  coveragePercentage: number;
  needingEmbeddings: number;
  totalPublished: number;
  withEmbeddings: number;
}

interface CollectionCounts {
  activities: number;
  notes: number;
  posts: number;
}

interface EmbeddingCoverage {
  published: CollectionCounts;
  withEmbeddings: CollectionCounts;
}

const PERCENT_MULTIPLIER = 100;
const PUBLIC_QUERY_EMBEDDINGS_ENABLED =
  process.env.ENABLE_PUBLIC_QUERY_EMBEDDINGS === "true";

function asEmbeddingDoc(value: unknown): EmbeddingDoc | null {
  if (!value || typeof value !== "object") {
    return null;
  }
  return value as EmbeddingDoc;
}

function hasEmbeddingVector(doc: EmbeddingDoc): boolean {
  return Boolean(doc.embedding_vector);
}

function createCollectionEmbeddingStats(
  totalPublished: number,
  withEmbeddings: number
): CollectionEmbeddingStats {
  return {
    totalPublished,
    withEmbeddings,
    coveragePercentage:
      totalPublished > 0
        ? Math.round((withEmbeddings / totalPublished) * PERCENT_MULTIPLIER)
        : 0,
    needingEmbeddings: totalPublished - withEmbeddings,
  };
}

async function getEmbeddingCoverage(
  payload: Awaited<ReturnType<typeof getPayload>>
) {
  const [
    allPostsCount,
    allNotesCount,
    allActivitiesCount,
    postsWithEmbeddingsCount,
    notesWithEmbeddingsCount,
    activitiesWithEmbeddingsCount,
  ] = await Promise.all([
    payload.count({
      collection: "posts",
      overrideAccess: false,
      where: { _status: { equals: "published" } },
    }),
    payload.count({
      collection: "notes",
      overrideAccess: false,
      where: {
        _status: { equals: "published" },
        visibility: { equals: "public" },
      },
    }),
    payload.count({
      collection: "activities",
      overrideAccess: false,
      where: {
        _status: { equals: "published" },
        visibility: { equals: "public" },
      },
    }),
    payload.count({
      collection: "posts",
      overrideAccess: false,
      where: {
        _status: { equals: "published" },
        embedding_vector: { exists: true },
      },
    }),
    payload.count({
      collection: "notes",
      overrideAccess: false,
      where: {
        _status: { equals: "published" },
        visibility: { equals: "public" },
        embedding_vector: { exists: true },
      },
    }),
    payload.count({
      collection: "activities",
      overrideAccess: false,
      where: {
        _status: { equals: "published" },
        visibility: { equals: "public" },
        embedding_vector: { exists: true },
      },
    }),
  ]);

  return {
    published: {
      posts: allPostsCount.totalDocs,
      notes: allNotesCount.totalDocs,
      activities: allActivitiesCount.totalDocs,
    },
    withEmbeddings: {
      posts: postsWithEmbeddingsCount.totalDocs,
      notes: notesWithEmbeddingsCount.totalDocs,
      activities: activitiesWithEmbeddingsCount.totalDocs,
    },
  } satisfies EmbeddingCoverage;
}

async function getEmbeddingModelStats(
  payload: Awaited<ReturnType<typeof getPayload>>
) {
  const sampledPostEmbeddings = await payload.find({
    collection: "posts",
    overrideAccess: false,
    where: {
      _status: { equals: "published" },
      embedding_vector: { exists: true },
    },
    limit: 50,
    select: {
      embedding_model: true,
      embedding_dimensions: true,
      embedding_vector: true,
    },
  });

  const sampledPostsWithEmbeddings = sampledPostEmbeddings.docs
    .map(asEmbeddingDoc)
    .filter((doc): doc is EmbeddingDoc => Boolean(doc))
    .filter(hasEmbeddingVector);

  const modelsInUse: Record<string, number> = {};
  for (const doc of sampledPostsWithEmbeddings) {
    const model = doc.embedding_model || "unknown";
    modelsInUse[model] = (modelsInUse[model] || 0) + 1;
  }

  return {
    modelsInUse,
    sampleSize: sampledPostsWithEmbeddings.length,
    averageDimensions:
      sampledPostsWithEmbeddings.length > 0
        ? Math.round(
            sampledPostsWithEmbeddings.reduce(
              (sum, doc) => sum + (doc.embedding_dimensions || 0),
              0
            ) / sampledPostsWithEmbeddings.length
          )
        : 0,
  };
}

function buildStatus(
  siteUrl: string,
  coverage: EmbeddingCoverage,
  models: Awaited<ReturnType<typeof getEmbeddingModelStats>>
) {
  const posts = createCollectionEmbeddingStats(
    coverage.published.posts,
    coverage.withEmbeddings.posts
  );
  const notes = createCollectionEmbeddingStats(
    coverage.published.notes,
    coverage.withEmbeddings.notes
  );
  const activities = createCollectionEmbeddingStats(
    coverage.published.activities,
    coverage.withEmbeddings.activities
  );

  const totalPublishedItems =
    coverage.published.posts +
    coverage.published.notes +
    coverage.published.activities;
  const itemsWithEmbeddings =
    coverage.withEmbeddings.posts +
    coverage.withEmbeddings.notes +
    coverage.withEmbeddings.activities;

  return {
    system: {
      healthy: true,
      openaiConfigured: !!process.env.OPENAI_API_KEY,
      preferredModel: process.env.OPENAI_API_KEY ? EMBEDDING_MODEL : null,
      dimensions: EMBEDDING_VECTOR_DIMENSIONS,
      queryEmbeddingPublic: PUBLIC_QUERY_EMBEDDINGS_ENABLED,
      pgvectorEnabled: true,
      collectionsSupported: ["posts", "notes", "activities"],
    },
    statistics: {
      totalPublishedItems,
      itemsWithEmbeddings,
      overallCoveragePercentage:
        totalPublishedItems > 0
          ? Math.round(
              (itemsWithEmbeddings / totalPublishedItems) * PERCENT_MULTIPLIER
            )
          : 0,
      itemsNeedingEmbeddings: totalPublishedItems - itemsWithEmbeddings,
      collections: {
        posts,
        notes,
        activities,
      },
    },
    performance: {
      status: "optimized",
      embeddingStorage: `pgvector (${EMBEDDING_VECTOR_DIMENSIONS}D)`,
      indexType: "HNSW expression index on casted vectors",
      versionManagement: "automatic (5 per document)",
      computeOptimization: "batched sync endpoint with stale-only mode",
      cacheStrategy: {
        rssCache: "4-8 hours",
        sitemapCache: "4-8 hours",
        staticCache: "2-4 hours",
        postsCache: "30-60 minutes",
        autosaveInterval: "30 seconds",
      },
      note: "Cache times extended to reduce database wake-ups from bot crawling",
    },
    models,
    endpoints: {
      status: `${siteUrl}/api/embeddings/status`,
      sync: `${siteUrl}/api/embeddings/sync`,
      bulk: `${siteUrl}/api/embeddings?type=posts|notes|activities|all`,
      collections: {
        posts: `${siteUrl}/api/embeddings/posts/{id}`,
        notes: `${siteUrl}/api/embeddings/notes/{id}`,
        activities: `${siteUrl}/api/embeddings/activities/{id}`,
      },
      query: `${siteUrl}/api/embeddings?q={text}`,
      documentation: `${siteUrl}/ai-docs`,
      apiDocs: `${siteUrl}/api/docs`,
    },
    recommendations: [] as Array<{
      action: string;
      message: string;
      type: "success" | "info" | "warning" | "error";
    }>,
    timestamp: new Date().toISOString(),
  };
}

function addRecommendations(status: ReturnType<typeof buildStatus>) {
  if (!process.env.OPENAI_API_KEY) {
    status.recommendations.push({
      type: "warning",
      message: "No OpenAI API key configured - embeddings cannot be generated",
      action:
        "Add OPENAI_API_KEY, then run POST /api/embeddings/sync to backfill vectors",
    });
  }

  if (status.statistics.overallCoveragePercentage < PERCENT_MULTIPLIER) {
    status.recommendations.push({
      type: "info",
      message: `${status.statistics.itemsNeedingEmbeddings} items need embeddings across all collections`,
      action: "Run POST /api/embeddings/sync (recommended daily via cron)",
    });
  }

  if (!PUBLIC_QUERY_EMBEDDINGS_ENABLED) {
    status.recommendations.push({
      type: "info",
      message:
        "Public query embedding endpoint is disabled to reduce compute cost",
      action:
        "Set ENABLE_PUBLIC_QUERY_EMBEDDINGS=true only if public on-demand query vectors are required",
    });
  }

  if (status.statistics.overallCoveragePercentage === PERCENT_MULTIPLIER) {
    status.recommendations.push({
      type: "success",
      message: "All published content has embeddings!",
      action: "System is ready for AI applications and semantic search",
    });
  }

  for (const [collection, stats] of Object.entries(
    status.statistics.collections
  ) as [string, CollectionEmbeddingStats][]) {
    if (stats.totalPublished > 0 && stats.withEmbeddings === 0) {
      status.recommendations.push({
        type: "warning",
        message: `No embeddings found for ${collection} collection`,
        action: `Publish or edit content in ${collection} to generate embeddings`,
      });
    }
  }
}

export async function GET(_request: NextRequest) {
  const startedAt = Date.now();
  const SITE_URL =
    process.env.NEXT_PUBLIC_SERVER_URL || "https://www.lyovson.com";

  try {
    const payload = await getPayload({ config: configPromise });
    const [coverage, models] = await Promise.all([
      getEmbeddingCoverage(payload),
      getEmbeddingModelStats(payload),
    ]);
    const status = buildStatus(SITE_URL, coverage, models);

    addRecommendations(status);

    logApiTelemetry({
      route: "api.embeddings.status.completed",
      startedAt,
      summary: {
        overallCoveragePercentage: status.statistics.overallCoveragePercentage,
        status: 200,
        totalPublishedItems: status.statistics.totalPublishedItems,
      },
    });

    return new Response(JSON.stringify(status, null, 2), {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Cache-Control":
          "public, max-age=7200, s-maxage=14400, stale-while-revalidate=28800", // Cache for 2-4 hours, stale up to 8 hours
        "Access-Control-Allow-Origin": "*",
        "X-Robots-Tag": "noindex, nofollow", // Prevent search engine indexing
      },
    });
  } catch (error) {
    logApiTelemetry({
      route: "api.embeddings.status.failed",
      startedAt,
      level: "error",
      summary: {
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return new Response(
      JSON.stringify({
        system: {
          healthy: false,
          error: "Failed to get embedding status",
        },
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
