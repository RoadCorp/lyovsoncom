import { revalidatePath, revalidateTag } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  revalidatePublicContent,
  revalidatePublicDependencies,
} from "./revalidate-public-content";
import { getActivityDateSlug } from "./routes";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
beforeEach(() => vi.clearAllMocks());
const note = {
  _status: "published",
  visibility: "public",
  slug: "a-note",
} as const;

describe("public publication freshness", () => {
  it("does not invalidate public output for a private draft edit", () => {
    revalidatePublicContent(
      "notes",
      { ...note, _status: "draft" },
      { ...note, _status: "draft" }
    );
    expect(revalidateTag).not.toHaveBeenCalled();
  });
  it("immediately expires a cached missing slug on first publication", () => {
    revalidatePublicContent("notes", note);
    expect(revalidateTag).toHaveBeenCalledWith("note-a-note", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("notes", { expire: 0 });
  });
  it.each(["private", "unlisted"])(
    "withdraws %s notes without serving stale public results",
    (visibility) => {
      revalidatePublicContent("notes", { ...note, visibility }, note);
      expect(revalidateTag).toHaveBeenCalledWith("notes", { expire: 0 });
      expect(revalidateTag).toHaveBeenCalledWith("note-a-note", { expire: 0 });
      expect(revalidatePath).toHaveBeenCalledWith("/notes/a-note");
      expect(revalidatePath).toHaveBeenCalledWith("/feed.xml");
    }
  );
  it("invalidates both paths on a published slug change", () => {
    revalidatePublicContent("posts", { ...note, slug: "new-slug" }, note);
    expect(revalidateTag).toHaveBeenCalledWith("post-a-note", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("post-new-slug", { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith("/posts/a-note");
  });
  it("expires both activity identities when its canonical date changes", () => {
    revalidatePublicContent(
      "activities",
      { ...note, startedAt: "2026-09-06T12:00:00Z" },
      { ...note, startedAt: "2026-09-05T12:00:00Z" }
    );
    expect(revalidatePath).toHaveBeenCalledWith("/activities/09-05-26/a-note");
    expect(revalidatePath).toHaveBeenCalledWith("/activities/09-06-26/a-note");
  });
  it("uses the existing freshness profile for ordinary public edits", () => {
    revalidatePublicContent("notes", note, note);
    expect(revalidateTag).toHaveBeenCalledWith("notes", "notes");
    expect(revalidateTag).toHaveBeenCalledWith("note-a-note", "notes");
  });
  it("expires collection and document output on deletion", () => {
    revalidatePublicContent("posts", null, note);
    expect(revalidateTag).toHaveBeenCalledWith("posts", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("post-a-note", { expire: 0 });
  });
  it("refreshes populated reference, media and author fields throughout the public site", () => {
    revalidatePublicDependencies();
    for (const tag of [
      "posts",
      "notes",
      "activities",
      "lyovsons",
      "projects",
      "topics",
      "sitemap",
    ]) {
      expect(revalidateTag).toHaveBeenCalledWith(tag, { expire: 0 });
    }
  });
});

it("keeps activity URL dates in UTC across server and browser time zones", () => {
  expect(getActivityDateSlug({ startedAt: "2026-09-05T23:30:00Z" })).toBe(
    "09-05-26"
  );
});
