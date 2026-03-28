import { eq } from "@payloadcms/db-vercel-postgres/drizzle";
import type { PayloadRequest } from "payload";
import type { Activity, Note, Post } from "@/payload-types";
import { extractLexicalText } from "@/utilities/extract-lexical-text";
import {
  createTextHash,
  EMBEDDING_MODEL,
  EMBEDDING_VECTOR_DIMENSIONS,
  generateEmbedding,
} from "@/utilities/generate-embedding";
import { getSimilarNotes } from "@/utilities/get-similar-notes";
import { getSimilarPosts } from "@/utilities/get-similar-posts";

const RECOMMENDATION_LIMIT = 3;

export function buildPostEmbeddingText(post: Post): string {
  const contentText = post.content ? extractLexicalText(post.content) : "";
  const topicNames = post.topics
    ?.filter(
      (t): t is Exclude<typeof t, number> => typeof t === "object" && t !== null
    )
    .map((t) => t.name)
    .filter(Boolean)
    .join(", ");
  const projectName =
    typeof post.project === "object" && post.project !== null
      ? post.project.name
      : null;

  return [
    post.title,
    post.description,
    projectName ? `Project: ${projectName}` : null,
    topicNames ? `Topics: ${topicNames}` : null,
    contentText,
  ]
    .filter(Boolean)
    .join("\n\n");
}

export function buildNoteEmbeddingText(note: Note): string {
  const contentText = note.content ? extractLexicalText(note.content) : "";
  const noteTypeLabel = note.type === "quote" ? "Quote" : "Thought";
  const topicNames = note.topics
    ?.filter(
      (t): t is Exclude<typeof t, number> => typeof t === "object" && t !== null
    )
    .map((t) => t.name)
    .filter(Boolean)
    .join(", ");

  return [
    note.title,
    `Type: ${noteTypeLabel}`,
    note.author ? `Author: ${note.author}` : null,
    note.quotedPerson ? `Quoted: ${note.quotedPerson}` : null,
    topicNames ? `Topics: ${topicNames}` : null,
    contentText,
  ]
    .filter(Boolean)
    .join("\n\n");
}

/**
 * Generate embedding for a post and optionally compute recommendations
 */
export async function generateEmbeddingForPost(
  postId: number,
  req: PayloadRequest
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  try {
    // Fetch the post (cast needed: Payload's defaultPopulate narrows return types)
    const post = (await req.payload.findByID({
      collection: "posts",
      id: postId,
      depth: 2,
    })) as unknown as Post | null;

    // Validation checks
    if (!post) {
      req.payload.logger.error(`[Embedding] Post ${postId} not found`);
      return { success: false, error: "Post not found" };
    }

    if (post._status !== "published") {
      req.payload.logger.info(
        `[Embedding] Post ${postId} is not published, skipping`
      );
      return { success: false, error: "Post is not published" };
    }

    if (!post.content) {
      req.payload.logger.info(
        `[Embedding] Post ${postId} has no content, skipping`
      );
      return { success: false, error: "Post has no content" };
    }

    const textContent = buildPostEmbeddingText(post);

    if (!textContent.trim()) {
      req.payload.logger.info(
        `[Embedding] Post ${postId} has no text content, skipping`
      );
      return { success: false, error: "Post has no text content" };
    }

    // Check if embedding already up to date
    const currentTextHash = createTextHash(textContent);
    if (post.embedding_text_hash === currentTextHash) {
      req.payload.logger.info(
        `[Embedding] Post ${postId} embedding already up to date, skipping generation`
      );
      return { success: true, skipped: true };
    }

    // Generate embedding
    req.payload.logger.info(
      `[Embedding] Generating embedding for post ${postId}`
    );

    const { vector, model, dimensions } = await generateEmbedding(textContent);
    if (
      model !== EMBEDDING_MODEL ||
      dimensions !== EMBEDDING_VECTOR_DIMENSIONS
    ) {
      return {
        success: false,
        error: `Unexpected embedding output: ${model} (${dimensions}D)`,
      };
    }

    // Direct DB update — bypasses version system, no extra version row created
    const postsTable = req.payload.db.tables.posts;
    await req.payload.db.drizzle
      .update(postsTable)
      .set({
        embedding_vector: `[${vector.join(",")}]`,
        embedding_model: model,
        embedding_dimensions: dimensions,
        embedding_generated_at: new Date().toISOString(),
        embedding_text_hash: currentTextHash,
      })
      .where(eq(postsTable.id, postId));

    req.payload.logger.info(
      `[Embedding] ✅ Generated ${dimensions}D embedding for post ${postId}`
    );

    // Compute recommendations after embedding is saved
    await computeRecommendationsForPost(postId, req);

    return { success: true, skipped: false };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    req.payload.logger.error(
      `[Embedding] Failed to generate embedding for post ${postId}: ${errorMessage}`
    );
    return { success: false, error: errorMessage };
  }
}

/**
 * Generate embedding for a note
 */
