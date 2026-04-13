import { cacheLife, cacheTag } from "next/cache";
import type { PaginatedDocs } from "payload";
import type { Post } from "@/payload-types";
import { publishedPostsWhere } from "@/utilities/content-queries";
import { getPayloadClient } from "@/utilities/payload-client";

export async function getPost(slug: string): Promise<Post | null> {
  "use cache";
  cacheTag("posts");
  cacheTag(`post-${slug}`);
  cacheLife("posts");

  const payload = await getPayloadClient();
  const response = await payload.find({
    collection: "posts",
    where: {
      ...publishedPostsWhere(),
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 2,
  });

  return (response.docs[0] as Post) || null;
}

export async function getPostByProjectAndSlug(
  projectSlug: string,
  slug: string
): Promise<Post | null> {
  "use cache";
  cacheTag("posts");
  cacheTag(`post-${slug}`);
  cacheTag(`project-${projectSlug}`);
  cacheLife("posts");

  const payload = await getPayloadClient();
  const response = await payload.find({
    collection: "posts",
    depth: 2,
    where: {
      AND: [
        publishedPostsWhere(),
        {
          slug: {
            equals: slug,
          },
        },
        {
          "project.slug": {
            equals: projectSlug,
          },
        },
      ],
    },
  });

  return (response.docs[0] as Post) || null;
}

export async function getLatestPosts(limit = 12): Promise<PaginatedDocs<Post>> {
  "use cache";
  cacheTag("posts");
  cacheTag("homepage");
  cacheLife("posts");

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    depth: 2,
    limit,
    sort: "-publishedAt",
    where: publishedPostsWhere(),
  });

  return {
    ...result,
    docs: result.docs as Post[],
  };
}

export async function getPaginatedPosts(
  pageNumber: number,
  limit = 12
): Promise<PaginatedDocs<Post>> {
  "use cache";
  cacheTag("posts");
  cacheTag(`posts-page-${pageNumber}`);
  cacheLife("posts");

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "posts",
    depth: 2,
    limit,
    page: pageNumber,
    sort: "-publishedAt",
    where: publishedPostsWhere(),
  });

  return {
    ...result,
    docs: result.docs as Post[],
  };
}

export async function getPostCount() {
  "use cache";
  cacheTag("posts");
  cacheTag("post-count");
  cacheLife("posts");

  const payload = await getPayloadClient();
  return await payload.count({
    collection: "posts",
    where: publishedPostsWhere(),
  });
}
