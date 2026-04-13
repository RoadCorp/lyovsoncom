import { cacheLife, cacheTag } from "next/cache";
import type { PaginatedDocs } from "payload";
import type { Post } from "@/payload-types";
import { projectPostsWhere } from "@/utilities/content-queries";
import { getPayloadClient } from "@/utilities/payload-client";

export async function getProjectPosts(
  slug: string
): Promise<PaginatedDocs<Post> | null> {
  "use cache";
  cacheTag("posts");
  cacheTag("projects");
  cacheTag(`project-${slug}`);
  cacheLife("posts");

  const payload = await getPayloadClient();

  const project = await payload.find({
    collection: "projects",
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  if (!project?.docs?.[0]) {
    return null;
  }

  const projectId = project.docs[0].id;

  const result = await payload.find({
    collection: "posts",
    depth: 2,
    limit: 25,
    where: projectPostsWhere(projectId),
    sort: "-publishedAt",
    overrideAccess: true,
  });

  return {
    ...result,
    docs: result.docs as Post[],
  };
}

export async function getPaginatedProjectPosts(
  slug: string,
  pageNumber: number,
  limit = 25
): Promise<PaginatedDocs<Post> | null> {
  "use cache";
  cacheTag("posts");
  cacheTag("projects");
  cacheTag(`project-${slug}`);
  cacheTag(`project-${slug}-page-${pageNumber}`);
  cacheLife("posts");

  const payload = await getPayloadClient();

  const project = await payload.find({
    collection: "projects",
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  if (!project?.docs?.[0]) {
    return null;
  }

  const projectId = project.docs[0].id;

  const result = await payload.find({
    collection: "posts",
    depth: 2,
    limit,
    page: pageNumber,
    where: projectPostsWhere(projectId),
    sort: "-publishedAt",
    overrideAccess: true,
  });

  return {
    ...result,
    docs: result.docs as Post[],
  };
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

  const project = await payload.find({
    collection: "projects",
    where: {
      slug: {
        equals: slug,
      },
    },
    limit: 1,
  });

  const projectId = project.docs[0]?.id;
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
