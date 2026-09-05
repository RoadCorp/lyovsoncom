/** biome-ignore-all lint/style/noMagicNumbers: Tests use explicit boundary inputs and HTTP status expectations. */
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/search/route";
import { generateEmbedding } from "@/utilities/generate-embedding";
import { getPayloadClient } from "@/utilities/payload-client";
import {
  runHybridSearch,
  SearchInputError,
  validateSearchInput,
} from "./service";

vi.mock("@/utilities/payload-client", () => ({ getPayloadClient: vi.fn() }));
vi.mock("@/utilities/generate-embedding", () => ({
  EMBEDDING_VECTOR_DIMENSIONS: 1536,
  generateEmbedding: vi.fn(),
}));

beforeEach(() => {
  vi.clearAllMocks();
});

describe("search input validation", () => {
  it.each([Number.NaN, Number.POSITIVE_INFINITY, 1.5, 0, -1, 51])(
    "rejects invalid limit %s before database or embedding work",
    (limit) => {
      expect(() => runHybridSearch("books", { limit })).toThrow(
        SearchInputError
      );
      expect(getPayloadClient).not.toHaveBeenCalled();
      expect(generateEmbedding).not.toHaveBeenCalled();
    }
  );

  it.each([null, "", "  "])("rejects an empty query %s", (query) => {
    expect(() => runHybridSearch(query, { limit: 10 })).toThrow(
      SearchInputError
    );
    expect(getPayloadClient).not.toHaveBeenCalled();
    expect(generateEmbedding).not.toHaveBeenCalled();
  });

  it.each([1, 10, 50])(
    "accepts valid limit %s and trims the query",
    (limit) => {
      expect(validateSearchInput("  books  ", limit)).toBe("books");
    }
  );
});

describe("search API limits", () => {
  it.each(["NaN", "Infinity", "1.5", "12abc", "", "0", "51"])(
    "returns 400 for limit=%s without paid or database work",
    async (limit) => {
      const params = new URLSearchParams({ q: "books", limit });
      const response = await GET(
        new NextRequest(`https://www.lyovson.com/api/search?${params}`)
      );

      expect(response.status).toBe(400);
      expect(await response.json()).toMatchObject({ results: [], count: 0 });
      expect(getPayloadClient).not.toHaveBeenCalled();
      expect(generateEmbedding).not.toHaveBeenCalled();
    }
  );
});
