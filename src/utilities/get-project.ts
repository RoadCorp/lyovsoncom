import { cacheLife, cacheTag } from "next/cache";
import type { Project, ProjectsSelect } from "@/payload-types";
import { publishedProjectsWhere } from "@/utilities/content-queries";
import { getPayloadClient } from "@/utilities/payload-client";

// Payload's authorship stamps never render. With overrideAccess they would
// populate editor accounts into the cached project.
const publicProjectSelect = {
  createdBy: false,
  updatedBy: false,
} as const satisfies ProjectsSelect<false>;

export async function getProject(slug: string): Promise<Project | null> {
  "use cache";
  cacheTag("projects");
  cacheTag(`project-${slug}`);
  cacheLife("static");

  const payload = await getPayloadClient();
  const response = await payload.find({
    collection: "projects",
    depth: 2,
    where: {
      slug: {
        equals: slug,
      },
      ...publishedProjectsWhere(),
    },
    limit: 1,
    select: publicProjectSelect,
    // Case studies render their people, and Lyovsons are an auth collection
    // that anonymous access cannot read.
    overrideAccess: true,
  });

  return (response.docs[0] as Project) || null;
}
