import { cacheLife, cacheTag } from "next/cache";
import type { Project } from "@/payload-types";
import { publishedProjectsWhere } from "@/utilities/content-queries";
import { getPayloadClient } from "@/utilities/payload-client";

export async function getProject(slug: string): Promise<Project | null> {
  "use cache";
  cacheTag("projects");
  cacheTag(`project-${slug}`);
  cacheLife("static");

  const payload = await getPayloadClient();
  const response = await payload.find({
    collection: "projects",
    where: {
      slug: {
        equals: slug,
      },
      ...publishedProjectsWhere(),
    },
    limit: 1,
    overrideAccess: true,
  });

  return (response.docs[0] as Project) || null;
}
