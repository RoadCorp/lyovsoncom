import { revalidatePath, revalidateTag } from "next/cache";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { revalidatePost } from "@/collections/Posts/hooks/revalidate-post";
import { revalidateProject } from "@/collections/Projects/hooks";
import {
  hasPublicChanges,
  isDraftOnlySave,
  revalidatePublicContent,
  revalidatePublicDependencies,
} from "./revalidate-public-content";
import { getActivityDateSlug } from "./routes";

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));
beforeEach(() => vi.clearAllMocks());
const fixture = {
  _status: "published",
  visibility: "public",
  slug: "a-slug",
} as const;
const activity = { ...fixture, startedAt: "2026-09-06T12:00:00Z" } as const;

describe("public publication freshness", () => {
  it("does not invalidate public output for a private draft edit", () => {
    revalidatePublicContent(
      "projects",
      { ...fixture, _status: "draft" },
      { ...fixture, _status: "draft" }
    );
    expect(revalidateTag).not.toHaveBeenCalled();
  });
  it("immediately expires a cached missing slug on first publication", () => {
    revalidatePublicContent("projects", fixture);
    expect(revalidateTag).toHaveBeenCalledWith("project-a-slug", {
      expire: 0,
    });
    expect(revalidateTag).toHaveBeenCalledWith("projects", { expire: 0 });
  });
  it.each(["private", "unlisted"])(
    "withdraws %s activities without serving stale public results",
    (visibility) => {
      revalidatePublicContent(
        "activities",
        { ...activity, visibility },
        activity
      );
      expect(revalidateTag).toHaveBeenCalledWith("activities", { expire: 0 });
      expect(revalidateTag).toHaveBeenCalledWith("activity-09-06-26/a-slug", {
        expire: 0,
      });
      expect(revalidatePath).toHaveBeenCalledWith("/feed.xml");
    }
  );
  it("withdraws a published document moved to the trash", () => {
    // Payload passes the latest version, here a newer draft of the live post.
    const draft = { ...fixture, _status: "draft" as const };
    revalidatePublicContent(
      "posts",
      { ...draft, deletedAt: "2026-10-23T15:00:00Z" },
      draft
    );
    expect(revalidateTag).toHaveBeenCalledWith("posts", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("post-a-slug", { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith("/posts/a-slug");
    expect(revalidatePath).toHaveBeenCalledWith("/feed.xml");
  });
  it("invalidates both paths on a published slug change", () => {
    revalidatePublicContent("posts", { ...fixture, slug: "new-slug" }, fixture);
    expect(revalidateTag).toHaveBeenCalledWith("post-a-slug", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("post-new-slug", { expire: 0 });
    expect(revalidatePath).toHaveBeenCalledWith("/posts/a-slug");
  });
  it("expires both activity identities when its canonical date changes", () => {
    revalidatePublicContent(
      "activities",
      { ...fixture, startedAt: "2026-09-06T12:00:00Z" },
      { ...fixture, startedAt: "2026-09-05T12:00:00Z" }
    );
    // The old URLs only redirect now; their lookup is what must expire.
    expect(revalidateTag).toHaveBeenCalledWith("activity-09-05-26/a-slug", {
      expire: 0,
    });
    expect(revalidateTag).toHaveBeenCalledWith("activity-09-06-26/a-slug", {
      expire: 0,
    });
  });
  it("uses the existing freshness profile for ordinary public edits", () => {
    revalidatePublicContent("activities", activity, activity);
    expect(revalidateTag).toHaveBeenCalledWith("activities", "activities");
    expect(revalidateTag).toHaveBeenCalledWith(
      "activity-09-06-26/a-slug",
      "activities"
    );
  });
  it("expires collection and document output on deletion", () => {
    revalidatePublicContent("posts", null, fixture);
    expect(revalidateTag).toHaveBeenCalledWith("posts", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("post-a-slug", { expire: 0 });
  });
  it("refreshes populated reference, media and author fields throughout the public site", () => {
    revalidatePublicDependencies();
    for (const tag of [
      "posts",
      "activities",
      "lyovsons",
      "projects",
      "references",
      "topics",
      "sitemap",
    ]) {
      expect(revalidateTag).toHaveBeenCalledWith(tag, "max");
    }
    expect(revalidateTag).not.toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ expire: 0 })
    );
  });
});

describe("draft and autosave saves", () => {
  const published = { ...fixture, _status: "published" } as const;
  const runHook = (query: Record<string, string>, status: string) =>
    revalidatePost({
      context: {},
      doc: { ...published, _status: status },
      previousDoc: published,
      req: { query },
    } as never);

  it.each([
    ["Save draft", { draft: "true" }],
    ["autosave", { draft: "true", autosave: "true" }],
  ])("leaves the published page cached on %s", (_label, query) => {
    runHook(query, "draft");
    expect(revalidateTag).not.toHaveBeenCalled();
    expect(revalidatePath).not.toHaveBeenCalled();
  });

  it("still withdraws content on unpublish (no draft parameter)", () => {
    runHook({}, "draft");
    expect(revalidateTag).toHaveBeenCalledWith("posts", { expire: 0 });
  });

  it("revalidates on publish", () => {
    runHook({}, "published");
    expect(revalidateTag).toHaveBeenCalledWith("post-a-slug", "posts");
  });

  it("treats a draft-flagged save that publishes as a publish", () => {
    expect(isDraftOnlySave({ query: { draft: "true" } }, published)).toBe(
      false
    );
  });
});

describe("project publication", () => {
  const project = {
    _status: "published",
    name: "Avenews",
    slug: "avenews",
  } as const;
  const runHook = (
    doc: Record<string, unknown>,
    query: Record<string, string> = {}
  ) =>
    revalidateProject({
      context: {},
      doc,
      previousDoc: project,
      req: { query },
    } as never);

  it("withdraws the old page and post links on unpublish", () => {
    runHook({ ...project, _status: "draft" });
    expect(revalidateTag).toHaveBeenCalledWith("projects", { expire: 0 });
    expect(revalidateTag).toHaveBeenCalledWith("project-avenews", {
      expire: 0,
    });
    expect(revalidatePath).toHaveBeenCalledWith("/projects/avenews");
    expect(revalidateTag).toHaveBeenCalledWith("posts", { expire: 0 });
  });

  it("leaves the published project cached on autosave", () => {
    runHook(
      { ...project, _status: "draft" },
      { autosave: "true", draft: "true" }
    );
    expect(revalidateTag).not.toHaveBeenCalled();
  });

  it("keeps post caches when only case-study fields change", () => {
    runHook({ ...project, role: "Design & engineering" });
    expect(revalidateTag).toHaveBeenCalledWith("project-avenews", "projects");
    expect(revalidateTag).not.toHaveBeenCalledWith("posts", expect.anything());
  });
});

describe("public change detection", () => {
  it("ignores timestamps and listed private fields", () => {
    expect(
      hasPublicChanges(
        { name: "Rafa", updatedAt: "b", sessions: [2] },
        { name: "Rafa", updatedAt: "a", sessions: [1] },
        ["sessions"]
      )
    ).toBe(false);
  });

  it("detects a rendered field change", () => {
    expect(hasPublicChanges({ alt: "New" }, { alt: "Old" })).toBe(true);
  });
});

it("keeps activity URL dates in UTC across server and browser time zones", () => {
  expect(getActivityDateSlug({ startedAt: "2026-09-05T23:30:00Z" })).toBe(
    "09-05-26"
  );
});
