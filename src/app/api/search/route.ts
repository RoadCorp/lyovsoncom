import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import {
  hydrateSearchPreviewItems,
  runHybridSearch,
  SearchInputError,
} from "@/search/service";
import {
  getRequestUserAgent,
  shouldBlockExpensiveBotRequest,
} from "@/utilities/request-guards";

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get("q");
  const userAgent = getRequestUserAgent(request.headers);

  if (shouldBlockExpensiveBotRequest(request.nextUrl.pathname, userAgent)) {
    return NextResponse.json(
      {
        results: [],
        query: query ?? "",
        count: 0,
        message: "Search is not available to automated crawlers.",
        previewItems: [],
      },
      {
        status: 403,
        headers: {
          "Cache-Control": "no-store",
          "X-Robots-Tag": "noindex, nofollow",
        },
      }
    );
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = Number(searchParams.get("limit") ?? "10");
    const scopeUsername = searchParams.get("scope");
    const previewMode = searchParams.get("preview") === "true";
    const response = await runHybridSearch(query, {
      limit,
      scopeUsername,
    });
    const previewItems = previewMode
      ? await hydrateSearchPreviewItems(response.results)
      : undefined;

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
