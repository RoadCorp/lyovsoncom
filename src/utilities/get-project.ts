import { cacheLife, cacheTag } from "next/cache";
import type { Project } from "@/payload-types";
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
    },
    limit: 1,
  });

  return (response.docs[0] as Project) || null;
}

export async function getCachedProjectBySlug(
  slug: string
): Promise<Project | null> {
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
    },
    limit: 1,
  });

  return (response.docs[0] as Project) || null;
}
