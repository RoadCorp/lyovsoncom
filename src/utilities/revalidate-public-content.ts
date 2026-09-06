import { revalidatePath, revalidateTag } from "next/cache";
import { activityFullRoute, activityRoute } from "@/utilities/routes";

type Collection = "posts" | "notes" | "activities";
interface PublicDocument {
  _status?: "draft" | "published" | null;
  finishedAt?: string | null;
  publishedAt?: string | null;
  slug?: string | null;
  startedAt?: string | null;
  visibility?: string | null;
}

function isPublic(collection: Collection, doc?: PublicDocument | null) {
  return (
    doc?._status === "published" &&
    (collection === "posts" || doc.visibility === "public")
  );
}

function identity(collection: Collection, doc?: PublicDocument | null) {
  if (!doc?.slug) {
    return null;
  }
  return collection === "activities" ? activityFullRoute(doc) : doc.slug;
}

function invalidateDocument(
  collection: Collection,
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
  const path =
    collection === "activities" ? activityRoute(doc) : `/${collection}/${key}`;
  if (path) {
    revalidatePath(path);
  }
}

/** Shared tags also cover author feeds, taxonomy counts, recommendations and sitemap. */
export function revalidatePublicContent(
  collection: Collection,
  doc: PublicDocument | null,
  previousDoc?: PublicDocument | null
) {
  const currentPublic = isPublic(collection, doc);
  const previousPublic = isPublic(collection, previousDoc);
  if (!(currentPublic || previousPublic)) {
    return;
  }
  const changedPath =
    identity(collection, doc) !== identity(collection, previousDoc);
  const immediate = currentPublic !== previousPublic || changedPath;
  revalidateTag(collection, immediate ? { expire: 0 } : collection);
  revalidateTag("homepage", immediate ? { expire: 0 } : "homepage");
  revalidateTag("sitemap", immediate ? { expire: 0 } : "sitemap");
  if (currentPublic && doc) {
    invalidateDocument(collection, doc, immediate);
  }
  if (previousPublic && previousDoc && (!currentPublic || changedPath)) {
    invalidateDocument(collection, previousDoc, true);
  }
  if (immediate) {
    revalidatePath("/");
    revalidatePath(`/${collection}`);
  }
  // Withdrawn content must not remain in the server's generated feed response.
  // An already downloaded feed/browser page cannot be remotely erased.
  if (previousPublic && !currentPublic) {
    for (const path of ["/feed.xml", "/atom.xml", "/feed.json"]) {
      revalidatePath(path);
    }
  }
}

export function revalidatePublicDependencies() {
  for (const tag of [
    "posts",
    "notes",
    "activities",
    "lyovsons",
    "projects",
    "topics",
    "homepage",
    "sitemap",
  ]) {
    revalidateTag(tag, { expire: 0 });
  }
}
