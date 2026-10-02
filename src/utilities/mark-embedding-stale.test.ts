import { describe, expect, it } from "vitest";
import {
  markActivityEmbeddingStaleHook,
  markPostEmbeddingStaleHook,
} from "./mark-embedding-stale";

const lexical = (text: string, format = 0) => ({
  root: {
    type: "root",
    children: [
      { type: "paragraph", children: [{ type: "text", text, format }] },
    ],
  },
});

const storedPost = {
  _status: "published",
  title: "The Vercel Stack",
  description: "Why this stack",
  content: lexical("Next, Payload and Neon."),
  topics: [1, 2],
  project: 3,
  embedding_text_hash: "abc123",
};

function save(
  data: Record<string, unknown>,
  originalDoc: Record<string, unknown> | undefined = storedPost,
  hook = markPostEmbeddingStaleHook
) {
  return hook({
    context: {},
    data: { ...data },
    operation: "update",
    originalDoc,
    req: { query: {} },
  } as never) as Record<string, unknown>;
}

describe("embedding stale marker", () => {
  it("keeps the hash when the admin resubmits unchanged fields", () => {
    const result = save({
      ...storedPost,
      // Populated relations and formatting-only edits do not change the text.
      topics: [{ id: 1, name: "Tech" }, { id: 2 }],
      project: { id: 3, name: "X-Files" },
      content: lexical("Next, Payload and Neon.", 1),
    });
    expect(result.embedding_text_hash).toBe("abc123");
  });

  it.each([
    ["title", { title: "A new title" }],
    ["content text", { content: lexical("Different words.") }],
    ["topics", { topics: [1, 4] }],
  ])("clears the hash when %s changes", (_label, change) => {
    expect(save({ ...storedPost, ...change }).embedding_text_hash).toBeNull();
  });

  it("ignores fields that a partial update leaves out", () => {
    expect(
      save({ _status: "published", slugLock: true }).embedding_text_hash
    ).toBeUndefined();
  });

  it("marks content stale when it is first published", () => {
    const result = save(storedPost, { ...storedPost, _status: "draft" });
    expect(result.embedding_text_hash).toBeNull();
  });

  it("compares activity reviews by author, note and rating", () => {
    const storedActivity = {
      _status: "published",
      visibility: "public",
      reference: 9,
      reviews: [{ id: "row1", lyovson: 1, note: "Great", rating: 9 }],
      embedding_text_hash: "def456",
    };
    const unchanged = save(
      {
        ...storedActivity,
        reviews: [{ id: "row1", lyovson: { id: 1 }, note: "Great", rating: 9 }],
      },
      storedActivity,
      markActivityEmbeddingStaleHook
    );
    expect(unchanged.embedding_text_hash).toBe("def456");

    const rated = save(
      {
        ...storedActivity,
        reviews: [{ id: "row1", lyovson: 1, note: "Great", rating: 7 }],
      },
      storedActivity,
      markActivityEmbeddingStaleHook
    );
    expect(rated.embedding_text_hash).toBeNull();
  });
});
