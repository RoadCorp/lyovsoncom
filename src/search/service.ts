import { sql } from "@payloadcms/db-vercel-postgres/drizzle";
import type { Activity, Note, Post } from "@/payload-types";
import {
  publicActivitiesWhere,
  publicNotesWhere,
  publishedPostsWhere,
} from "@/utilities/content-queries";
import {
  EMBEDDING_VECTOR_DIMENSIONS,
  generateEmbedding,
} from "@/utilities/generate-embedding";
import { getPayloadClient } from "@/utilities/payload-client";

export const MIN_SEARCH_LIMIT = 1;
export const MAX_SEARCH_LIMIT = 50;
const EMBEDDING_GENERATION_FAILURE_STATUS = 500;

export interface SearchResult {
  collection: string;
  combined_score: number;
  created_at: string;
  description: string | null;
  featured_image_id: number | null;
  fts_rank: number | null;
  fuzzy_rank: number | null;
  id: number;
  semantic_rank: number | null;
  slug: string;
  title: string;
  updated_at: string;
}

interface HybridSearchRow {
  collection: string;
  combined_score: string;
  created_at: Date;
  description: string | null;
  featured_image_id: number | null;
  fts_rank: bigint | null;
  fuzzy_rank: bigint | null;
  id: number;
  semantic_rank: bigint | null;
  slug: string;
  title: string;
  updated_at: Date;
}

export type HydratedSearchItem =
  | { type: "activity"; data: Activity }
  | { type: "note"; data: Note }
  | { type: "post"; data: Post };

export interface SearchResponse {
  count: number;
  query: string;
  results: SearchResult[];
}

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

  if (limit < MIN_SEARCH_LIMIT || limit > MAX_SEARCH_LIMIT) {
    throw new SearchInputError("Limit must be between 1 and 50");
  }

  return query.trim();
}

export async function runHybridSearch(
  rawQuery: string | null,
  limit: number
): Promise<SearchResponse> {
  const query = validateSearchInput(rawQuery, limit);
  const embeddingResult = await generateEmbedding(query);

  if (
    !embeddingResult?.vector ||
    embeddingResult.vector.length !== EMBEDDING_VECTOR_DIMENSIONS
  ) {
    throw new SearchInputError(
      "Failed to generate search embedding",
      EMBEDDING_GENERATION_FAILURE_STATUS
    );
  }

  const payload = await getPayloadClient();
  const vectorString = `[${embeddingResult.vector.join(",")}]`;
  const result = await payload.db.drizzle.execute(
    sql`SELECT * FROM hybrid_search_content(
      ${query},
      ${vectorString}::vector,
      ${limit},
      60
    )`
  );

  const rows = result.rows as unknown as HybridSearchRow[];
  const results: SearchResult[] = rows.map((row) => ({
    collection: row.collection || "posts",
    id: row.id,
    title: row.title || "",
    slug: row.slug || "",
    description: row.description || null,
    featured_image_id: row.featured_image_id || null,
    created_at:
      row.created_at instanceof Date
        ? row.created_at.toISOString()
        : new Date(row.created_at).toISOString(),
    updated_at:
      row.updated_at instanceof Date
        ? row.updated_at.toISOString()
        : new Date(row.updated_at).toISOString(),
    semantic_rank: row.semantic_rank ? Number(row.semantic_rank) : null,
    fts_rank: row.fts_rank ? Number(row.fts_rank) : null,
    fuzzy_rank: row.fuzzy_rank ? Number(row.fuzzy_rank) : null,
    combined_score: Number.parseFloat(row.combined_score),
  }));

  return {
    results,
    query,
    count: results.length,
  };
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
          depth: 2,
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
