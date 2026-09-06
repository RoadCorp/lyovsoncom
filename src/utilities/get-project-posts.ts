import { cacheLife, cacheTag } from "next/cache";
import type { PaginatedDocs } from "payload";
import { projectPostsWhere } from "@/utilities/content-queries";
import { getProject } from "@/utilities/get-project";
import { getPayloadClient } from "@/utilities/payload-client";
import { type PostSummary, postSummarySelect } from "@/utilities/post-summary";

export async function getProjectPosts(
  slug: string
): Promise<PaginatedDocs<PostSummary> | null> {
  "use cache";
  cacheTag("posts");
  cacheTag("projects");
  cacheTag(`project-${slug}`);
  cacheLife("posts");

  const payload = await getPayloadClient();

  const project = await getProject(slug);

  if (!project) {
    return null;
  }

  const projectId = project.id;

  const result = await payload.find({
    collection: "posts",
    select: postSummarySelect,
    depth: 2,
    limit: 25,
    where: projectPostsWhere(projectId),
    sort: "-publishedAt",
    overrideAccess: true,
  });

  return result;
}

export async function getPaginatedProjectPosts(
  slug: string,
  pageNumber: number,
  limit = 25
): Promise<PaginatedDocs<PostSummary> | null> {
  "use cache";
  cacheTag("posts");
  cacheTag("projects");
  cacheTag(`project-${slug}`);
  cacheTag(`project-${slug}-page-${pageNumber}`);
  cacheLife("posts");

  const payload = await getPayloadClient();

  const project = await getProject(slug);

  if (!project) {
    return null;
  }

  const projectId = project.id;

  const result = await payload.find({
    collection: "posts",
    select: postSummarySelect,
    depth: 2,
    limit,
    page: pageNumber,
    where: projectPostsWhere(projectId),
    sort: "-publishedAt",
    overrideAccess: true,
  });

  return result;
}

export async function getProjectPostCount(
  slug: string
): Promise<number | null> {
  "use cache";
  cacheTag("posts");
  cacheTag("projects");
  cacheTag(`project-${slug}`);
  cacheTag(`project-${slug}-count`);
  cacheLife("posts");

  const payload = await getPayloadClient();

  const project = await getProject(slug);

  const projectId = project?.id;
  if (!projectId) {
    return null;
  }

  const count = await payload.count({
    collection: "posts",
    overrideAccess: true,
    where: projectPostsWhere(projectId),
  });

  return count.totalDocs;
}
