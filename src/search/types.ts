export interface SearchResult {
  collection: string;
  combined_score: number;
  created_at: string;
  description: string | null;
  featured_image_id: number | null;
  fts_rank: number | null;
  id: number;
  semantic_rank: number | null;
  slug: string;
  title: string;
  updated_at: string;
}

export interface SearchResponse {
  count: number;
  query: string;
  results: SearchResult[];
}

export interface SearchOptions {
  limit: number;
  scopeUsername?: string | null;
}

export interface SearchPreviewItem {
  description: string | null;
  href: string;
  subtitle: string;
  title: string;
  type: "activity" | "note" | "post";
}
