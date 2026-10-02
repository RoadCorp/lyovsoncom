import configPromise from "@payload-config";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getPayload } from "payload";
import { logApiTelemetry } from "@/utilities/api-telemetry";
import {
  authorizeEmbeddingMutation,
  getEmbeddingUnauthorizedResponse,
  hasEmbeddingAuthHint,
} from "@/utilities/embedding-auth";
import {
  type EmbeddableCollection,
  generateEmbeddingFor,
  isEmbeddableCollection,
} from "@/utilities/generate-embedding-helpers";

interface RegenerateEmbeddingBody {
  collection?: EmbeddableCollection;
  force?: boolean;
  id?: number | string;
}

export async function POST(request: NextRequest) {
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

    // Parse request body
    let body: RegenerateEmbeddingBody | null = null;
    try {
      const parsed = (await request.json()) as unknown;
      if (parsed && typeof parsed === "object") {
        body = parsed as RegenerateEmbeddingBody;
      }
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { collection, id, force } = body || {};

    // Validate required fields
    if (!(collection && id)) {
      return NextResponse.json(
        { error: "collection and id are required" },
        { status: 400 }
      );
    }

    if (!isEmbeddableCollection(collection)) {
      return NextResponse.json(
        { error: 'collection must be "posts", "notes", or "activities"' },
        { status: 400 }
      );
    }

    const docId = Number.parseInt(String(id), 10);
    if (Number.isNaN(docId)) {
      return NextResponse.json(
        { error: "id must be a valid number" },
        { status: 400 }
      );
    }

    const exists = await payload.findByID({
      collection,
      id: docId,
      depth: 0,
      select: {},
      disableErrors: true,
    });

    if (!exists) {
      return NextResponse.json(
        { error: `${collection} not found` },
        { status: 404 }
      );
    }

    // force re-embeds even when the text hash is unchanged.
    const result = await generateEmbeddingFor(collection, docId, payload, {
      force: force === true,
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to regenerate embedding",
        },
        { status: 500 }
      );
    }

    // Fetch the stored embedding details for the response.
    const updatedEmbedding = (await payload.findByID({
      collection,
      id: docId,
      depth: 0,
      select: {
        embedding_model: true,
        embedding_dimensions: true,
        ...(collection === "posts" ? { recommended_post_ids: true } : {}),
      },
    })) as {
      embedding_dimensions?: number | null;
      embedding_model?: string | null;
      recommended_post_ids?: unknown;
    };

    const responseBody = {
      success: true,
      message: "Embedding regenerated successfully",
      model: updatedEmbedding.embedding_model || "unknown",
      dimensions: updatedEmbedding.embedding_dimensions || 0,
      recommendationsUpdated: !!(
        collection === "posts" && updatedEmbedding.recommended_post_ids
      ),
    };

    logApiTelemetry({
      route: "api.embeddings.regenerate.completed",
      startedAt,
      summary: {
        collection,
        dimensions: responseBody.dimensions,
        id: docId,
        recommendationsUpdated: responseBody.recommendationsUpdated,
        status: 200,
      },
    });

    return NextResponse.json(responseBody, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    logApiTelemetry({
      route: "api.embeddings.regenerate.failed",
      startedAt,
      level: "error",
      summary: {
        status: 500,
        error: errorMessage,
      },
    });

    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    );
  }
}
