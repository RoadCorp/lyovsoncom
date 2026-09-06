import { beforeEach, describe, expect, it, vi } from "vitest";
import { generateEmbedding } from "@/utilities/generate-embedding";
import { GenerateEmbedding } from "./generate-embedding";

vi.mock("@/utilities/generate-embedding", () => ({
  EMBEDDING_MODEL: "test-model",
  EMBEDDING_VECTOR_DIMENSIONS: 3,
  createTextHash: () => "current-hash",
  generateEmbedding: vi.fn(),
}));
vi.mock("@/utilities/generate-embedding-helpers", () => ({
  buildPostEmbeddingText: () => "Document text",
  buildNoteEmbeddingText: () => "Document text",
  buildActivityEmbeddingText: () => "Document text",
}));

const findByID = vi.fn();
const update = vi.fn();
const req = { payload: { findByID, update, logger: { info: vi.fn() } } };

async function run(collection = "posts") {
  if (typeof GenerateEmbedding.handler !== "function") {
    throw new Error("Embedding task must have a callable handler");
  }
  return await GenerateEmbedding.handler({
    input: { collection, docId: 1 },
    req,
  } as never);
}

beforeEach(() => {
  vi.resetAllMocks();
  findByID.mockResolvedValue({
    id: 1,
    _status: "published",
    visibility: "public",
  });
  vi.mocked(generateEmbedding).mockResolvedValue({
    vector: [0.1, 0.2, 0.3],
    model: "test-model",
    dimensions: 3,
  });
});

describe("embedding job cost and write controls", () => {
  it("rejects unsupported collections without reading the database", async () => {
    expect(await run("contacts")).toMatchObject({
      output: { success: false, reason: "unsupported_collection" },
    });
    expect(findByID).not.toHaveBeenCalled();
    expect(generateEmbedding).not.toHaveBeenCalled();
  });

  it.each([
    ["posts", { _status: "draft" }, "not_published"],
    ["notes", { _status: "published", visibility: "private" }, "not_public"],
    [
      "activities",
      { _status: "published", visibility: "private" },
      "not_public",
    ],
  ])(
    "does not embed ineligible %s content",
    async (collection, doc, reason) => {
      findByID.mockResolvedValue(doc);
      expect(await run(collection)).toMatchObject({
        output: { success: false, reason },
      });
      expect(generateEmbedding).not.toHaveBeenCalled();
      expect(update).not.toHaveBeenCalled();
    }
  );

  it("does not pay for or rewrite unchanged content", async () => {
    findByID.mockResolvedValue({
      _status: "published",
      embedding_text_hash: "current-hash",
    });
    expect(await run()).toMatchObject({
      output: { success: true, skipped: true },
    });
    expect(generateEmbedding).not.toHaveBeenCalled();
    expect(update).not.toHaveBeenCalled();
  });

  it("persists new embeddings with recursion and revalidation guards", async () => {
    expect(await run()).toMatchObject({
      output: { success: true, skipped: false },
    });
    expect(generateEmbedding).toHaveBeenCalledWith("Document text");
    expect(update).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "posts",
        id: 1,
        data: expect.objectContaining({
          embedding_vector: "[0.1,0.2,0.3]",
          embedding_text_hash: "current-hash",
        }),
        context: {
          skipEmbeddingGeneration: true,
          skipRecommendationCompute: true,
          skipRevalidation: true,
        },
      })
    );
  });

  it("rejects incompatible provider output without persisting it", async () => {
    vi.mocked(generateEmbedding).mockResolvedValue({
      vector: [1],
      model: "wrong-model",
      dimensions: 1,
    });
    expect(await run()).toMatchObject({
      output: { success: false, reason: "invalid_embedding_output" },
    });
    expect(update).not.toHaveBeenCalled();
  });

  it("lets provider failures reach the job retry mechanism without writing", async () => {
    vi.mocked(generateEmbedding).mockRejectedValue(
      new Error("Provider unavailable")
    );
    await expect(run()).rejects.toThrow("Provider unavailable");
    expect(update).not.toHaveBeenCalled();
  });
});
