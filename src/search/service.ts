import { cacheLife } from "next/cache";
import { cache } from "react";
import type { Activity, Note, Post } from "@/payload-types";
import { getActivityTypeLabel } from "@/utilities/activity-type";
import {
  publicActivitiesWhere,
  publicNotesWhere,
  publishedPostsWhere,
} from "@/utilities/content-queries";
import { extractLexicalText } from "@/utilities/extract-lexical-text";
import {
  EMBEDDING_VECTOR_DIMENSIONS,
  generateEmbedding,
} from "@/utilities/generate-embedding";
import { getPayloadClient } from "@/utilities/payload-client";
import { publicContentSelect } from "@/utilities/public-content-select";
import {
  activitiesRoute,
  activityRoute,
  noteRoute,
  postRoute,
} from "@/utilities/routes";
import { parseHybridSearchRows } from "./rows";
import { globalHybridSearchSql, scopedHybridSearchSql } from "./sql";
import type {
  SearchOptions,
  SearchPreviewItem,
  SearchResponse,
  SearchResult,
} from "./types";

const NOTE_PREVIEW_MAX_CHARS = 96;
const SEARCH_WINDOW_MULTIPLIER = 2;

export const MAX_SEARCH_QUERY_LENGTH = 200;
export const MIN_SEARCH_LIMIT = 1;
export const MAX_SEARCH_LIMIT = 50;

export type HydratedSearchItem =
  | { type: "activity"; data: Activity }
  | { type: "note"; data: Note }
  | { type: "post"; data: Post };

export class SearchInputError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = "SearchInputError";
    this.status = status;
  }
}

export function validateSearchInput(query: string | null, limit: number) {
  if (!query || query.trim().length === 0) {
    throw new SearchInputError("No search query provided");
  }

  if (query.trim().length > MAX_SEARCH_QUERY_LENGTH) {
    throw new SearchInputError(
      `Search query must be at most ${MAX_SEARCH_QUERY_LENGTH} characters`
    );
  }

  if (
    !Number.isInteger(limit) ||
    limit < MIN_SEARCH_LIMIT ||
    limit > MAX_SEARCH_LIMIT
  ) {
    throw new SearchInputError("Limit must be an integer between 1 and 50");
  }

  return query.trim();
}

function getSearchWindow(limit: number) {
  return limit * SEARCH_WINDOW_MULTIPLIER;
}

// Repeated queries reuse the embedding instead of another provider call.
// Failures are not cached, so a recovered provider is used on the next request.
async function getCachedQueryVector(normalizedQuery: string) {
  "use cache";
  cacheLife("search");

  const embeddingResult = await generateEmbedding(normalizedQuery);

  if (embeddingResult?.vector?.length !== EMBEDDING_VECTOR_DIMENSIONS) {
    throw new Error("Unexpected search embedding dimensions");
  }

  return `[${embeddingResult.vector.join(",")}]`;
}

/**
 * The query embedding, or null when the provider is unavailable. With a null
 * embedding the search SQL skips semantic ranking and still answers from
 * full-text and trigram matches.
 */
async function getSearchVectorString(query: string): Promise<string | null> {
  // Without a key there is nothing to call; skip it rather than throwing
  // inside the cached function, which Next logs as a render error.
  if (!process.env.OPENAI_API_KEY) {
    return null;
  }

  try {
    return await getCachedQueryVector(query.toLowerCase().replace(/\s+/g, " "));
  } catch (error) {
    const payload = await getPayloadClient();
    payload.logger.warn({
      msg: "search.embedding.unavailable",
      error: error instanceof Error ? error.message : String(error),
    });
    return null;
  }
}

async function runScopedHybridSearch(
  query: string,
  limit: number,
  scopeUsername: string
): Promise<SearchResponse> {
  const payload = await getPayloadClient();
  const vectorString = await getSearchVectorString(query);
  const result = await payload.db.drizzle.execute(
    scopedHybridSearchSql({
      query,
      vectorString,
      limit,
      matchWindow: getSearchWindow(limit),
      scopeUsername,
    })
  );

  return toSearchResponse(query, result.rows);
}

async function runGlobalHybridSearch(
  query: string,
  limit: number
): Promise<SearchResponse> {
  const payload = await getPayloadClient();
  const vectorString = await getSearchVectorString(query);
  const result = await payload.db.drizzle.execute(
    globalHybridSearchSql({ query, vectorString, limit })
  );

  return toSearchResponse(query, result.rows);
}

function toSearchResponse(
  query: string,
  rows: readonly Record<string, unknown>[]
): SearchResponse {
  const results = parseHybridSearchRows(rows);

  return {
    results,
    query,
    count: results.length,
  };
}

