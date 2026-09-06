import type { SQL } from "@payloadcms/db-vercel-postgres/drizzle";
import { PgDialect } from "@payloadcms/db-vercel-postgres/drizzle/pg-core";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { GET } from "@/app/api/search/route";
import { generateEmbedding } from "@/utilities/generate-embedding";
import { getPayloadClient } from "@/utilities/payload-client";
import {
  hydrateSearchResults,
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
  vi.resetAllMocks();
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

const createdAt = new Date("2026-09-01T12:00:00Z");
const row = {
  collection: "posts",
  id: 1,
  title: "A book",
  slug: "a-book",
  description: null,
  featured_image_id: null,
  created_at: createdAt,
  updated_at: createdAt,
  semantic_rank: 1n,
  fts_rank: null,
  fuzzy_rank: 2n,
  combined_score: "0.75",
};

describe("search execution", () => {
  const execute = vi.fn<(query: SQL) => Promise<{ rows: (typeof row)[] }>>();

  beforeEach(() => {
    execute.mockReset().mockResolvedValue({ rows: [row] });
    vi.mocked(getPayloadClient).mockResolvedValue({
      db: { drizzle: { execute } },
    } as never);
    vi.mocked(generateEmbedding).mockResolvedValue({
      vector: Array.from({ length: 1536 }, () => 0),
      model: "test-model",
      dimensions: 1536,
    });
  });

  it.each([null, " Rafa "])(
    "returns serializable results for scope %s",
    async (scope) => {
      const params = new URLSearchParams({ q: "  books  " });
      if (scope) {
        params.set("scope", scope);
      }
      const response = await GET(
        new NextRequest(`https://www.lyovson.com/api/search?${params}`)
      );
      expect(response.status).toBe(200);
      expect(await response.json()).toMatchObject({
        query: "books",
        count: 1,
        results: [
          {
            id: 1,
            combined_score: 0.75,
            semantic_rank: 1,
            fuzzy_rank: 2,
            created_at: createdAt.toISOString(),
          },
        ],
      });
      expect(generateEmbedding).toHaveBeenCalledWith("books");
      expect(execute).toHaveBeenCalledTimes(1);
      const [[statement]] = execute.mock.calls;
      const query = new PgDialect().sqlToQuery(statement);
      expect(query.params).toContain("books");
      if (scope) {
        expect(query.params).toContain("rafa");
        expect(query.sql).not.toContain("rafa");
      } else {
        expect(query.sql).toContain("hybrid_search_content");
      }
    }
  );

  it("blocks scripted search requests before database or provider work", async () => {
    const response = await GET(
      new NextRequest("https://www.lyovson.com/api/search?q=books", {
        headers: { "user-agent": "python-requests" },
      })
    );
    expect(response.status).toBe(403);
    expect(response.headers.get("Cache-Control")).toBe("no-store");
    expect(getPayloadClient).not.toHaveBeenCalled();
    expect(generateEmbedding).not.toHaveBeenCalled();
  });

  it("rejects an invalid embedding before executing SQL", async () => {
    vi.mocked(generateEmbedding).mockResolvedValue({
      vector: [0],
      model: "test-model",
      dimensions: 1,
    });
    const response = await GET(
      new NextRequest("https://www.lyovson.com/api/search?q=books")
    );
    expect(response.status).toBe(500);
    expect(execute).not.toHaveBeenCalled();
  });

  it.each(["provider", "database"])(
    "reports %s failures instead of a successful empty result",
    async (failure) => {
      if (failure === "provider") {
        vi.mocked(generateEmbedding).mockRejectedValue(
          new Error("Unavailable")
        );
      } else {
        execute.mockRejectedValue(new Error("Unavailable"));
      }
      const response = await GET(
        new NextRequest("https://www.lyovson.com/api/search?q=books")
      );
      expect(response.status).toBe(500);
      expect(response.headers.has("Cache-Control")).toBe(false);
      expect(await response.json()).toMatchObject({
        message: "Search failed",
        results: [],
      });
      if (failure === "provider") {
        expect(execute).not.toHaveBeenCalled();
      }
    }
  );
});

describe("search result hydration", () => {
  it("keeps rank order across collections and drops documents no longer returned by public reads", async () => {
    const find = vi.fn().mockImplementation(({ collection }) =>
      Promise.resolve({
        docs: collection === "posts" ? [{ id: 2 }, { id: 1 }] : [{ id: 1 }],
      })
    );
    vi.mocked(getPayloadClient).mockResolvedValue({ find } as never);
    const result = {
      ...row,
      created_at: createdAt.toISOString(),
      updated_at: createdAt.toISOString(),
      semantic_rank: 1,
      combined_score: 0.75,
    };
    const hydrated = await hydrateSearchResults([
      { ...result, collection: "notes" },
      result,
      { ...result, collection: "activities" },
      { ...result, id: 2 },
      { ...result, collection: "notes", id: 99 },
    ]);
    expect(hydrated.map(({ type, data }) => [type, data.id])).toEqual([
      ["note", 1],
      ["post", 1],
      ["activity", 1],
      ["post", 2],
    ]);
    for (const collection of ["notes", "activities"]) {
      expect(find).toHaveBeenCalledWith(
        expect.objectContaining({
          collection,
          where: {
            AND: expect.arrayContaining([
              {
                _status: { equals: "published" },
                visibility: { equals: "public" },
              },
            ]),
          },
        })
      );
    }
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "posts",
        where: {
          AND: expect.arrayContaining([{ _status: { equals: "published" } }]),
        },
      })
    );
  });

  it("does not initialize Payload for an empty search result", async () => {
    expect(await hydrateSearchResults([])).toEqual([]);
    expect(getPayloadClient).not.toHaveBeenCalled();
  });
});
