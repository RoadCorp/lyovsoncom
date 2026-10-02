import { cacheLife, cacheTag } from "next/cache";
import type { PaginatedDocs } from "payload";
import { PROJECT_POSTS_PER_PAGE } from "@/utilities/archive";
import { projectPostsWhere } from "@/utilities/content-queries";
import { getProject } from "@/utilities/get-project";
import {
  countPosts,
  findPostSummaries,
  type PostSummary,
} from "@/utilities/post-summary";

async function findProjectPosts(
  slug: string,
  limit: number,
  pageNumber?: number
): Promise<PaginatedDocs<PostSummary> | null> {
  const projectId = (await getProject(slug))?.id;
  if (!projectId) {
    return null;
  }

  return findPostSummaries(projectPostsWhere(projectId), {
    limit,
    page: pageNumber,
  });
}

// The first page keeps its own cache entry (no page tag), unlike topics.
export async function getProjectPosts(
  slug: string
): Promise<PaginatedDocs<PostSummary> | null> {
  "use cache";
  cacheTag("posts");
  cacheTag("projects");
  cacheTag(`project-${slug}`);
  cacheLife("posts");

  return await findProjectPosts(slug, PROJECT_POSTS_PER_PAGE);
}

export async function getPaginatedProjectPosts(
  slug: string,
  pageNumber: number,
  limit = PROJECT_POSTS_PER_PAGE
): Promise<PaginatedDocs<PostSummary> | null> {
  "use cache";
  cacheTag("posts");
  cacheTag("projects");
  cacheTag(`project-${slug}`);
  cacheTag(`project-${slug}-page-${pageNumber}`);
  cacheLife("posts");

  return await findProjectPosts(slug, limit, pageNumber);
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

  const projectId = (await getProject(slug))?.id;
  if (!projectId) {
    return null;
  }

  return countPosts(projectPostsWhere(projectId));
}
