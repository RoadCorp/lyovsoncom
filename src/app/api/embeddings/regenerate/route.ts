import configPromise from "@payload-config";
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import type { PayloadRequest } from "payload";
import { getPayload } from "payload";
import { logApiTelemetry } from "@/utilities/api-telemetry";
import {
  generateEmbeddingForActivity,
  generateEmbeddingForNote,
  generateEmbeddingForPost,
} from "@/utilities/generate-embedding-helpers";

interface RegenerateEmbeddingBody {
  collection?: "posts" | "notes" | "activities";
  force?: boolean;
  id?: number | string;
}

interface EmbeddingResult {
  error?: string;
  success: boolean;
}

/* biome-ignore lint/complexity/noExcessiveCognitiveComplexity: Endpoint handles validation + auth + multiple collection paths */
export async function POST(request: NextRequest) {
  const startedAt = Date.now();
  try {
    const payload = await getPayload({ config: configPromise });

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

    if (
      collection !== "posts" &&
      collection !== "notes" &&
      collection !== "activities"
    ) {
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

    // Authentication check
    // Allow authenticated admins or requests with valid CRON_SECRET
    const authHeader = request.headers.get("authorization");
    const cronSecret = authHeader?.replace("Bearer ", "");
    const hasValidSecret = cronSecret && cronSecret === process.env.CRON_SECRET;

    // Create a mock request object for the helper functions
    // In a real Payload request context, req.user would be available
    // For API routes, we'll use the payload instance directly
    const mockReq = {
      payload,
      user: null, // Will be set if authenticated via Payload session
    } as unknown as PayloadRequest;

    // Try to get authenticated user from Payload session
    // This allows calling from Payload admin UI
    try {
      const { user } = await payload.auth({ headers: request.headers });
      if (user) {
        mockReq.user = user;
      }
    } catch {
      // Not authenticated via Payload session, check CRON_SECRET
      if (!hasValidSecret) {
        return NextResponse.json(
          {
            error:
              "Unauthorized. Requires admin authentication or valid CRON_SECRET",
          },
          { status: 401 }
        );
      }
    }

    // Fetch document to get current embedding info
    const doc = await payload.findByID({
      collection: collection as "posts" | "notes" | "activities",
      id: docId,
      select: {
        id: true,
        title: true,
        embedding_model: true,
        embedding_dimensions: true,
      },
    });

    if (!doc) {
      return NextResponse.json(
        { error: `${collection} not found` },
        { status: 404 }
      );
    }

    // If force is true, clear the hash to force regeneration
    if (force) {
      await payload.update({
        collection: collection as "posts" | "notes" | "activities",
        id: docId,
        data: {
          embedding_text_hash: null,
        },
        context: {
          skipEmbeddingGeneration: true,
          skipRecommendationCompute: collection === "posts",
          skipRevalidation: true,
        },
      });
    }

    // Call appropriate helper function
    let result: EmbeddingResult;
    if (collection === "posts") {
      result = await generateEmbeddingForPost(docId, mockReq);
    } else if (collection === "notes") {
      result = await generateEmbeddingForNote(docId, mockReq);
    } else {
      result = await generateEmbeddingForActivity(docId, mockReq);
    }

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: result.error || "Failed to regenerate embedding",
        },
        { status: 500 }
      );
    }

    // Fetch updated document to get embedding details
    const updatedDoc = await payload.findByID({
      collection: collection as "posts" | "notes" | "activities",
      id: docId,
      select: {
        embedding_model: true,
        embedding_dimensions: true,
        recommended_post_ids: true,
      },
    });

    const updatedEmbedding = updatedDoc as unknown as {
      embedding_model?: string | null;
      embedding_dimensions?: number | null;
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
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
