import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTextHash, generateEmbedding } from "./generate-embedding";
import {
  buildEmbeddingText,
  generateEmbeddingFor,
} from "./generate-embedding-helpers";
import { getSimilarPosts } from "./get-similar-posts";

vi.mock("./generate-embedding", async (importOriginal) => ({
  ...(await importOriginal<typeof import("./generate-embedding")>()),
  generateEmbedding: vi.fn(),
}));
vi.mock("./get-similar-posts", () => ({ getSimilarPosts: vi.fn() }));
vi.mock("./get-similar-notes", () => ({ getSimilarNotes: vi.fn() }));

const post = {
  id: 29,
  _status: "published",
  title: "The Vercel Stack",
  updatedAt: "2026-03-25T10:07:01.048Z",
  embedding_text_hash: null,
  content: {
    root: {
      type: "root",
      children: [
        { type: "paragraph", children: [{ type: "text", text: "Hello" }] },
      ],
    },
  },
};

function makeReq(updatedRows: { id: number }[]) {
  const returning = vi.fn().mockResolvedValue(updatedRows);
  const where = vi.fn().mockReturnValue({ returning });
  const set = vi.fn().mockReturnValue({ where });
  const req = {
    payload: {
      findByID: vi.fn().mockResolvedValue(post),
      db: {
        tables: { posts: { id: "id", updatedAt: "updatedAt" } },
        drizzle: { update: vi.fn().mockReturnValue({ set }) },
      },
      logger: { info: vi.fn(), warn: vi.fn(), error: vi.fn() },
    },
  };
  return { req, set, where };
}

beforeEach(() => {
  vi.mocked(generateEmbedding).mockResolvedValue({
    vector: Array.from({ length: 1536 }, () => 0.1),
    model: "text-embedding-3-small",
    dimensions: 1536,
  });
  vi.mocked(getSimilarPosts).mockResolvedValue([]);
});

describe("post embedding persistence", () => {
  it("leaves a document stale when it changed during generation", async () => {
    const { req, set } = makeReq([]);
    const result = await generateEmbeddingFor(
      "posts",
      29,
      req.payload as never
    );

    expect(set).toHaveBeenCalledOnce();
    expect(result).toEqual({ success: true, skipped: true });
    expect(req.payload.logger.warn).toHaveBeenCalled();
    expect(getSimilarPosts).not.toHaveBeenCalled();
  });

  it("stores the embedding when the document is unchanged", async () => {
    const { req } = makeReq([{ id: 29 }]);
    const result = await generateEmbeddingFor(
      "posts",
      29,
      req.payload as never
    );

    expect(result).toEqual({ success: true, skipped: false });
    expect(req.payload.logger.warn).not.toHaveBeenCalled();
  });
});

describe("unchanged text", () => {
  it("skips the provider unless forced", async () => {
    const hash = createTextHash(buildEmbeddingText("posts", post as never));
    const { req } = makeReq([{ id: 29 }]);
    req.payload.findByID.mockResolvedValue({
      ...post,
      embedding_text_hash: hash,
    });

    expect(
      await generateEmbeddingFor("posts", 29, req.payload as never)
    ).toEqual({ success: true, skipped: true });
    expect(generateEmbedding).not.toHaveBeenCalled();

    expect(
      await generateEmbeddingFor("posts", 29, req.payload as never, {
        force: true,
      })
    ).toEqual({ success: true, skipped: false });
    expect(generateEmbedding).toHaveBeenCalledOnce();
  });
});
