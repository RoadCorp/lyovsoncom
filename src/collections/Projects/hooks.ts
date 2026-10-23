import { revalidateTag } from "next/cache";
import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";
import type { Project } from "@/payload-types";
import { getRelationId } from "@/utilities/relations";
import {
  isDraftOnlySave,
  revalidatePublicContent,
} from "@/utilities/revalidate-public-content";

// Fields post cards, heroes and feeds read from their populated project.
const POST_RENDERED_FIELDS = [
  "_status",
  "deletedAt",
  "name",
  "slug",
  "image",
  "description",
] as const;

type ProjectSnapshot = Partial<
  Pick<Project, (typeof POST_RENDERED_FIELDS)[number]>
>;

// The saved doc may carry a populated image where the previous one has an
// id, so relations compare by id.
const comparable = (value: unknown) =>
  JSON.stringify(getRelationId(value) ?? value ?? null);

function changedForPosts(
  doc: ProjectSnapshot | null,
  previousDoc: ProjectSnapshot | null | undefined
) {
  return POST_RENDERED_FIELDS.some(
    (field) => comparable(doc?.[field]) !== comparable(previousDoc?.[field])
  );
}

/**
 * Project pages and portfolios follow the shared publication rules. Posts
 * only refresh when something they show about the project changed; a slug
 * or status change expires them at once so no post links to a missing page.
 */
function revalidateProjectOutput(
  doc: ProjectSnapshot | null,
  previousDoc: ProjectSnapshot | null | undefined
) {
  revalidatePublicContent("projects", doc, previousDoc);

  const wasOrIsPublished =
    doc?._status === "published" || previousDoc?._status === "published";
  if (!(wasOrIsPublished && changedForPosts(doc, previousDoc))) {
    return;
  }
  const linkChanged =
    doc?._status !== previousDoc?._status ||
    doc?.deletedAt !== previousDoc?.deletedAt ||
    doc?.slug !== previousDoc?.slug;
  revalidateTag("posts", linkChanged ? { expire: 0 } : "posts");
}

export const revalidateProject: CollectionAfterChangeHook<Project> = ({
  context,
  doc,
  previousDoc,
  req,
}) => {
  // Draft saves and autosaves don't change the published project.
  if (!(context?.skipRevalidation || isDraftOnlySave(req, doc))) {
    revalidateProjectOutput(doc, previousDoc);
  }
  return doc;
};

export const revalidateDeletedProject: CollectionAfterDeleteHook<Project> = ({
  context,
  doc,
}) => {
  if (!context?.skipRevalidation) {
    revalidateProjectOutput(null, doc);
  }
  return doc;
};
