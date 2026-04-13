import configPromise from "@payload-config";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { PayloadRequest } from "payload";
import { getPayload } from "payload";
import { authorizeEmbeddingMutation } from "@/utilities/embedding-auth";
import {
  EMBEDDING_MODEL,
  EMBEDDING_VECTOR_DIMENSIONS,
} from "@/utilities/generate-embedding";
import {
  generateEmbeddingForActivity,
  generateEmbeddingForNote,
  generateEmbeddingForPost,
} from "@/utilities/generate-embedding-helpers";

const DEFAULT_LIMIT_PER_COLLECTION = 25;
const MAX_LIMIT_PER_COLLECTION = 250;
const EMBEDDABLE_COLLECTIONS = ["posts", "notes", "activities"] as const;

type EmbeddableCollection = (typeof EMBEDDABLE_COLLECTIONS)[number];

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

  const valid = value.filter((collection): collection is EmbeddableCollection =>
    EMBEDDABLE_COLLECTIONS.includes(collection as EmbeddableCollection)
  );

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

/* biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Batch sync endpoint orchestrates auth, filtering, and per-collection processing */
export async function POST(request: NextRequest) {
  try {
    const payload = await getPayload({ config: configPromise });
    const authResult = await authorizeEmbeddingMutation(request, payload);

    if (!authResult.authorized) {
      return NextResponse.json(
        { error: authResult.reason || "Unauthorized" },
        { status: 401 }
      );
    }

    let body: SyncBody = {};
    try {
      const parsed = (await request.json()) as unknown;
      if (parsed && typeof parsed === "object") {
        body = parsed as SyncBody;
      }
    } catch {
      body = {};
    }

    const collections = normalizeCollections(body.collections);
    const limitPerCollection = normalizeLimit(body.limitPerCollection);
    const force = body.force === true;

    const mockReq = {
      payload,
      user: null,
    } as unknown as PayloadRequest;

    const summary: Record<EmbeddableCollection, CollectionSummary> = {
      posts: buildCollectionSummary(),
      notes: buildCollectionSummary(),
      activities: buildCollectionSummary(),
    };

    for (const collection of collections) {
      const docs = await payload.find({
        collection,
        overrideAccess: true,
        where: getWhereClause(collection, force) as never,
        sort: "-updatedAt",
        limit: limitPerCollection,
      });

      summary[collection].queued = docs.docs.length;

      for (const doc of docs.docs) {
        const id = Number(doc.id);
        if (Number.isNaN(id)) {
          summary[collection].failed += 1;
          continue;
        }

        let result:
          | Awaited<ReturnType<typeof generateEmbeddingForPost>>
          | Awaited<ReturnType<typeof generateEmbeddingForNote>>
          | Awaited<ReturnType<typeof generateEmbeddingForActivity>>;

        if (collection === "posts") {
          result = await generateEmbeddingForPost(id, mockReq);
        } else if (collection === "notes") {
          result = await generateEmbeddingForNote(id, mockReq);
        } else {
          result = await generateEmbeddingForActivity(id, mockReq);
        }

        summary[collection].processed += 1;
        if (!result.success) {
          summary[collection].failed += 1;
        } else if (result.skipped) {
          summary[collection].skipped += 1;
        } else {
          summary[collection].generated += 1;
        }
      }
    }

    const totals = collections.reduce(
      (acc, collection) => {
        acc.queued += summary[collection].queued;
        acc.processed += summary[collection].processed;
        acc.generated += summary[collection].generated;
        acc.skipped += summary[collection].skipped;
        acc.failed += summary[collection].failed;
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

    return NextResponse.json(
      {
        success: true,
        mode: force ? "force" : "stale-only",
        model: EMBEDDING_MODEL,
        dimensions: EMBEDDING_VECTOR_DIMENSIONS,
        limitPerCollection,
        collections,
        summary,
        totals,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
