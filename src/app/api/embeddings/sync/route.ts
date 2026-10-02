import configPromise from "@payload-config";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getPayload, type Payload } from "payload";
import { logApiTelemetry } from "@/utilities/api-telemetry";
import {
  authorizeEmbeddingMutation,
  getEmbeddingUnauthorizedResponse,
  hasEmbeddingAuthHint,
} from "@/utilities/embedding-auth";
import {
  EMBEDDING_MODEL,
  EMBEDDING_VECTOR_DIMENSIONS,
} from "@/utilities/generate-embedding";
import {
  EMBEDDABLE_COLLECTIONS,
  type EmbeddableCollection,
  generateEmbeddingFor,
  isEmbeddableCollection,
} from "@/utilities/generate-embedding-helpers";

const DEFAULT_LIMIT_PER_COLLECTION = 25;
const MAX_LIMIT_PER_COLLECTION = 250;

interface SyncBody {
  collections?: EmbeddableCollection[];
  force?: boolean;
  limitPerCollection?: number;
}

interface CollectionSummary {
  failed: number;
  generated: number;
  processed: number;
  queued: number;
  skipped: number;
}

function normalizeCollections(value: unknown): EmbeddableCollection[] {
  if (!Array.isArray(value)) {
    return [...EMBEDDABLE_COLLECTIONS];
  }

  const valid = value.filter(isEmbeddableCollection);

  return valid.length > 0 ? valid : [...EMBEDDABLE_COLLECTIONS];
}

function normalizeLimit(value: unknown): number {
  const parsed =
    typeof value === "number"
      ? value
      : Number.parseInt(String(value ?? DEFAULT_LIMIT_PER_COLLECTION), 10);

  if (!Number.isFinite(parsed) || parsed <= 0) {
    return DEFAULT_LIMIT_PER_COLLECTION;
  }

  return Math.min(parsed, MAX_LIMIT_PER_COLLECTION);
}

function getWhereClause(
  collection: EmbeddableCollection,
  force: boolean
): Record<string, unknown> {
  const baseFilters: Record<string, unknown>[] = [
    { _status: { equals: "published" } },
  ];

  if (collection === "notes" || collection === "activities") {
    baseFilters.push({ visibility: { equals: "public" } });
  }

  if (force) {
    return { and: baseFilters };
  }

  return {
    and: [
      ...baseFilters,
      {
        or: [
          { embedding_vector: { exists: false } },
          { embedding_text_hash: { exists: false } },
          { embedding_dimensions: { not_equals: EMBEDDING_VECTOR_DIMENSIONS } },
          { embedding_model: { not_equals: EMBEDDING_MODEL } },
        ],
      },
    ],
  };
}

function buildCollectionSummary(): CollectionSummary {
  return {
    failed: 0,
    generated: 0,
    processed: 0,
    queued: 0,
    skipped: 0,
  };
}

/** The POST body is optional; anything other than a JSON object is ignored. */
async function readSyncBody(request: NextRequest): Promise<SyncBody> {
  try {
    const parsed = (await request.json()) as unknown;
    if (parsed && typeof parsed === "object") {
      return parsed as SyncBody;
    }
  } catch {
    // Fall through to the defaults.
  }
  return {};
}

/** Embeds one collection's stale (or, with force, all) public documents. */
async function syncCollection(
  payload: Payload,
  collection: EmbeddableCollection,
  summary: CollectionSummary,
  { force, limit }: { force: boolean; limit: number }
) {
  const docs = await payload.find({
    collection,
    overrideAccess: true,
    where: getWhereClause(collection, force) as never,
    sort: "-updatedAt",
    limit,
    // The helpers load each document themselves; only ids are needed here.
    depth: 0,
    select: {},
  });

  summary.queued = docs.docs.length;

  for (const doc of docs.docs) {
    const id = Number(doc.id);
    if (Number.isNaN(id)) {
      summary.failed += 1;
      continue;
    }

    const result = await generateEmbeddingFor(collection, id, payload);

    summary.processed += 1;
    if (!result.success) {
      summary.failed += 1;
    } else if (result.skipped) {
      summary.skipped += 1;
    } else {
      summary.generated += 1;
    }
  }
}

function sumSummaries(summaries: CollectionSummary[]) {
  return summaries.reduce(
    (acc, summary) => {
      acc.queued += summary.queued;
      acc.processed += summary.processed;
      acc.generated += summary.generated;
      acc.skipped += summary.skipped;
      acc.failed += summary.failed;
      return acc;
    },
    {
      queued: 0,
      processed: 0,
      generated: 0,
      skipped: 0,
      failed: 0,
    }
  );
}

async function handleSync(
  request: NextRequest,
  { readBody }: { readBody: boolean }
) {
  const startedAt = Date.now();
  try {
    if (!hasEmbeddingAuthHint(request)) {
      return getEmbeddingUnauthorizedResponse();
    }

    const payload = await getPayload({ config: configPromise });
    const authResult = await authorizeEmbeddingMutation(request, payload);

    if (!authResult.authorized) {
      return getEmbeddingUnauthorizedResponse(authResult.reason);
    }

    const body = readBody ? await readSyncBody(request) : {};
    const collections = normalizeCollections(body.collections);
    const limitPerCollection = normalizeLimit(body.limitPerCollection);
    const force = body.force === true;

    const summary: Record<EmbeddableCollection, CollectionSummary> = {
      posts: buildCollectionSummary(),
      notes: buildCollectionSummary(),
      activities: buildCollectionSummary(),
    };

    for (const collection of collections) {
      await syncCollection(payload, collection, summary[collection], {
        force,
        limit: limitPerCollection,
      });
    }

    const totals = sumSummaries(
      collections.map((collection) => summary[collection])
    );

    const responseBody = {
      success: true,
      mode: force ? "force" : "stale-only",
      model: EMBEDDING_MODEL,
      dimensions: EMBEDDING_VECTOR_DIMENSIONS,
      limitPerCollection,
      collections,
      summary,
      totals,
      timestamp: new Date().toISOString(),
    };

    logApiTelemetry({
      route: "api.embeddings.sync.completed",
      startedAt,
      summary: {
        collections: collections.join(","),
        generated: totals.generated,
        mode: responseBody.mode,
        processed: totals.processed,
        status: 200,
      },
    });

    return NextResponse.json(responseBody, { status: 200 });
  } catch (error) {
    logApiTelemetry({
      route: "api.embeddings.sync.failed",
      startedAt,
      level: "error",
      summary: {
        status: 500,
        error: error instanceof Error ? error.message : "Unknown error",
      },
    });

    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

/** Manual sync; the JSON body may set collections, limitPerCollection, force. */
export function POST(request: NextRequest) {
  return handleSync(request, { readBody: true });
}

/**
 * Vercel Cron (GET with `Authorization: Bearer $CRON_SECRET`): stale-only sync
 * of every collection with the default per-collection limit.
 */
export function GET(request: NextRequest) {
  return handleSync(request, { readBody: false });
}
