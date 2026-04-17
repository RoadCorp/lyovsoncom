import { sql } from "@payloadcms/db-vercel-postgres/drizzle";
import type { Activity, Note, Post } from "@/payload-types";
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
import {
  activitiesRoute,
  activityRoute,
  noteRoute,
  postRoute,
} from "@/utilities/routes";
import type {
  SearchOptions,
  SearchPreviewItem,
  SearchResponse,
  SearchResult,
} from "./types";

const ACTIVITY_TYPE_LABELS = {
  learn: "Learn",
  listen: "Listened",
  play: "Played",
  read: "Read",
  visit: "Visited",
  watch: "Watched",
} as const;

const NOTE_PREVIEW_MAX_CHARS = 96;
const SEARCH_FAILURE_STATUS = 500;
const SEARCH_RRF_K = 60;
const SEARCH_WINDOW_MULTIPLIER = 2;

export const MIN_SEARCH_LIMIT = 1;
export const MAX_SEARCH_LIMIT = 50;

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

function getSearchWindow(limit: number) {
  return limit * SEARCH_WINDOW_MULTIPLIER;
}

async function getSearchVectorString(query: string) {
  const embeddingResult = await generateEmbedding(query);

  if (
    !embeddingResult?.vector ||
    embeddingResult.vector.length !== EMBEDDING_VECTOR_DIMENSIONS
  ) {
    throw new SearchInputError(
      "Failed to generate search embedding",
      SEARCH_FAILURE_STATUS
    );
  }

  return `[${embeddingResult.vector.join(",")}]`;
}