export async function generateEmbeddingForNote(
  noteId: number,
  req: PayloadRequest
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  try {
    // Fetch the note (cast needed: Payload's defaultPopulate narrows return types)
    const note = (await req.payload.findByID({
      collection: "notes",
      id: noteId,
      depth: 1,
    })) as unknown as Note | null;

    // Validation checks
    if (!note) {
      req.payload.logger.error(`[Embedding] Note ${noteId} not found`);
      return { success: false, error: "Note not found" };
    }

    if (note._status !== "published") {
      req.payload.logger.info(
        `[Embedding] Note ${noteId} is not published, skipping`
      );
      return { success: false, error: "Note is not published" };
    }

    if (!note.content) {
      req.payload.logger.info(
        `[Embedding] Note ${noteId} has no content, skipping`
      );
      return { success: false, error: "Note has no content" };
    }

    const textContent = buildNoteEmbeddingText(note);

    if (!textContent.trim()) {
      req.payload.logger.info(
        `[Embedding] Note ${noteId} has no text content, skipping`
      );
      return { success: false, error: "Note has no text content" };
    }

    // Check if embedding already up to date
    const currentTextHash = createTextHash(textContent);
    if (note.embedding_text_hash === currentTextHash) {
      req.payload.logger.info(
        `[Embedding] Note ${noteId} embedding already up to date, skipping generation`
      );
      return { success: true, skipped: true };
    }

    // Generate embedding
    req.payload.logger.info(
      `[Embedding] Generating embedding for note ${noteId}`
    );

    const { vector, model, dimensions } = await generateEmbedding(textContent);
    if (
      model !== EMBEDDING_MODEL ||
      dimensions !== EMBEDDING_VECTOR_DIMENSIONS
    ) {
      return {
        success: false,
        error: `Unexpected embedding output: ${model} (${dimensions}D)`,
      };
    }

    // Direct DB update — bypasses version system, no extra version row created
    const notesTable = req.payload.db.tables.notes;
    await req.payload.db.drizzle
      .update(notesTable)
      .set({
        embedding_vector: `[${vector.join(",")}]`,
        embedding_model: model,
        embedding_dimensions: dimensions,
        embedding_generated_at: new Date().toISOString(),
        embedding_text_hash: currentTextHash,
      })
      .where(eq(notesTable.id, noteId));

    req.payload.logger.info(
      `[Embedding] ✅ Generated ${dimensions}D embedding for note ${noteId}`
    );

    // Compute recommendations after embedding is saved
    await computeRecommendationsForNote(noteId, req);

    return { success: true, skipped: false };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    req.payload.logger.error(
      `[Embedding] Failed to generate embedding for note ${noteId}: ${errorMessage}`
    );
    return { success: false, error: errorMessage };
  }
}

const ACTIVITY_TYPE_LABELS: Record<string, string> = {
  read: "Read",
  watch: "Watched",
  listen: "Listened",
  play: "Played",
  visit: "Visited",
  learn: "Learned",
};

const REFERENCE_TYPE_LABELS: Record<string, string> = {
  book: "Book",
  movie: "Movie",
  tvShow: "TV Show",
  videoGame: "Video Game",
  music: "Music",
  podcast: "Podcast",
  series: "Series",
  person: "Person",
  company: "Company",
  video: "Video",
  match: "Match",
  course: "Course",
};

export function buildActivityEmbeddingText(activity: Activity): string {
  const referenceObj =
    typeof activity.reference === "object" && activity.reference !== null
      ? activity.reference
      : null;

  const activityLabel =
    ACTIVITY_TYPE_LABELS[activity.activityType] || activity.activityType;
  const referenceType = referenceObj?.type
    ? REFERENCE_TYPE_LABELS[referenceObj.type] || referenceObj.type
    : null;
  const notesText = activity.notes ? extractLexicalText(activity.notes) : "";

  const reviewTexts =
    activity.reviews
      ?.filter((r) => r.note && r.note.trim().length > 0)
      .map((r) => {
        const lyovsonName =
          typeof r.lyovson === "object" && r.lyovson !== null
            ? r.lyovson.name
            : null;
        return lyovsonName ? `${lyovsonName}'s note: ${r.note}` : r.note;
      })
      .filter(Boolean) || [];

  const textParts = [
    referenceObj?.title ? `${activityLabel} ${referenceObj.title}` : "Activity",
    referenceType ? `Type: ${referenceType}` : null,
    referenceObj?.description ? referenceObj.description : null,
    notesText ? `Notes: ${notesText}` : null,
    ...reviewTexts,
  ].filter(Boolean);

  return textParts.join("\n\n");
}

/**
 * Generate embedding for an activity
 */
