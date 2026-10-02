import { type SQL, sql } from "@payloadcms/db-vercel-postgres/drizzle";

export const SEARCH_RRF_K = 60;

export interface HybridSearchSqlParams {
  limit: number;
  query: string;
  /** Query embedding as a pgvector literal; null skips semantic ranking. */
  vectorString: string | null;
}

interface ScopedSearchSqlParams extends HybridSearchSqlParams {
  /** Candidate rows per ranking method before rank fusion. */
  matchWindow: number;
  scopeUsername: string;
}

interface ScopePredicates {
  activities: SQL;
  notes: SQL;
  posts: SQL;
}

/** Ownership predicates that limit each collection to one profile. */
function scopePredicates(scopeUsername: string): ScopePredicates {
  return {
    posts: sql`
      EXISTS (
        SELECT 1
        FROM posts_rels pr
        JOIN lyovsons l ON l.id = pr.lyovsons_id
        WHERE pr.parent_id = p.id
          AND l.username = ${scopeUsername}
      )
    `,
    notes: sql`n.author = ${scopeUsername}`,
    activities: sql`
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
    `,
  };
}

function postsRankingCtes(
  { matchWindow, query, vectorString }: ScopedSearchSqlParams,
  scope: SQL
) {
  return sql`
      posts_semantic_search AS (
        SELECT
          p.id,
          ROW_NUMBER() OVER (
            ORDER BY p.embedding_vector::vector(1536) <=> ${vectorString}::vector
          ) AS rank
        FROM posts p
        WHERE ${vectorString}::vector IS NOT NULL
          AND p._status = 'published'
          AND p.embedding_vector IS NOT NULL
          AND ${scope}
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
          AND ${scope}
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
          AND ${scope}
        LIMIT ${matchWindow}
      )`;
}

function notesRankingCtes(
  { matchWindow, query, vectorString }: ScopedSearchSqlParams,
  scope: SQL
) {
  return sql`
      notes_semantic_search AS (
        SELECT
          n.id,
          ROW_NUMBER() OVER (
            ORDER BY n.embedding_vector::vector(1536) <=> ${vectorString}::vector
          ) AS rank
        FROM notes n
        WHERE ${vectorString}::vector IS NOT NULL
          AND n._status = 'published'
          AND n.visibility = 'public'
          AND n.embedding_vector IS NOT NULL
          AND ${scope}
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
          AND ${scope}
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
          AND ${scope}
        LIMIT ${matchWindow}
      )`;
}

function activitiesRankingCtes(
  { matchWindow, query, vectorString }: ScopedSearchSqlParams,
  scope: SQL
) {
  return sql`
      activities_semantic_search AS (
        SELECT
          a.id,
          ROW_NUMBER() OVER (
            ORDER BY a.embedding_vector::vector(1536) <=> ${vectorString}::vector
          ) AS rank
        FROM activities a
        WHERE ${vectorString}::vector IS NOT NULL
          AND a._status = 'published'
          AND a.visibility = 'public'
          AND a.embedding_vector IS NOT NULL
          AND ${scope}
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
          AND ${scope}
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
          AND ${scope}
        LIMIT ${matchWindow}
      )`;
}

/** Fuses the three per-collection rankings into one score per document. */
function rankedResults(scopes: ScopePredicates) {
  return sql`
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
        AND ${scopes.posts}
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
        AND ${scopes.notes}
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
        AND ${scopes.activities}
        AND (
          activities_semantic_search.id IS NOT NULL
          OR activities_fulltext_search.id IS NOT NULL
          OR activities_fuzzy_search.id IS NOT NULL
        )`;
}

/**
 * Hybrid search limited to one profile's content. Semantic, full-text and
 * trigram rankings are fused with reciprocal rank fusion (weights 0.4/0.4/0.2).
 */
export function scopedHybridSearchSql(params: ScopedSearchSqlParams): SQL {
  const scopes = scopePredicates(params.scopeUsername);

  return sql`
    WITH
      ${postsRankingCtes(params, scopes.posts)},
      ${notesRankingCtes(params, scopes.notes)},
      ${activitiesRankingCtes(params, scopes.activities)}
    SELECT *
    FROM (${rankedResults(scopes)}
    ) ranked_results
    ORDER BY ranked_results.combined_score DESC
    LIMIT ${params.limit}
  `;
}

/** Site-wide hybrid search through the `hybrid_search_content` database function. */
export function globalHybridSearchSql({
  limit,
  query,
  vectorString,
}: HybridSearchSqlParams): SQL {
  return sql`SELECT * FROM hybrid_search_content(
      ${query},
      ${vectorString}::vector,
      ${limit},
      ${SEARCH_RRF_K}
    )`;
}