function mapHybridSearchRows(rows: HybridSearchRow[]): SearchResult[] {
  return rows.map((row) => ({
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
}

async function runScopedHybridSearch(
  query: string,
  limit: number,
  scopeUsername: string
): Promise<SearchResponse> {
  const payload = await getPayloadClient();
  const vectorString = await getSearchVectorString(query);
  const matchWindow = getSearchWindow(limit);

  const postsScope = sql`
    EXISTS (
      SELECT 1
      FROM posts_rels pr
      JOIN lyovsons l ON l.id = pr.lyovsons_id
      WHERE pr.parent_id = p.id
        AND l.username = ${scopeUsername}
    )
  `;

  const notesScope = sql`n.author = ${scopeUsername}`;

  const activitiesScope = sql`
    (
      EXISTS (
        SELECT 1
        FROM activities_rels ar
        JOIN lyovsons l ON l.id = ar.lyovsons_id
        WHERE ar.parent_id = a.id
          AND l.username = ${scopeUsername}
      )
      OR EXISTS (
        SELECT 1
        FROM activities_reviews arw
        JOIN lyovsons l ON l.id = arw.lyovson_id
        WHERE arw._parent_id = a.id
          AND l.username = ${scopeUsername}
      )
    )
  `;

  const result = await payload.db.drizzle.execute(sql`
    WITH
      posts_semantic_search AS (
        SELECT
          p.id,
          ROW_NUMBER() OVER (
            ORDER BY p.embedding_vector::vector(1536) <=> ${vectorString}::vector
          ) AS rank
        FROM posts p
        WHERE p._status = 'published'
          AND p.embedding_vector IS NOT NULL
          AND ${postsScope}
        ORDER BY p.embedding_vector::vector(1536) <=> ${vectorString}::vector
        LIMIT ${matchWindow}
      ),
      posts_fulltext_search AS (
        SELECT
          p.id,
          ROW_NUMBER() OVER (
            ORDER BY ts_rank(p.search_vector, websearch_to_tsquery('english', ${query})) DESC
          ) AS rank
        FROM posts p
        WHERE p._status = 'published'
          AND p.search_vector @@ websearch_to_tsquery('english', ${query})
          AND ${postsScope}
        ORDER BY ts_rank(p.search_vector, websearch_to_tsquery('english', ${query})) DESC
        LIMIT ${matchWindow}
      ),
      posts_fuzzy_search AS (
        SELECT
          p.id,
          ROW_NUMBER() OVER (
            ORDER BY GREATEST(
              similarity(p.title, ${query}),
              similarity(COALESCE(p.description, ''), ${query})
            ) DESC
          ) AS rank
        FROM posts p
        WHERE p._status = 'published'
          AND (
            p.title % ${query}
            OR COALESCE(p.description, '') % ${query}
          )
          AND ${postsScope}
        LIMIT ${matchWindow}
      ),
      notes_semantic_search AS (
        SELECT
          n.id,
          ROW_NUMBER() OVER (
            ORDER BY n.embedding_vector::vector(1536) <=> ${vectorString}::vector
          ) AS rank
        FROM notes n
        WHERE n._status = 'published'
          AND n.visibility = 'public'
          AND n.embedding_vector IS NOT NULL
          AND ${notesScope}
        ORDER BY n.embedding_vector::vector(1536) <=> ${vectorString}::vector
        LIMIT ${matchWindow}
      ),
      notes_fulltext_search AS (
        SELECT
          n.id,
          ROW_NUMBER() OVER (
            ORDER BY ts_rank(n.search_vector, websearch_to_tsquery('english', ${query})) DESC
          ) AS rank
        FROM notes n
        WHERE n._status = 'published'
          AND n.visibility = 'public'
          AND n.search_vector @@ websearch_to_tsquery('english', ${query})
          AND ${notesScope}
        ORDER BY ts_rank(n.search_vector, websearch_to_tsquery('english', ${query})) DESC
        LIMIT ${matchWindow}
      ),
      notes_fuzzy_search AS (
        SELECT
          n.id,
          ROW_NUMBER() OVER (
            ORDER BY similarity(n.title, ${query}) DESC
          ) AS rank
        FROM notes n
        WHERE n._status = 'published'
          AND n.visibility = 'public'
          AND n.title % ${query}
          AND ${notesScope}
        LIMIT ${matchWindow}
      ),
      activities_semantic_search AS (
        SELECT
          a.id,
          ROW_NUMBER() OVER (
            ORDER BY a.embedding_vector::vector(1536) <=> ${vectorString}::vector
          ) AS rank
        FROM activities a
        WHERE a._status = 'published'
          AND a.visibility = 'public'
          AND a.embedding_vector IS NOT NULL
          AND ${activitiesScope}
        ORDER BY a.embedding_vector::vector(1536) <=> ${vectorString}::vector
        LIMIT ${matchWindow}
      ),
      activities_fulltext_search AS (
        SELECT
          a.id,
          ROW_NUMBER() OVER (
            ORDER BY ts_rank(a.search_vector, websearch_to_tsquery('english', ${query})) DESC
          ) AS rank
        FROM activities a
        WHERE a._status = 'published'
          AND a.visibility = 'public'
          AND a.search_vector @@ websearch_to_tsquery('english', ${query})
          AND ${activitiesScope}
        ORDER BY ts_rank(a.search_vector, websearch_to_tsquery('english', ${query})) DESC
        LIMIT ${matchWindow}
      ),
      activities_fuzzy_search AS (
        SELECT
          a.id,
          ROW_NUMBER() OVER (
            ORDER BY similarity(COALESCE(a.content_text, ''), ${query}) DESC
          ) AS rank
        FROM activities a
        WHERE a._status = 'published'
          AND a.visibility = 'public'
          AND COALESCE(a.content_text, '') % ${query}
          AND ${activitiesScope}
        LIMIT ${matchWindow}
      )
    SELECT *
    FROM (
      SELECT
        'posts'::VARCHAR AS collection,
        p.id,
        p.title,
        p.slug,
        p.description,
        p.featured_image_id,
        p.created_at,
        p.updated_at,
        posts_semantic_search.rank AS semantic_rank,
        posts_fulltext_search.rank AS fts_rank,
        posts_fuzzy_search.rank AS fuzzy_rank,
        COALESCE(1.0 / (${SEARCH_RRF_K} + posts_semantic_search.rank), 0.0) * 0.4 +
        COALESCE(1.0 / (${SEARCH_RRF_K} + posts_fulltext_search.rank), 0.0) * 0.4 +
        COALESCE(1.0 / (${SEARCH_RRF_K} + posts_fuzzy_search.rank), 0.0) * 0.2 AS combined_score
      FROM posts p
      LEFT JOIN posts_semantic_search ON p.id = posts_semantic_search.id
      LEFT JOIN posts_fulltext_search ON p.id = posts_fulltext_search.id
      LEFT JOIN posts_fuzzy_search ON p.id = posts_fuzzy_search.id
      WHERE p._status = 'published'
        AND ${postsScope}
        AND (
          posts_semantic_search.id IS NOT NULL
          OR posts_fulltext_search.id IS NOT NULL
          OR posts_fuzzy_search.id IS NOT NULL
        )

      UNION ALL

      SELECT
        'notes'::VARCHAR AS collection,
        n.id,
        n.title,
        n.slug,
        NULL::VARCHAR AS description,
        NULL::INTEGER AS featured_image_id,
        n.created_at,
        n.updated_at,
        notes_semantic_search.rank AS semantic_rank,
        notes_fulltext_search.rank AS fts_rank,
        notes_fuzzy_search.rank AS fuzzy_rank,
        COALESCE(1.0 / (${SEARCH_RRF_K} + notes_semantic_search.rank), 0.0) * 0.4 +
        COALESCE(1.0 / (${SEARCH_RRF_K} + notes_fulltext_search.rank), 0.0) * 0.4 +
        COALESCE(1.0 / (${SEARCH_RRF_K} + notes_fuzzy_search.rank), 0.0) * 0.2 AS combined_score
      FROM notes n
      LEFT JOIN notes_semantic_search ON n.id = notes_semantic_search.id
      LEFT JOIN notes_fulltext_search ON n.id = notes_fulltext_search.id
      LEFT JOIN notes_fuzzy_search ON n.id = notes_fuzzy_search.id
      WHERE n._status = 'published'
        AND n.visibility = 'public'
        AND ${notesScope}
        AND (
          notes_semantic_search.id IS NOT NULL
          OR notes_fulltext_search.id IS NOT NULL
          OR notes_fuzzy_search.id IS NOT NULL
        )

      UNION ALL

      SELECT
        'activities'::VARCHAR AS collection,
        a.id,
        COALESCE(a.content_text, '')::VARCHAR AS title,
        a.slug,
        NULL::VARCHAR AS description,
        NULL::INTEGER AS featured_image_id,
        a.created_at,
        a.updated_at,
        activities_semantic_search.rank AS semantic_rank,
        activities_fulltext_search.rank AS fts_rank,
        activities_fuzzy_search.rank AS fuzzy_rank,
        COALESCE(1.0 / (${SEARCH_RRF_K} + activities_semantic_search.rank), 0.0) * 0.4 +
        COALESCE(1.0 / (${SEARCH_RRF_K} + activities_fulltext_search.rank), 0.0) * 0.4 +
        COALESCE(1.0 / (${SEARCH_RRF_K} + activities_fuzzy_search.rank), 0.0) * 0.2 AS combined_score
      FROM activities a
      LEFT JOIN activities_semantic_search ON a.id = activities_semantic_search.id
      LEFT JOIN activities_fulltext_search ON a.id = activities_fulltext_search.id
      LEFT JOIN activities_fuzzy_search ON a.id = activities_fuzzy_search.id
      WHERE a._status = 'published'
        AND a.visibility = 'public'
        AND ${activitiesScope}
        AND (
          activities_semantic_search.id IS NOT NULL
          OR activities_fulltext_search.id IS NOT NULL
          OR activities_fuzzy_search.id IS NOT NULL
        )
    ) ranked_results
    ORDER BY ranked_results.combined_score DESC
    LIMIT ${limit}
  `);

  const rows = result.rows as unknown as HybridSearchRow[];
  const results = mapHybridSearchRows(rows);

  return {
    results,
    query,
    count: results.length,
  };
}

async function runGlobalHybridSearch(
  query: string,
  limit: number
): Promise<SearchResponse> {
  const payload = await getPayloadClient();
  const vectorString = await getSearchVectorString(query);
  const result = await payload.db.drizzle.execute(
    sql`SELECT * FROM hybrid_search_content(
      ${query},
      ${vectorString}::vector,
      ${limit},
      ${SEARCH_RRF_K}
    )`
  );

  const rows = result.rows as unknown as HybridSearchRow[];
  const results = mapHybridSearchRows(rows);

  return {
    results,
    query,
    count: results.length,
  };
}

export function runHybridSearch(
  rawQuery: string | null,
  { limit, scopeUsername }: SearchOptions
): Promise<SearchResponse> {
  const query = validateSearchInput(rawQuery, limit);
  const normalizedScope = scopeUsername?.trim().toLowerCase() || null;

  if (normalizedScope) {
    return runScopedHybridSearch(query, limit, normalizedScope);
  }

  return runGlobalHybridSearch(query, limit);
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
    const excerpt = item.data.content
      ? truncateText(
          extractLexicalText(item.data.content).trim(),
          NOTE_PREVIEW_MAX_CHARS
        )
      : "";

    return {
      type: "note",
      href: noteRoute(item.data.slug || "unknown"),
      title: item.data.title,
      subtitle: item.data.type === "quote" ? "Quote" : "Thought",
      description: excerpt || null,
    };
  }

  const activityHref = activityRoute(item.data) || activitiesRoute();
  const activityTypeLabel =
    ACTIVITY_TYPE_LABELS[item.data.activityType] || item.data.activityType;
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
