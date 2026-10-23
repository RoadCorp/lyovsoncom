import { cacheLife, cacheTag } from "next/cache";
import type { Project } from "@/payload-types";
import {
  moreWorkWhere,
  publishedProjectsWhere,
} from "@/utilities/content-queries";
import { getPayloadClient } from "@/utilities/payload-client";

/** What a project card renders; case-study bodies stay on the project page. */
export const projectCardSelect = {
  name: true,
  slug: true,
  image: true,
  description: true,
  role: true,
  client: true,
  stack: true,
  url: true,
  startedAt: true,
  endedAt: true,
  updatedAt: true,
} as const;

export type ProjectCardData = Pick<
  Project,
  "id" | keyof typeof projectCardSelect
>;

export async function getProjects(): Promise<ProjectCardData[] | null> {
  "use cache";
  cacheTag("projects");
  cacheLife("projects");

  const payload = await getPayloadClient();

  const projects = await payload.find({
    collection: "projects",
    depth: 1,
    limit: 100,
    select: projectCardSelect,
    sort: "-createdAt",
    where: publishedProjectsWhere(),
    overrideAccess: true,
  });

  if (!projects?.docs?.[0]) {
    return null;
  }

  return projects.docs;
}

const MORE_WORK_LIMIT = 3;

/** Up to three other published projects by the same people, newest first. */
export async function getMoreWork(
  projectId: number,
  peopleIds: number[]
): Promise<ProjectCardData[]> {
  "use cache";
  cacheTag("projects");
  cacheLife("projects");

  if (peopleIds.length === 0) {
    return [];
  }

  const payload = await getPayloadClient();
  const projects = await payload.find({
    collection: "projects",
    depth: 1,
    limit: MORE_WORK_LIMIT,
    select: projectCardSelect,
    sort: ["-startedAt", "-publishedAt"],
    where: moreWorkWhere(peopleIds, projectId),
    overrideAccess: true,
  });

  return projects.docs;
}
