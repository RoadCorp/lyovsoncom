import type { NextRequest } from "next/server";
import type { Payload } from "payload";

interface EmbeddingMutationAuthResult {
  authorized: boolean;
  reason?: string;
}

export function hasEmbeddingAuthHint(request: NextRequest) {
  const authHeader = request.headers.get("authorization");
  const payloadToken = request.cookies.get("payload-token")?.value;

  return Boolean(authHeader || payloadToken);
}

export function getEmbeddingUnauthorizedResponse(reason?: string) {
  return Response.json(
    {
      error:
        reason ||
        "Unauthorized. Embedding endpoints require admin authentication or valid CRON_SECRET.",
    },
    {
      status: 401,
      headers: {
        "Cache-Control": "no-store",
        "X-Robots-Tag": "noindex, nofollow",
      },
    }
  );
}

export async function authorizeEmbeddingMutation(
  request: NextRequest,
  payload: Payload
): Promise<EmbeddingMutationAuthResult> {
  const authHeader = request.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (bearerToken && bearerToken === process.env.CRON_SECRET) {
    return { authorized: true };
  }

  try {
    const { user } = await payload.auth({ headers: request.headers });
    if (user) {
      return { authorized: true };
    }
  } catch {
    // Fall through to explicit unauthorized response.
  }

  return {
    authorized: false,
    reason:
      "Unauthorized. Regeneration requires admin authentication or valid CRON_SECRET.",
  };
}
