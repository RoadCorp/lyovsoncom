import { beforeEach, describe, expect, it, vi } from "vitest";
import { getActivityByDateAndSlug } from "./get-activity";
import { getLyovsonProfile } from "./get-lyovson-profile";
import { getNote } from "./get-note";
import { getRelatedNotes, getRelatedPosts } from "./get-related-content";
import { getPayloadClient } from "./payload-client";

vi.mock("./payload-client", () => ({ getPayloadClient: vi.fn() }));
vi.mock("next/cache", () => ({ cacheLife: vi.fn(), cacheTag: vi.fn() }));
beforeEach(() => vi.clearAllMocks());

describe("public read contracts", () => {
  it("requires both public visibility and publication for recommended notes", async () => {
    const find = vi.fn().mockResolvedValue({ docs: [] });
    vi.mocked(getPayloadClient).mockResolvedValue({ find } as never);
    await getRelatedNotes([1, 2]);
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection: "notes",
        overrideAccess: false,
        pagination: false,
        limit: 2,
        where: {
          _status: { equals: "published" },
          visibility: { equals: "public" },
          id: { in: [1, 2] },
        },
      })
    );
  });
  it("never initializes Payload for an empty recommendation set", async () => {
    expect(await getRelatedPosts([])).toEqual([]);
    expect(await getRelatedNotes([])).toEqual([]);
    expect(getPayloadClient).not.toHaveBeenCalled();
  });
  it("lets failures reach the recovery boundary instead of caching an empty success", async () => {
    vi.mocked(getPayloadClient).mockRejectedValue(
      new Error("Database unavailable")
    );
    await expect(getRelatedNotes([1])).rejects.toThrow("Database unavailable");
  });
  it("selects only public profile fields despite private collection access", async () => {
    const find = vi
      .fn()
      .mockResolvedValue({ docs: [{ id: 1, name: "Rafa", username: "rafa" }] });
    vi.mocked(getPayloadClient).mockResolvedValue({ find } as never);
    await getLyovsonProfile("rafa");
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        select: {
          name: true,
          username: true,
          avatar: true,
          font: true,
          quote: true,
          bio: true,
          socialLinks: true,
        },
        where: { username: { equals: "rafa" } },
        overrideAccess: true,
      })
    );
  });
});

it.each([
  ["notes", () => getNote("same-slug")],
  ["activities", () => getActivityByDateAndSlug("09-06-26", "same-slug")],
] as const)(
  "restricts %s detail reads to public content and excludes embedding internals",
  async (collection, read) => {
    const find = vi.fn().mockResolvedValue({ docs: [] });
    vi.mocked(getPayloadClient).mockResolvedValue({ find } as never);
    expect(await read()).toBeNull();
    expect(find).toHaveBeenCalledWith(
      expect.objectContaining({
        collection,
        where: {
          _status: { equals: "published" },
          visibility: { equals: "public" },
          slug: { equals: "same-slug" },
        },
        select: expect.objectContaining({
          embedding_vector: false,
          embedding_text_hash: false,
        }),
      })
    );
  }
);

it("distinguishes repeated activity slugs by their UTC date", async () => {
  const first = { id: 1, slug: "reading", startedAt: "2026-09-05T12:00:00Z" };
  const second = { id: 2, slug: "reading", startedAt: "2026-09-06T12:00:00Z" };
  const find = vi.fn().mockResolvedValue({ docs: [first, second] });
  vi.mocked(getPayloadClient).mockResolvedValue({ find } as never);
  expect(await getActivityByDateAndSlug("09-06-26", "reading")).toEqual(second);
  expect(await getActivityByDateAndSlug("09-07-26", "reading")).toBeNull();
});
