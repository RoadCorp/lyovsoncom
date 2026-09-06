import configPromise from "@payload-config";
import {
  and,
  asc,
  eq,
  isNotNull,
  ne,
  sql,
} from "@payloadcms/db-vercel-postgres/drizzle";
import { getPayload } from "payload";
import type { Post } from "@/payload-types";
import { EMBEDDING_VECTOR_DIMENSIONS } from "@/utilities/generate-embedding";

export async function getSimilarPosts(
  postId: number,
  limit = 3
): Promise<Post[]> {
  const payload = await getPayload({ config: configPromise });

  const currentPost = await payload.findByID({
    collection: "posts",
    id: postId,
    select: {
      embedding_vector: true,
    },
  });

  if (!currentPost?.embedding_vector) {
    return [];
  }

  // Parse pgvector string format "[1.0,2.0,...]" to array
  let embedding: number[];
  try {
    embedding = JSON.parse(currentPost.embedding_vector);
  } catch {
    return [];
  }

  if (embedding.length !== EMBEDDING_VECTOR_DIMENSIONS) {
    return [];
  }

  const postsTable = payload.db.tables.posts;

  const similarPosts = await payload.db.drizzle
    .select({
      id: postsTable.id,
    })
    .from(postsTable)
    .where(
      and(
        ne(postsTable.id, postId),
        eq(postsTable._status, "published"),
        isNotNull(postsTable.embedding_vector)
      )
    )
    // Ascending cosine distance allows index use; stored strings need vector casts.
    .orderBy(
      asc(
        sql`${postsTable.embedding_vector}::vector <=> ${JSON.stringify(embedding)}::vector`
      )
    )
    .limit(limit);

  const fullPosts = await Promise.all(
    similarPosts.map((p) =>
      payload.findByID({
        collection: "posts",
        id: p.id,
        depth: 1,
      })
    )
  );

  return fullPosts.filter(Boolean) as Post[];
}