export async function generateEmbeddingForActivity(
  activityId: number,
  req: PayloadRequest
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  try {
    // Fetch the activity (cast needed: Payload's defaultPopulate narrows return types)
    const activity = (await req.payload.findByID({
      collection: "activities",
      id: activityId,
      depth: 1, // Need reference for title
    })) as unknown as Activity | null;

    // Validation checks
    if (!activity) {
      req.payload.logger.error(`[Embedding] Activity ${activityId} not found`);
      return { success: false, error: "Activity not found" };
    }

    if (activity._status !== "published") {
      req.payload.logger.info(
        `[Embedding] Activity ${activityId} is not published, skipping`
      );
      return { success: false, error: "Activity is not published" };
    }

    const textContent = buildActivityEmbeddingText(activity);

    if (!textContent.trim()) {
      req.payload.logger.info(
        `[Embedding] Activity ${activityId} has no text content, skipping`
      );
      return { success: false, error: "Activity has no text content" };
    }

    // Check if embedding already up to date
    const currentTextHash = createTextHash(textContent);
    const activityWithEmbedding = activity as Activity & {
      embedding_text_hash?: string | null;
    };
    if (activityWithEmbedding.embedding_text_hash === currentTextHash) {
      req.payload.logger.info(
        `[Embedding] Activity ${activityId} embedding already up to date, skipping generation`
      );
      return { success: true, skipped: true };
    }

    // Generate embedding
    req.payload.logger.info(
      `[Embedding] Generating embedding for activity ${activityId}`
    );

    const { vector, model, dimensions } = await generateEmbedding(textContent);
    if (
      model !== EMBEDDING_MODEL ||
      dimensions !== EMBEDDING_VECTOR_DIMENSIONS
    ) {
      return {
        success: false,
        error: `Unexpected embedding output: ${model} (${dimensions}D)`,
      };
    }

    // Direct DB update — bypasses version system, no extra version row created
    const activitiesTable = req.payload.db.tables.activities;
    await req.payload.db.drizzle
      .update(activitiesTable)
      .set({
        embedding_vector: `[${vector.join(",")}]`,
        embedding_model: model,
        embedding_dimensions: dimensions,
        embedding_generated_at: new Date().toISOString(),
        embedding_text_hash: currentTextHash,
      } as Record<string, unknown>)
      .where(eq(activitiesTable.id, activityId));

    req.payload.logger.info(
      `[Embedding] ✅ Generated ${dimensions}D embedding for activity ${activityId}`
    );

    return { success: true, skipped: false };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    req.payload.logger.error(
      `[Embedding] Failed to generate embedding for activity ${activityId}: ${errorMessage}`
    );
    return { success: false, error: errorMessage };
  }
}

/**
 * Compute recommendations for a post (helper function)
 */
async function computeRecommendationsForPost(
  postId: number,
  req: PayloadRequest
): Promise<void> {
  try {
    // Verify post has embedding
    const post = await req.payload.findByID({
      collection: "posts",
      id: postId,
      select: {
        embedding_vector: true,
      },
    });

    if (!post?.embedding_vector) {
      req.payload.logger.info(
        `[Recommendations] Post ${postId} has no embedding, skipping recommendations`
      );
      return;
    }

    // Compute similar posts
    req.payload.logger.info(
      `[Recommendations] Computing recommendations for post ${postId}`
    );

    const similarPosts = await getSimilarPosts(postId, RECOMMENDATION_LIMIT);
    const recommendedIds = similarPosts.map((p) => p.id);

    // Direct DB update — bypasses version system, no extra version row created
    const postsTable = req.payload.db.tables.posts;
    await req.payload.db.drizzle
      .update(postsTable)
      .set({ recommended_post_ids: recommendedIds })
      .where(eq(postsTable.id, postId));

    req.payload.logger.info(
      `[Recommendations] ✅ Computed ${recommendedIds.length} recommendations for post ${postId}`
    );
  } catch (error) {
    req.payload.logger.error(
      `[Recommendations] Failed to compute recommendations for post ${postId}: ${error instanceof Error ? error.message : String(error)}`
    );
    // Don't throw - recommendations are non-critical
  }
}

/**
 * Compute recommendations for a note (helper function)
 */
async function computeRecommendationsForNote(
  noteId: number,
  req: PayloadRequest
): Promise<void> {
  try {
    // Verify note has embedding
    const note = await req.payload.findByID({
      collection: "notes",
      id: noteId,
      select: {
        embedding_vector: true,
      },
    });

    if (!note?.embedding_vector) {
      req.payload.logger.info(
        `[Recommendations] Note ${noteId} has no embedding, skipping recommendations`
      );
      return;
    }

    // Compute similar notes
    req.payload.logger.info(
      `[Recommendations] Computing recommendations for note ${noteId}`
    );

    const similarNotes = await getSimilarNotes(noteId, RECOMMENDATION_LIMIT);
    const recommendedIds = similarNotes.map((n) => n.id);

    // Direct DB update — bypasses version system, no extra version row created
    const notesTable = req.payload.db.tables.notes;
    await req.payload.db.drizzle
      .update(notesTable)
      .set({ recommended_note_ids: recommendedIds })
      .where(eq(notesTable.id, noteId));

    req.payload.logger.info(
      `[Recommendations] ✅ Computed ${recommendedIds.length} recommendations for note ${noteId}`
    );
  } catch (error) {
    req.payload.logger.error(
      `[Recommendations] Failed to compute recommendations for note ${noteId}: ${error instanceof Error ? error.message : String(error)}`
    );
    // Don't throw - recommendations are non-critical
  }
}
