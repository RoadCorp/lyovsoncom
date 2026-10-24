import { revalidatePath, revalidateTag } from "next/cache";
import { legacyActivityPath } from "@/utilities/routes";

export type PublicCollection = "posts" | "activities" | "projects";
interface PublicDocument {
  _status?: "draft" | "published" | null;
  deletedAt?: string | null;
  finishedAt?: string | null;
  publishedAt?: string | null;
  slug?: string | null;
  startedAt?: string | null;
  visibility?: string | null;
}

// Only activities have a visibility field.
const ALWAYS_VISIBLE = new Set<PublicCollection>(["posts", "projects"]);

function isPublic(collection: PublicCollection, doc?: PublicDocument | null) {
  return (
    doc?._status === "published" &&
    !doc.deletedAt &&
    (ALWAYS_VISIBLE.has(collection) || doc.visibility === "public")
  );
}

function identity(collection: PublicCollection, doc?: PublicDocument | null) {
  if (!doc?.slug) {
    return null;
  }
  return collection === "activities" ? legacyActivityPath(doc) : doc.slug;
}

function invalidateDocument(
  collection: PublicCollection,
  doc: PublicDocument,
  immediate: boolean
) {
  const key = identity(collection, doc);
  if (!key) {
    return;
  }
  const prefix =
    collection === "activities" ? "activity" : collection.slice(0, -1);
  revalidateTag(`${prefix}-${key}`, immediate ? { expire: 0 } : collection);
  // An activity renders on its reference hub, which the collection tag
  // refreshes; its own key only feeds the legacy URL redirect.
  if (collection !== "activities") {
    revalidatePath(`/${collection}/${key}`);
  }
}

/** Shared tags also cover author feeds, taxonomy counts, recommendations and sitemap. */
export function revalidatePublicContent(
  collection: PublicCollection,
  doc: PublicDocument | null,
  previousDoc?: PublicDocument | null
) {
  const currentPublic = isPublic(collection, doc);
  const previousPublic = isPublic(collection, previousDoc);
  // Trashing or restoring can carry the latest draft instead of the live
  // document, so its status can't tell whether the site showed it.
  const trashChanged =
    Boolean(doc?.deletedAt) !== Boolean(previousDoc?.deletedAt);
  const withdrawn = previousPublic || trashChanged;
  if (!(currentPublic || withdrawn)) {
    return;
  }
  const changedPath =
    identity(collection, doc) !== identity(collection, previousDoc);
  const immediate =
    trashChanged || currentPublic !== previousPublic || changedPath;
  revalidateTag(collection, immediate ? { expire: 0 } : collection);
  revalidateTag("homepage", immediate ? { expire: 0 } : "homepage");
  revalidateTag("sitemap", immediate ? { expire: 0 } : "sitemap");
  if (currentPublic && doc) {
    invalidateDocument(collection, doc, immediate);
  }
  if (withdrawn && previousDoc && (!currentPublic || changedPath)) {
    invalidateDocument(collection, previousDoc, true);
  }
  if (immediate) {
    revalidatePath("/");
    revalidatePath(`/${collection}`);
  }
  // Withdrawn content must not remain in the server's generated feed response.
  // An already downloaded feed/browser page cannot be remotely erased.
  if (withdrawn && !currentPublic) {
    for (const path of ["/feed.xml", "/atom.xml", "/feed.json"]) {
      revalidatePath(path);
    }
  }
}

/**
 * Admin "Save draft" and autosave send `draft=true` with a non-published
 * status; Payload then writes only a version and leaves the live document
 * untouched. (Publishing sends no `draft` parameter.) Local API and MCP draft
 * saves are marked in `req.context.draftSave` by `draftSaveGuard`.
 */
export function isDraftOnlySave(
  req:
    | { context?: Record<string, unknown>; query?: Record<string, unknown> }
    | undefined,
  doc: { _status?: string | null } | null | undefined
) {
  if (req?.context?.draftSave === true) {
    return true;
  }
  const query = req?.query;
  const isDraftRequest = query?.draft === "true" || query?.autosave === "true";
  return isDraftRequest && doc?._status !== "published";
}

const UNRENDERED_FIELDS = new Set([
  "createdAt",
  "createdBy",
  "updatedAt",
  "updatedBy",
]);

/**
 * True when a field that can appear on the public site changed. `ignore`
 * lists private fields (for example auth state) that never render.
 */
export function hasPublicChanges(
  doc: Record<string, unknown> | null | undefined,
  previousDoc: Record<string, unknown> | null | undefined,
  ignore: readonly string[] = []
) {
  const skip = new Set([...UNRENDERED_FIELDS, ...ignore]);
  const keys = new Set([
    ...Object.keys(doc ?? {}),
    ...Object.keys(previousDoc ?? {}),
  ]);
  for (const key of keys) {
    if (
      !skip.has(key) &&
      JSON.stringify(doc?.[key] ?? null) !==
        JSON.stringify(previousDoc?.[key] ?? null)
    ) {
      return true;
    }
  }
  return false;
}

/**
 * Populated reference, media and author fields appear across the site.
 * Stale-while-revalidate: visitors get the cached page while it refreshes,
 * instead of every page blocking on regeneration at once.
 */
export function revalidatePublicDependencies() {
  for (const tag of [
    "posts",
    "activities",
    "lyovsons",
    "projects",
    "references",
    "topics",
    "homepage",
    "sitemap",
  ]) {
    revalidateTag(tag, "max");
  }
}
