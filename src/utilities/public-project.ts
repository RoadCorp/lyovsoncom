import type { Project } from "@/payload-types";
import { isPopulated } from "@/utilities/relations";

type ProjectRelation = number | string | Partial<Project> | null | undefined;

/**
 * A post's populated project, or null while that project is unpublished.
 * Public reads use `overrideAccess`, so population alone doesn't hide drafts.
 */
export function getPublishedProject<T extends Partial<Project>>(
  project: T | number | string | null | undefined
): (T & { slug: string }) | null {
  if (!isPopulated(project as ProjectRelation)) {
    return null;
  }
  const doc = project as T;
  return doc._status === "published" && doc.slug
    ? (doc as T & { slug: string })
    : null;
}
