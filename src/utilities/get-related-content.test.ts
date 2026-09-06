import { beforeEach, describe, expect, it, vi } from "vitest";
import { getLyovsonProfile } from "./get-lyovson-profile";
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
