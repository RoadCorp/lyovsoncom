import type { NextRequest } from "next/server";
import { after, NextResponse } from "next/server";
import {
  hydrateSearchPreviewItems,
  runHybridSearch,
  SearchInputError,
} from "@/search/service";
import { getPayloadClient } from "@/utilities/payload-client";

const SEARCH_FAILURE_STATUS = 500;

function logSearchRouteFailure(
  startedAt: number,
  query: string | null,
  error: unknown
) {
  after(async () => {
    const payload = await getPayloadClient();
    payload.logger.error({
      msg: "api.search.failed",
      durationMs: Date.now() - startedAt,
      query,
      queryLength: query?.length ?? 0,
      error: error instanceof Error ? error.message : "Unknown error",
    });
  });
}

export async function GET(request: NextRequest) {
  const startedAt = Date.now();
  const query = request.nextUrl.searchParams.get("q");

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Number.parseInt(searchParams.get("limit") || "10", 10);
    const scopeUsername = searchParams.get("scope");
    const previewMode = searchParams.get("preview") === "true";
    const response = await runHybridSearch(query, {
      limit,
      scopeUsername,
    });
    const previewItems = previewMode
      ? await hydrateSearchPreviewItems(response.results)
      : undefined;

    after(async () => {
      const payload = await getPayloadClient();
      payload.logger.info({
        msg: "api.search.completed",
        durationMs: Date.now() - startedAt,
        queryLength: response.query.length,
        resultCount: response.count,
        previewMode,
        scopeUsername: scopeUsername || null,
      });
    });

    return NextResponse.json(
      {
        ...response,
        ...(previewItems ? { previewItems } : {}),
      },
      {
        headers: {
          "Cache-Control":
            "public, max-age=300, s-maxage=600, stale-while-revalidate=1800", // Cache 5-10 min, stale up to 30 min
          "Access-Control-Allow-Origin": "*",
        },
      }
    );
  } catch (error) {
    if (error instanceof SearchInputError) {
      if (error.status >= SEARCH_FAILURE_STATUS) {
        logSearchRouteFailure(startedAt, query, error);
      }

      return NextResponse.json(
        {
          results: [],
          query: query ?? "",
          count: 0,
          message: error.message,
          previewItems: [],
        },
        { status: error.status }
      );
    }

    logSearchRouteFailure(startedAt, query, error);

    return NextResponse.json(
      {
        results: [],
        query: "",
        count: 0,
        message: "Search failed",
        error: error instanceof Error ? error.message : "Unknown error",
        previewItems: [],
      },
      { status: 500 }
    );
  }
}