const runSearchForRequest = cache(
  (query: string, limit: number, scope: string | null) =>
    scope
      ? runScopedHybridSearch(query, limit, scope)
      : runGlobalHybridSearch(query, limit)
);

export function runHybridSearch(
  rawQuery: string | null,
  { limit, scopeUsername }: SearchOptions
): Promise<SearchResponse> {
  const query = validateSearchInput(rawQuery, limit);
  const normalizedScope = scopeUsername?.trim().toLowerCase() || null;

  return runSearchForRequest(query, limit, normalizedScope);
}

export async function hydrateSearchResults(results: SearchResult[]) {
  if (results.length === 0) {
    return [];
  }

  const payload = await getPayloadClient();
  const postsResults = results.filter(
    (result) => result.collection === "posts"
  );
  const notesResults = results.filter(
    (result) => result.collection === "notes"
  );
  const activitiesResults = results.filter(
    (result) => result.collection === "activities"
  );

  const [postsResponse, notesResponse, activitiesResponse] = await Promise.all([
    postsResults.length > 0
      ? payload.find({
          collection: "posts",
          where: {
            AND: [
              publishedPostsWhere(),
              {
                id: {
                  in: postsResults.map((result) => result.id),
                },
              },
            ],
          },
          // Post cards and previews never use second-level relations.
          depth: 1,
          select: publicContentSelect,
          limit: postsResults.length,
        })
      : Promise.resolve({ docs: [] as Post[] }),
    notesResults.length > 0
      ? payload.find({
          collection: "notes",
          where: {
            AND: [
              publicNotesWhere(),
              {
                id: {
                  in: notesResults.map((result) => result.id),
                },
              },
            ],
          },
          depth: 1,
          select: publicContentSelect,
          limit: notesResults.length,
        })
      : Promise.resolve({ docs: [] as Note[] }),
    activitiesResults.length > 0
      ? payload.find({
          collection: "activities",
          where: {
            AND: [
              publicActivitiesWhere(),
              {
                id: {
                  in: activitiesResults.map((result) => result.id),
                },
              },
            ],
          },
          depth: 2,
          select: publicContentSelect,
          limit: activitiesResults.length,
          overrideAccess: true,
        })
      : Promise.resolve({ docs: [] as Activity[] }),
  ]);

  const postsMap = new Map(postsResponse.docs.map((post) => [post.id, post]));
  const notesMap = new Map(notesResponse.docs.map((note) => [note.id, note]));
  const activitiesMap = new Map(
    activitiesResponse.docs.map((activity) => [activity.id, activity])
  );

  return results.flatMap<HydratedSearchItem>((result) => {
    if (result.collection === "posts") {
      const post = postsMap.get(result.id);
      return post ? [{ type: "post", data: post }] : [];
    }

    if (result.collection === "notes") {
      const note = notesMap.get(result.id);
      return note ? [{ type: "note", data: note }] : [];
    }

    const activity = activitiesMap.get(result.id);
    return activity ? [{ type: "activity", data: activity }] : [];
  });
}

function truncateText(value: string, maxChars: number) {
  if (value.length <= maxChars) {
    return value;
  }

  return `${value.slice(0, maxChars).trimEnd()}...`;
}

function getSearchPreviewItem(
  item: HydratedSearchItem
): SearchPreviewItem | null {
  if (item.type === "post") {
    const postType = item.data.type ? item.data.type : "post";

    return {
      type: "post",
      href: postRoute(item.data.slug || "unknown"),
      title: item.data.title,
      subtitle: postType.charAt(0).toUpperCase() + postType.slice(1),
      description: item.data.description || null,
    };
  }

  if (item.type === "note") {
    const excerpt = truncateText(
      extractLexicalText(item.data.content).trim(),
      NOTE_PREVIEW_MAX_CHARS
    );

    return {
      type: "note",
      href: noteRoute(item.data.slug || "unknown"),
      title: item.data.title,
      subtitle: item.data.type === "quote" ? "Quote" : "Thought",
      description: excerpt || null,
    };
  }

  const activityHref = activityRoute(item.data) || activitiesRoute();
  const activityTypeLabel = getActivityTypeLabel(item.data.activityType);
  const referenceTitle =
    typeof item.data.reference === "object" && item.data.reference?.title
      ? item.data.reference.title
      : "Activity";

  return {
    type: "activity",
    href: activityHref,
    title: referenceTitle,
    subtitle: `${activityTypeLabel} activity`,
    description: null,
  };
}

export async function hydrateSearchPreviewItems(results: SearchResult[]) {
  const hydratedItems = await hydrateSearchResults(results);

  return hydratedItems.flatMap<SearchPreviewItem>((item) => {
    const previewItem = getSearchPreviewItem(item);
    return previewItem ? [previewItem] : [];
  });
}
