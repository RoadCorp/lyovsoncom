import configPromise from "@payload-config";
import type { NextRequest } from "next/server";
import { getPayload, type Payload } from "payload";
import { TRUSTED_EMBEDDING_READ } from "@/access/private-field-read";
import type { Activity, Post } from "@/payload-types";
import { logApiTelemetry } from "@/utilities/api-telemetry";
import {
  authorizeEmbeddingMutation,
  getEmbeddingUnauthorizedResponse,
  hasEmbeddingAuthHint,
} from "@/utilities/embedding-auth";
import {
  describeEmbeddableDoc,
  type EmbeddableDoc,
  readStoredEmbedding,
} from "@/utilities/embedding-documents";
import {
  EMBEDDING_VECTOR_DIMENSIONS,
  generateEmbedding,
} from "@/utilities/generate-embedding";
import {
  EMBEDDABLE,
  EMBEDDABLE_COLLECTIONS,
  type EmbeddableCollection,
  isEmbeddableCollection,
} from "@/utilities/generate-embedding-helpers";
import { isPopulated } from "@/utilities/relations";
import { absoluteUrl } from "@/utilities/routes";

const MAX_EMBEDDINGS_LIMIT = 100;

/** Singular item type used in bulk responses ("post", "note", "activity"). */
const ITEM_TYPE: Record<EmbeddableCollection, string> = {
  posts: "post",
  notes: "note",
  activities: "activity",
};

function json(
  body: unknown,
  status: number,
  headers: Record<string, string> = {}
) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store",
      ...headers,
    },
  });
}

/** Collection-specific metadata that only the bulk listing reports. */
function bulkExtras(collection: EmbeddableCollection, doc: EmbeddableDoc) {
  if (collection === "activities") {
    return { activityType: (doc as Activity).activityType };
  }
  if (collection !== "posts") {
    return {};
  }
  const post = doc as Post;
  return {
    topics: post.topics
      ?.map((topic) => (isPopulated(topic) ? topic.name : topic))
      .filter(Boolean),
    authors: post.populatedAuthors
      ?.filter((author) => author?.name)
      .map((author) => ({
        name: String(author.name),
        username: author.username ? String(author.username) : "",
      })),
    project: isPopulated(post.project)
      ? { name: post.project.name, slug: post.project.slug }
      : null,
  };
}

/** Projects have no stored vectors, so item requests embed them on demand. */
async function embedProject(payload: Payload, id: number) {
  const project = await payload.findByID({
    collection: "projects",
    id,
    overrideAccess: false,
    context: { [TRUSTED_EMBEDDING_READ]: true },
    disableErrors: true,
    select: { name: true, slug: true, description: true, updatedAt: true },
  });
  if (!project) {
    return null;
  }
  const result = await generateEmbedding(
    [project.name, project.description].filter(Boolean).join(" ")
  );
  return {
    id: project.id,
    title: project.name || "",
    slug: project.slug,
    url: absoluteUrl(`/${project.slug}`),
    updatedAt: project.updatedAt,
    ...result,
  };
}

interface EmbeddingsParams {
  id: string | null;
  includeContent: boolean;
  includeVector: boolean;
  limit: number;
  query: string | null;
  startedAt: number;
  type: string;
}

function parseEmbeddingsParams(request: NextRequest): EmbeddingsParams {
  const startedAt = Date.now();
  const { searchParams } = new URL(request.url);
  return {
    startedAt,
    type: searchParams.get("type") || "all",
    id: searchParams.get("id"),
    query: searchParams.get("q"),
    includeContent: searchParams.get("content") === "true",
    includeVector: searchParams.get("vector") === "true",
    limit: Math.min(
      Number.parseInt(searchParams.get("limit") || "50", 10),
      MAX_EMBEDDINGS_LIMIT
    ),
  };
}

