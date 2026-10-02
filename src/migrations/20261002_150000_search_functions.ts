import {
  type MigrateDownArgs,
  type MigrateUpArgs,
  sql,
} from "@payloadcms/db-vercel-postgres";

// Hybrid search (semantic + full-text + trigram, fused by reciprocal rank).
// These functions previously existed only in production, applied by hand from
// src/utilities/migrations/*.sql. Definitions match production on 2 October
// 2026, plus two guards:
// - semantic ranks are skipped when query_embedding is NULL, so search can fall
//   back to full-text and trigram when the embedding provider is unavailable;
// - private notes and activities never take result slots.
// CREATE OR REPLACE keeps this idempotent on databases that already have them.
export async function up({ db }: MigrateUpArgs): Promise<void> {
  await db.execute(sql`
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE OR REPLACE FUNCTION public.hybrid_search_posts(query_text text, query_embedding vector, match_count integer DEFAULT 10, rrf_k integer DEFAULT 60)
 RETURNS TABLE(id integer, title character varying, slug character varying, description character varying, featured_image_id integer, created_at timestamp with time zone, updated_at timestamp with time zone, semantic_rank bigint, fts_rank bigint, fuzzy_rank bigint, combined_score numeric)
 LANGUAGE plpgsql
AS $function$
BEGIN
  RETURN QUERY
  WITH semantic_search AS (
    SELECT
      posts.id,
      ROW_NUMBER() OVER (ORDER BY posts.embedding_vector::vector(1536) <=> query_embedding) AS rank
    FROM posts
    WHERE
      query_embedding IS NOT NULL
      AND posts._status = 'published'
      AND posts.embedding_vector IS NOT NULL
    ORDER BY posts.embedding_vector::vector(1536) <=> query_embedding
    LIMIT match_count
  ),
  fulltext_search AS (
    SELECT
      posts.id,
      ROW_NUMBER() OVER (ORDER BY ts_rank(posts.search_vector, websearch_to_tsquery('english', query_text)) DESC) AS rank
    FROM posts
    WHERE
      posts._status = 'published'
      AND posts.search_vector @@ websearch_to_tsquery('english', query_text)
    ORDER BY ts_rank(posts.search_vector, websearch_to_tsquery('english', query_text)) DESC
    LIMIT match_count * 2
  ),
  fuzzy_search AS (
    SELECT
      posts.id,
      ROW_NUMBER() OVER (
        ORDER BY
          GREATEST(
            similarity(posts.title, query_text),
            similarity(COALESCE(posts.description, ''), query_text)
          ) DESC
      ) AS rank
    FROM posts
    WHERE
      posts._status = 'published'
      AND (
        posts.title % query_text
        OR COALESCE(posts.description, '') % query_text
      )
    LIMIT match_count * 2
  )
  SELECT
    posts.id,
    posts.title,
    posts.slug,
    posts.description,
    posts.featured_image_id,
    posts.created_at,
    posts.updated_at,
    semantic_search.rank AS semantic_rank,
    fulltext_search.rank AS fts_rank,
    fuzzy_search.rank AS fuzzy_rank,
    COALESCE(1.0 / (rrf_k + semantic_search.rank), 0.0) * 0.4 +
    COALESCE(1.0 / (rrf_k + fulltext_search.rank), 0.0) * 0.4 +
    COALESCE(1.0 / (rrf_k + fuzzy_search.rank), 0.0) * 0.2 AS combined_score
  FROM posts
  LEFT JOIN semantic_search ON posts.id = semantic_search.id
  LEFT JOIN fulltext_search ON posts.id = fulltext_search.id
  LEFT JOIN fuzzy_search ON posts.id = fuzzy_search.id
  WHERE
    posts._status = 'published'
    AND (
      fulltext_search.id IS NOT NULL
      OR fuzzy_search.id IS NOT NULL
    )
  ORDER BY combined_score DESC
  LIMIT match_count;
END;
$function$;

CREATE OR REPLACE FUNCTION public.hybrid_search_notes(query_text text, query_embedding vector, match_count integer DEFAULT 10, rrf_k integer DEFAULT 60)
 RETURNS TABLE(id integer, title character varying, slug character varying, description character varying, featured_image_id integer, created_at timestamp with time zone, updated_at timestamp with time zone, semantic_rank bigint, fts_rank bigint, fuzzy_rank bigint, combined_score numeric)
 LANGUAGE sql
AS $function$
WITH semantic_search AS (
  SELECT
    n.id,
    ROW_NUMBER() OVER (ORDER BY n.embedding_vector::vector(1536) <=> query_embedding) AS rank
  FROM notes n
  WHERE query_embedding IS NOT NULL
    AND n._status = 'published'
    AND n.visibility = 'public'
    AND n.embedding_vector IS NOT NULL
  ORDER BY n.embedding_vector::vector(1536) <=> query_embedding
  LIMIT match_count * 2
),
fulltext_search AS (
  SELECT
    n.id,
    ROW_NUMBER() OVER (
      ORDER BY ts_rank(n.search_vector, websearch_to_tsquery('english', query_text)) DESC
    ) AS rank
  FROM notes n
  WHERE n._status = 'published'
    AND n.visibility = 'public'
    AND n.search_vector @@ websearch_to_tsquery('english', query_text)
  ORDER BY ts_rank(n.search_vector, websearch_to_tsquery('english', query_text)) DESC
  LIMIT match_count * 2
),
fuzzy_search AS (
  SELECT
    n.id,
    ROW_NUMBER() OVER (ORDER BY similarity(n.title, query_text) DESC) AS rank
  FROM notes n
  WHERE n._status = 'published'
    AND n.visibility = 'public'
    AND n.title % query_text
  LIMIT match_count * 2
)
SELECT
  n.id,
  n.title,
  n.slug,
  NULL::VARCHAR AS description,
  NULL::INTEGER AS featured_image_id,
  n.created_at,
  n.updated_at,
  semantic_search.rank AS semantic_rank,
  fulltext_search.rank AS fts_rank,
  fuzzy_search.rank AS fuzzy_rank,
  COALESCE(1.0 / (rrf_k + semantic_search.rank), 0.0) * 0.4 +
  COALESCE(1.0 / (rrf_k + fulltext_search.rank), 0.0) * 0.4 +
  COALESCE(1.0 / (rrf_k + fuzzy_search.rank), 0.0) * 0.2 AS combined_score
FROM notes n
LEFT JOIN semantic_search ON n.id = semantic_search.id
LEFT JOIN fulltext_search ON n.id = fulltext_search.id
LEFT JOIN fuzzy_search ON n.id = fuzzy_search.id
WHERE n._status = 'published'
  AND n.visibility = 'public'
  AND (
    semantic_search.id IS NOT NULL
    OR fulltext_search.id IS NOT NULL
    OR fuzzy_search.id IS NOT NULL
  )
ORDER BY combined_score DESC
LIMIT match_count
$function$;

CREATE OR REPLACE FUNCTION public.hybrid_search_activities(query_text text, query_embedding vector, match_count integer DEFAULT 10, rrf_k integer DEFAULT 60)
 RETURNS TABLE(id integer, title character varying, slug character varying, description character varying, featured_image_id integer, created_at timestamp with time zone, updated_at timestamp with time zone, semantic_rank bigint, fts_rank bigint, fuzzy_rank bigint, combined_score numeric)
 LANGUAGE sql
AS $function$
WITH semantic_search AS (
  SELECT
    a.id,
    ROW_NUMBER() OVER (ORDER BY a.embedding_vector::vector(1536) <=> query_embedding) AS rank
  FROM activities a
  WHERE query_embedding IS NOT NULL
    AND a._status = 'published'
    AND a.visibility = 'public'
    AND a.embedding_vector IS NOT NULL
  ORDER BY a.embedding_vector::vector(1536) <=> query_embedding
  LIMIT match_count * 2
),
fulltext_search AS (
  SELECT
    a.id,
    ROW_NUMBER() OVER (
      ORDER BY ts_rank(
        to_tsvector('english', COALESCE(r.title, '') || ' ' || COALESCE(a.content_text, '')),
        websearch_to_tsquery('english', query_text)
      ) DESC
    ) AS rank
  FROM activities a
  LEFT JOIN "references" r ON a.reference_id = r.id
  WHERE a._status = 'published'
    AND a.visibility = 'public'
    AND to_tsvector('english', COALESCE(r.title, '') || ' ' || COALESCE(a.content_text, '')) @@ websearch_to_tsquery('english', query_text)
  ORDER BY ts_rank(
    to_tsvector('english', COALESCE(r.title, '') || ' ' || COALESCE(a.content_text, '')),
    websearch_to_tsquery('english', query_text)
  ) DESC
  LIMIT match_count * 2
),
fuzzy_search AS (
  SELECT
    a.id,
    ROW_NUMBER() OVER (
      ORDER BY similarity(COALESCE(r.title, '') || ' ' || COALESCE(a.content_text, ''), query_text) DESC
    ) AS rank
  FROM activities a
  LEFT JOIN "references" r ON a.reference_id = r.id
  WHERE a._status = 'published'
    AND a.visibility = 'public'
    AND (COALESCE(r.title, '') || ' ' || COALESCE(a.content_text, '')) % query_text
  LIMIT match_count * 2
)
SELECT
  a.id,
  COALESCE(r.title, a.slug)::VARCHAR AS title,
  a.slug,
  NULL::VARCHAR AS description,
  r.image_id AS featured_image_id,
  a.created_at,
  a.updated_at,
  semantic_search.rank AS semantic_rank,
  fulltext_search.rank AS fts_rank,
  fuzzy_search.rank AS fuzzy_rank,
  COALESCE(1.0 / (rrf_k + semantic_search.rank), 0.0) * 0.4 +
  COALESCE(1.0 / (rrf_k + fulltext_search.rank), 0.0) * 0.4 +
  COALESCE(1.0 / (rrf_k + fuzzy_search.rank), 0.0) * 0.2 AS combined_score
FROM activities a
LEFT JOIN "references" r ON a.reference_id = r.id
LEFT JOIN semantic_search ON a.id = semantic_search.id
LEFT JOIN fulltext_search ON a.id = fulltext_search.id
LEFT JOIN fuzzy_search ON a.id = fuzzy_search.id
WHERE a._status = 'published'
  AND a.visibility = 'public'
  AND (
    semantic_search.id IS NOT NULL
    OR fulltext_search.id IS NOT NULL
    OR fuzzy_search.id IS NOT NULL
  )
ORDER BY combined_score DESC
LIMIT match_count
$function$;

CREATE OR REPLACE FUNCTION public.hybrid_search_content(query_text text, query_embedding vector, match_count integer DEFAULT 10, rrf_k integer DEFAULT 60)
 RETURNS TABLE(collection character varying, id integer, title character varying, slug character varying, description character varying, featured_image_id integer, created_at timestamp with time zone, updated_at timestamp with time zone, semantic_rank bigint, fts_rank bigint, fuzzy_rank bigint, combined_score numeric)
 LANGUAGE sql
AS $function$
SELECT * FROM (
  SELECT 'posts'::VARCHAR AS collection, p.id, p.title, p.slug, p.description, p.featured_image_id, p.created_at, p.updated_at, p.semantic_rank, p.fts_rank, p.fuzzy_rank, p.combined_score
  FROM hybrid_search_posts(query_text, query_embedding, match_count, rrf_k) p
  UNION ALL
  SELECT 'notes'::VARCHAR AS collection, n.id, n.title, n.slug, n.description, n.featured_image_id, n.created_at, n.updated_at, n.semantic_rank, n.fts_rank, n.fuzzy_rank, n.combined_score
  FROM hybrid_search_notes(query_text, query_embedding, match_count, rrf_k) n
  UNION ALL
  SELECT 'activities'::VARCHAR AS collection, a.id, a.title, a.slug, a.description, a.featured_image_id, a.created_at, a.updated_at, a.semantic_rank, a.fts_rank, a.fuzzy_rank, a.combined_score
  FROM hybrid_search_activities(query_text, query_embedding, match_count, rrf_k) a
) r
ORDER BY r.combined_score DESC
LIMIT match_count
$function$;
`);
}

// Production had these functions before this migration, so rolling back keeps
// them in place rather than breaking search.
export async function down(_args: MigrateDownArgs): Promise<void> {
  // Intentionally empty.
}
