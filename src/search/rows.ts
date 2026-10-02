import type { SearchResult } from "./types";

/**
 * Raw row from either hybrid search query. Postgres returns BIGINT ranks and
 * NUMERIC scores as strings (BigInt in tests) and timestamps as Dates.
 */
type HybridSearchRow = Record<string, unknown>;

function toText(value: unknown): string | null {
  return typeof value === "string" && value ? value : null;
}

function toIsoString(value: unknown): string {
  if (value instanceof Date) {
    return value.toISOString();
  }
  return new Date(value as number | string).toISOString();
}

/** Ranks are 1-based, so 0 and NULL both mean "not ranked by this method". */
function toRank(value: unknown): number | null {
  return value ? Number(value) : null;
}

/** API responses also report the trigram rank alongside the public fields. */
type ParsedSearchResult = SearchResult & { fuzzy_rank: number | null };

function parseHybridSearchRow(row: HybridSearchRow): ParsedSearchResult {
  return {
    collection: toText(row.collection) || "posts",
    id: Number(row.id),
    title: toText(row.title) || "",
    slug: toText(row.slug) || "",
    description: toText(row.description),
    featured_image_id: Number(row.featured_image_id) || null,
    created_at: toIsoString(row.created_at),
    updated_at: toIsoString(row.updated_at),
    semantic_rank: toRank(row.semantic_rank),
    fts_rank: toRank(row.fts_rank),
    fuzzy_rank: toRank(row.fuzzy_rank),
    combined_score: Number.parseFloat(String(row.combined_score)),
  };
}

export function parseHybridSearchRows(
  rows: readonly HybridSearchRow[]
): ParsedSearchResult[] {
  return rows.map(parseHybridSearchRow);
}
