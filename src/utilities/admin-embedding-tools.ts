import configPromise from "@payload-config";
import type { PayloadRequest } from "payload";
import { getPayload } from "payload";
import type { Post } from "@/payload-types";
import { generateEmbedding } from "./generate-embedding";
import { generateEmbeddingForPost } from "./generate-embedding-helpers";

const BULK_EMBEDDING_DELAY_MS = 100;
const EMBEDDING_COVERAGE_PERCENT = 100;

// Get embedding statistics for all posts
export async function getEmbeddingStats() {
  const payload = await getPayload({ config: configPromise });

  const [allPosts, postsWithEmbeddings] = await Promise.all([
    payload.find({
      collection: "posts",
      where: { _status: { equals: "published" } },
      limit: 0,
      pagination: false,
    }),
    payload.find({
      collection: "posts",
      where: {
        _status: { equals: "published" },
        embedding_vector: { exists: true },
      },
      limit: 0,
      pagination: false,
    }),
  ]);

  const coverage =
    allPosts.totalDocs > 0
      ? (postsWithEmbeddings.totalDocs / allPosts.totalDocs) *
        EMBEDDING_COVERAGE_PERCENT
      : 0;

  return {
    totalPosts: allPosts.totalDocs,
    postsWithEmbeddings: postsWithEmbeddings.totalDocs,
    postsNeedingEmbeddings: allPosts.totalDocs - postsWithEmbeddings.totalDocs,
    coveragePercentage: Math.round(coverage),
  };
}

// Get posts that need embedding generation
export async function getPostsNeedingEmbeddings(limit = 50) {
  const payload = await getPayload({ config: configPromise });

  const posts = await payload.find({
    collection: "posts",
    where: {
      _status: { equals: "published" },
      embedding_vector: { exists: false },
    },
    limit,
    select: {
      id: true,
      title: true,
      slug: true,
      project: true,
      updatedAt: true,
    },
  });

  return posts.docs;
}

// Regenerate embedding for a specific post
export async function regenerateEmbeddingForPost(postId: number) {
  const payload = await getPayload({ config: configPromise });

  try {
    const post = (await payload.findByID({
      collection: "posts",
      id: postId,
      depth: 2,
    })) as Post;

    if (!post) {
      throw new Error(`Post ${postId} not found`);
    }

    if (post._status !== "published") {
      throw new Error(`Post ${postId} is not published`);
    }

    const mockReq = {
      payload,
      user: null,
    } as unknown as PayloadRequest;

    const result = await generateEmbeddingForPost(postId, mockReq);

    if (!result.success) {
      throw new Error(result.error || "Failed to generate embedding");
    }

    // Fetch updated post to get embedding details
    const updatedPost = (await payload.findByID({
      collection: "posts",
      id: postId,
      select: {
        title: true,
        embedding_model: true,
        embedding_dimensions: true,
      },
    })) as {
      title: string;
      embedding_model?: string | null;
      embedding_dimensions?: number | null;
    };

    return {
      success: true,
      postId,
      title: updatedPost.title,
      model: updatedPost.embedding_model || "unknown",
      dimensions: updatedPost.embedding_dimensions || 0,
    };
  } catch (error) {
    return {
      success: false,
      postId,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Bulk regenerate embeddings for posts that don't have them
export async function bulkGenerateEmbeddings(batchSize = 10) {
  const postsToProcess = await getPostsNeedingEmbeddings(batchSize);

  if (postsToProcess.length === 0) {
    return {
      message: "All published posts already have embeddings!",
      processed: 0,
      results: [],
    };
  }

  const results: Awaited<ReturnType<typeof regenerateEmbeddingForPost>>[] = [];

  for (const post of postsToProcess) {
    const result = await regenerateEmbeddingForPost(post.id);
    results.push(result);

    // Small delay to avoid overwhelming the system
    await new Promise((resolve) =>
      setTimeout(resolve, BULK_EMBEDDING_DELAY_MS)
    );
  }

  const successful = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  return {
    message: `Processed ${results.length} posts: ${successful} successful, ${failed} failed`,
    processed: results.length,
    successful,
    failed,
    results,
  };
}

// Health check for the embedding system
export async function embeddingSystemHealthCheck() {
  try {
    const stats = await getEmbeddingStats();
    const hasOpenAI = !!process.env.OPENAI_API_KEY;

    // Test embedding generation
    const testResult = await generateEmbedding("test");

    return {
      healthy: true,
      openaiConfigured: hasOpenAI,
      model: testResult.model,
      dimensions: testResult.dimensions,
      stats,
      lastChecked: new Date().toISOString(),
    };
  } catch (error) {
    return {
      healthy: false,
      error: error instanceof Error ? error.message : "Unknown error",
      lastChecked: new Date().toISOString(),
    };
  }
}