/** `?q=`: embeds the query text on demand. */
async function queryEmbeddingResponse(query: string, startedAt: number) {
  const { vector, model, dimensions } = await generateEmbedding(query);
  logApiTelemetry({
    route: "api.embeddings.query.completed",
    startedAt,
    summary: { dimensions, queryLength: query.length, status: 200 },
  });
  return json(
    {
      query,
      embedding: vector,
      dimensions,
      model,
      timestamp: new Date().toISOString(),
    },
    200
  );
}

async function projectEmbeddingResponse(
  payload: Payload,
  itemId: number,
  { includeVector, startedAt, type }: EmbeddingsParams
) {
  const project = await embedProject(payload, itemId);
  if (!project) {
    return json({ error: "Item not found" }, 404);
  }
  logApiTelemetry({
    route: "api.embeddings.item.completed",
    startedAt,
    summary: {
      id: project.id,
      itemType: type,
      precomputed: false,
      status: 200,
    },
  });
  return json(
    {
      id: project.id,
      type,
      ...(includeVector && { embedding: project.vector }),
      dimensions: project.dimensions,
      metadata: {
        title: project.title,
        slug: project.slug,
        url: project.url,
        lastModified: project.updatedAt,
        hasPrecomputedEmbedding: false,
      },
      model: project.model,
      timestamp: new Date().toISOString(),
    },
    200,
    { "X-Embedding-Source": "on-demand" }
  );
}

async function storedEmbeddingResponse(
  payload: Payload,
  type: EmbeddableCollection,
  itemId: number,
  { includeVector, startedAt }: EmbeddingsParams
) {
  const doc = (await payload.findByID({
    collection: type,
    id: itemId,
    depth: EMBEDDABLE[type].depth,
    overrideAccess: false,
    context: { [TRUSTED_EMBEDDING_READ]: true },
    disableErrors: true,
  })) as EmbeddableDoc | null;
  if (!doc) {
    return json({ error: "Item not found" }, 404);
  }

  const embedding = readStoredEmbedding(doc);
  if (!embedding) {
    return json(
      {
        error: "Embedding not available yet. Run /api/embeddings/sync.",
        type,
        id: doc.id,
      },
      409
    );
  }
  const dimensions = embedding.dimensions || embedding.vector.length;
  if (dimensions !== EMBEDDING_VECTOR_DIMENSIONS) {
    return json(
      {
        error: `Embedding dimension mismatch. Expected ${EMBEDDING_VECTOR_DIMENSIONS}D.`,
        type,
        id: doc.id,
        currentDimensions: dimensions,
      },
      409
    );
  }

  const { title, url } = describeEmbeddableDoc(type, doc);
  logApiTelemetry({
    route: "api.embeddings.item.completed",
    startedAt,
    summary: { id: doc.id, itemType: type, precomputed: true, status: 200 },
  });
  return json(
    {
      id: doc.id,
      type,
      ...(includeVector && { embedding: embedding.vector }),
      dimensions,
      metadata: {
        title: title || "",
        slug: doc.slug,
        url,
        lastModified: doc.updatedAt,
        hasPrecomputedEmbedding: true,
      },
      model: embedding.model || "pre-computed",
      timestamp: new Date().toISOString(),
    },
    200,
    { "X-Embedding-Source": "pre-computed" }
  );
}

/** `?type=&id=`: one item's embedding (projects are embedded on demand). */
function itemEmbeddingResponse(
  payload: Payload,
  id: string,
  params: EmbeddingsParams
) {
  const itemId = Number.parseInt(id, 10);
  const { type } = params;

  if (type === "projects") {
    return projectEmbeddingResponse(payload, itemId, params);
  }
  if (!isEmbeddableCollection(type)) {
    return json({ error: "Item not found" }, 404);
  }
  return storedEmbeddingResponse(payload, type, itemId, params);
}

