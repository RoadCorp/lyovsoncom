import configPromise from "@payload-config";
import type { NextRequest } from "next/server";
import { getPayload } from "payload";
import { TRUSTED_EMBEDDING_READ } from "@/access/privateFieldRead";
import type { Activity, Note, Post } from "@/payload-types";
import { getActivityTypeLabel } from "@/utilities/activity-type";
import {
  authorizeEmbeddingMutation,
  getEmbeddingUnauthorizedResponse,
  hasEmbeddingAuthHint,
} from "@/utilities/embedding-auth";
import { EMBEDDING_VECTOR_DIMENSIONS } from "@/utilities/generate-embedding";
import {
  buildEmbeddingText,
  EMBEDDABLE,
  type EmbeddableCollection,
  generateEmbeddingFor,
  isEmbeddableCollection,
} from "@/utilities/generate-embedding-helpers";
import {
  absoluteUrl,
  activityRoute,
  noteRoute,
  postRoute,
} from "@/utilities/routes";

const WORD_SPLIT_REGEX = /\s+/;
const WORDS_PER_MINUTE = 200;
const VECTOR_BRACKETS = /^\[|\]$/g;

type EmbeddableDoc = Activity | Note | Post;

interface StoredEmbedding {
  dimensions?: number | null;
  generatedAt?: string | null;
  model?: string | null;
  textHash?: string | null;
  vector: number[];
}

interface Args {
  params: Promise<{ collection: string; id: string }>;
}

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body, null, status === 200 ? 2 : 0), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "private, no-store",
    },
  });
}

function readStoredEmbedding(doc: EmbeddableDoc): StoredEmbedding | null {
  const raw = doc.embedding_vector;
  if (typeof raw !== "string" || !raw) {
    return null;
  }
  return {
    vector: raw.replace(VECTOR_BRACKETS, "").split(",").map(Number),
    model: doc.embedding_model,
    dimensions: doc.embedding_dimensions,
    generatedAt: doc.embedding_generated_at,
    textHash: doc.embedding_text_hash,
  };
}

/** Title, public URL and collection-specific extras for the response. */
function describe(collection: EmbeddableCollection, doc: EmbeddableDoc) {
  if (collection === "activities") {
    const activity = doc as Activity;
    const reference =
      typeof activity.reference === "object" ? activity.reference : null;
    const path = activityRoute(activity);
    return {
      title: reference?.title
        ? `${getActivityTypeLabel(activity.activityType)} ${reference.title}`
        : "Activity",
      url: absoluteUrl(path ?? `/activities/unknown/${activity.slug}`),
      content: activity.notes,
    };
  }

  if (collection === "notes") {
    const note = doc as Note;
    const wordCount = buildEmbeddingText("notes", note).split(
      WORD_SPLIT_REGEX
    ).length;
    return {
      title: note.title,
      url: absoluteUrl(noteRoute(note.slug ?? "")),
      content: note.content,
      metadata: {
        type: "note",
        wordCount,
        readingTime: Math.ceil(wordCount / WORDS_PER_MINUTE),
        contentFormat: "lexical",
        hasContent: Boolean(note.content),
      },
    };
  }

  const post = doc as Post;
  return {
    title: post.title,
    url: absoluteUrl(postRoute(post.slug ?? "")),
    content: post.content,
  };
}

/**
 * Returns a post's, note's or activity's stored embedding. `?regenerate=true`
 * re-embeds it first through the shared helper (conditional write, no
 * version row). `?format=vector-only|metadata-only|full`, `?content=true`.
 */
export async function GET(request: NextRequest, { params }: Args) {
  const { collection, id: rawId } = await params;
  const id = Number.parseInt(rawId, 10);
  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "full";
  const includeContent = searchParams.get("content") === "true";
  const regenerate = searchParams.get("regenerate") === "true";

  if (!isEmbeddableCollection(collection)) {
    return json({ error: "Unknown collection" }, 404);
  }
  if (Number.isNaN(id)) {
    return json({ error: "id must be a number" }, 400);
  }

  try {
    if (!hasEmbeddingAuthHint(request)) {
      return getEmbeddingUnauthorizedResponse();
    }
    const payload = await getPayload({ config: configPromise });
    const authResult = await authorizeEmbeddingMutation(request, payload);
    if (!authResult.authorized) {
      return getEmbeddingUnauthorizedResponse(authResult.reason);
    }

    const { label, depth } = EMBEDDABLE[collection];

    if (regenerate) {
      const result = await generateEmbeddingFor(collection, id, payload, {
        force: true,
      });
      if (!result.success) {
        return json({ error: result.error, id }, 409);
      }
    }

    const doc = (await payload.findByID({
      collection,
      id,
      depth,
      overrideAccess: false,
      context: { [TRUSTED_EMBEDDING_READ]: true },
      disableErrors: true,
    })) as EmbeddableDoc | null;

    if (!doc) {
      return json({ error: `${label} not found`, id }, 404);
    }

    const embedding = readStoredEmbedding(doc);
    if (!embedding) {
      return json(
        {
          error: "Embedding not available yet. Run /api/embeddings/sync.",
          id,
        },
        409
      );
    }
    if (embedding.dimensions !== EMBEDDING_VECTOR_DIMENSIONS) {
      return json(
        {
          error: `Embedding dimension mismatch. Expected ${EMBEDDING_VECTOR_DIMENSIONS}D.`,
          id,
        },
        409
      );
    }

    const { content, ...details } = describe(collection, doc);
    const response: Record<string, unknown> = {
      id: doc.id,
      title: details.title,
      slug: doc.slug,
      url: details.url,
      embedding: null,
      publishedAt: doc.publishedAt,
      updatedAt: doc.updatedAt,
      ...("metadata" in details ? { metadata: details.metadata } : {}),
    };

    if (format === "vector-only") {
      response.embedding = embedding.vector;
    } else if (format === "metadata-only") {
      response.embedding = {
        model: embedding.model,
        dimensions: embedding.dimensions,
        generatedAt: embedding.generatedAt,
      };
    } else {
      response.embedding = embedding;
      if (includeContent && content) {
        response.content = content;
      }
    }

    return json(response, 200);
  } catch {
    return json({ error: "Internal server error", id }, 500);
  }
}

/** `{ "action": "regenerate" }` redirects to GET with `?regenerate=true`. */
export async function POST(request: NextRequest, { params }: Args) {
  const { collection } = await params;
  if (!isEmbeddableCollection(collection)) {
    return json({ error: "Unknown collection" }, 404);
  }

  try {
    if (!hasEmbeddingAuthHint(request)) {
      return getEmbeddingUnauthorizedResponse();
    }

    const body = (await request.json()) as { action?: string };
    if ((body.action ?? "regenerate") !== "regenerate") {
      return json(
        { error: "Invalid action", validActions: ["regenerate"] },
        400
      );
    }

    const payload = await getPayload({ config: configPromise });
    const authResult = await authorizeEmbeddingMutation(request, payload);
    if (!authResult.authorized) {
      return getEmbeddingUnauthorizedResponse(authResult.reason);
    }

    const url = new URL(request.url);
    url.searchParams.set("regenerate", "true");
    return new Response(null, {
      status: 302,
      headers: { Location: url.toString() },
    });
  } catch {
    return json({ error: "Invalid request body" }, 400);
  }
}