async function listStoredEmbeddings(
  payload: Payload,
  { includeVector, limit, type }: EmbeddingsParams
) {
  const collections = EMBEDDABLE_COLLECTIONS.filter(
    (collection) => type === "all" || type === collection
  );
  const embeddings: Record<string, unknown>[] = [];

  for (const collection of collections) {
    const docs = await payload.find({
      collection,
      overrideAccess: false,
      context: { [TRUSTED_EMBEDDING_READ]: true },
      where: EMBEDDABLE[collection].publicWhere,
      limit,
      depth: EMBEDDABLE[collection].depth,
    });

    for (const doc of docs.docs as EmbeddableDoc[]) {
      const embedding = readStoredEmbedding(doc);
      if (!embedding) {
        continue;
      }
      const { title, url } = describeEmbeddableDoc(collection, doc);
      embeddings.push({
        id: doc.id,
        type: ITEM_TYPE[collection],
        ...(includeVector && { embedding: embedding.vector }),
        dimensions: embedding.dimensions || embedding.vector.length,
        metadata: {
          title,
          slug: doc.slug,
          url,
          lastModified: doc.updatedAt,
          ...bulkExtras(collection, doc),
          hasPrecomputedEmbedding: true,
        },
        model: embedding.model || "pre-computed",
      });
    }
  }

  return embeddings;
}

/** Bulk listing: stored embeddings only, so responses stay fast. */
async function bulkEmbeddingsResponse(
  payload: Payload,
  params: EmbeddingsParams
) {
  const { includeContent, includeVector, limit, startedAt, type } = params;
  const embeddings = await listStoredEmbeddings(payload, params);

  const response = {
    embeddings,
    count: embeddings.length,
    dimensions: (embeddings[0]?.dimensions as number | undefined) || 0,
    model: embeddings.length > 0 ? "mixed" : "none",
    usage: {
      type,
      includeContent,
      includeVector,
      limit,
      precomputedOnly: true,
    },
    timestamp: new Date().toISOString(),
    endpoints: {
      specificItem: absoluteUrl("/api/embeddings?type={type}&id={id}"),
      queryEmbedding: absoluteUrl("/api/embeddings?q={query}"),
      sync: absoluteUrl("/api/embeddings/sync"),
      bulk: absoluteUrl("/api/embeddings?type={type}&limit={limit}"),
      collections: Object.fromEntries(
        EMBEDDABLE_COLLECTIONS.map((collection) => [
          collection,
          absoluteUrl(`/api/embeddings/${collection}/{id}`),
        ])
      ),
    },
    notes: {
      performance: "Using pre-computed embeddings for fast response times",
      coverage:
        "Only items with pre-computed embeddings are included in bulk requests",
      onDemand:
        "Use POST /api/embeddings/sync for batch generation; query mode requires admin auth or CRON_SECRET",
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

  return json(response, 200, {
    "X-Embeddings-Source": "pre-computed",
    "X-Total-Items-With-Embeddings": embeddings.length.toString(),
  });
}

/**
 * Admin and cron only. `?q=` embeds a query on demand; `?type=&id=` returns
 * one item's embedding; otherwise lists stored embeddings for `?type=`
 * (posts, notes, activities or all). `?vector=true` includes vectors.
 */
export async function GET(request: NextRequest) {
  const params = parseEmbeddingsParams(request);
  const { id, query, startedAt, type } = params;

  try {
    if (!hasEmbeddingAuthHint(request)) {
      return getEmbeddingUnauthorizedResponse();
    }
    const payload = await getPayload({ config: configPromise });
    const authResult = await authorizeEmbeddingMutation(request, payload);
    if (!authResult.authorized) {
      return getEmbeddingUnauthorizedResponse(authResult.reason);
    }

    if (query) {
      return await queryEmbeddingResponse(query, startedAt);
    }
    if (id && type) {
      return await itemEmbeddingResponse(payload, id, params);
    }
    return await bulkEmbeddingsResponse(payload, params);
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
    return json(
      {
        error: "Failed to generate embeddings",
        message: "Please try again later or contact hello@lyovson.com",
        timestamp: new Date().toISOString(),
      },
      500
    );
  }
}
