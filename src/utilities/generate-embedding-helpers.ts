import { and, eq } from "@payloadcms/db-vercel-postgres/drizzle";
import { revalidateTag } from "next/cache";
import type { Payload } from "payload";
import type { Activity, Note, Post } from "@/payload-types";
import { getActivityTypeLabel } from "@/utilities/activity-type";
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
  const contentText = extractLexicalText(post.content);
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
  const contentText = extractLexicalText(note.content);
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
 * Recommendation lists are rendered from the cached post or note, so refresh
 * that entry (stale-while-revalidate). Outside a request, such as a CLI
 * script, there is no cache to refresh.
 */
function refreshRecommendationCache(tag: string, profile: "notes" | "posts") {
  try {
    revalidateTag(tag, profile);
  } catch {
    // Not running inside a Next.js request.
  }
}

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
    typeof activity.reference === "object" ? activity.reference : null;

  const activityLabel = getActivityTypeLabel(activity.activityType);
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

export type EmbeddableCollection = "activities" | "notes" | "posts";

export const EMBEDDABLE_COLLECTIONS: readonly EmbeddableCollection[] = [
  "posts",
  "notes",
  "activities",
];

export function isEmbeddableCollection(
  value: unknown
): value is EmbeddableCollection {
  return EMBEDDABLE_COLLECTIONS.includes(value as EmbeddableCollection);
}

export interface EmbeddingResult {
  error?: string;
  skipped?: boolean;
  success: boolean;
}

interface EmbeddableDocs {
  activities: Activity;
  notes: Note;
  posts: Post;
}

interface EmbeddableSpec<C extends EmbeddableCollection> {
  buildText: (doc: EmbeddableDocs[C]) => string;
  /** Relationship depth the embedding text needs (topics, project, reference). */
  depth: number;
  label: string;
  /** Recommendations stored on the document after its embedding changes. */
  recommendations?: {
    cacheProfile: "notes" | "posts";
    cacheTagPrefix: "note" | "post";
    column: "recommended_note_ids" | "recommended_post_ids";
    findSimilar: (id: number, limit: number) => Promise<{ id: number }[]>;
  };
  requiresContent: boolean;
}

export const EMBEDDABLE: { [C in EmbeddableCollection]: EmbeddableSpec<C> } = {
  posts: {
    buildText: buildPostEmbeddingText,
    depth: 2,
    label: "Post",
    recommendations: {
      cacheProfile: "posts",
      cacheTagPrefix: "post",
      column: "recommended_post_ids",
      findSimilar: getSimilarPosts,
    },
    requiresContent: true,
  },
  notes: {
    buildText: buildNoteEmbeddingText,
    depth: 1,
    label: "Note",
    recommendations: {
      cacheProfile: "notes",
      cacheTagPrefix: "note",
      column: "recommended_note_ids",
      findSimilar: getSimilarNotes,
    },
    requiresContent: true,
  },
  activities: {
    buildText: buildActivityEmbeddingText,
    depth: 1,
    label: "Activity",
    requiresContent: false,
  },
};

/** Builds the embedding text for any embeddable document. */
export function buildEmbeddingText(
  collection: EmbeddableCollection,
  doc: Activity | Note | Post
): string {
  // The spec map ties each collection to its own document type; TypeScript
  // can't follow that through a union key, so widen once here.
  const buildText = EMBEDDABLE[collection].buildText as (
    doc: Activity | Note | Post
  ) => string;
  return buildText(doc);
}

/**
 * Writes the embedding straight to the table (no version row), but only if
 * the document is unchanged since it was read. A save during the provider
 * call leaves the stale marker in place for the next sync.
 */
async function persistEmbedding(args: {
  collection: EmbeddableCollection;
  dimensions: number;
  id: number;
  model: string;
  payload: Payload;
  readUpdatedAt: string;
  textHash: string;
  vector: number[];
}): Promise<boolean> {
  const { collection, id, payload } = args;
  const table = payload.db.tables[collection];
  const written = await payload.db.drizzle
    .update(table)
    .set({
      embedding_vector: `[${args.vector.join(",")}]`,
      embedding_model: args.model,
      embedding_dimensions: args.dimensions,
      embedding_generated_at: new Date().toISOString(),
      embedding_text_hash: args.textHash,
    } as Record<string, unknown>)
    .where(and(eq(table.id, id), eq(table.updatedAt, args.readUpdatedAt)))
    .returning({ id: table.id });

  if (written.length === 0) {
    payload.logger.warn(
      `[Embedding] ${collection} ${id} changed during generation; left stale for the next sync`
    );
    return false;
  }

  return true;
}

/**
 * Embeds one published document and, for posts and notes, refreshes its
 * recommendations. Unchanged text is skipped unless `force` is set; the
 * write is conditional on the document not changing meanwhile.
 */
export async function generateEmbeddingFor(
  collection: EmbeddableCollection,
  id: number,
  payload: Payload,
  { force = false }: { force?: boolean } = {}
): Promise<EmbeddingResult> {
  const spec = EMBEDDABLE[collection];
  const name = `${spec.label.toLowerCase()} ${id}`;

  try {
    const doc = (await payload.findByID({
      collection,
      id,
      depth: spec.depth,
    })) as Activity | Note | Post | null;

    if (!doc) {
      payload.logger.error(`[Embedding] ${spec.label} ${id} not found`);
      return { success: false, error: `${spec.label} not found` };
    }

    if (doc._status !== "published") {
      payload.logger.info(
        `[Embedding] ${spec.label} ${id} is not published, skipping`
      );
      return { success: false, error: `${spec.label} is not published` };
    }

    if (spec.requiresContent && !("content" in doc && doc.content)) {
      payload.logger.info(
        `[Embedding] ${spec.label} ${id} has no content, skipping`
      );
      return { success: false, error: `${spec.label} has no content` };
    }

    const textContent = buildEmbeddingText(collection, doc);
    if (!textContent.trim()) {
      payload.logger.info(
        `[Embedding] ${spec.label} ${id} has no text content, skipping`
      );
      return { success: false, error: `${spec.label} has no text content` };
    }

    const textHash = createTextHash(textContent);
    if (!force && doc.embedding_text_hash === textHash) {
      payload.logger.info(
        `[Embedding] ${spec.label} ${id} embedding already up to date, skipping generation`
      );
      return { success: true, skipped: true };
    }

    payload.logger.info(`[Embedding] Generating embedding for ${name}`);
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

    const written = await persistEmbedding({
      collection,
      dimensions,
      id,
      model,
      payload,
      readUpdatedAt: doc.updatedAt,
      textHash,
      vector,
    });
    if (!written) {
      return { success: true, skipped: true };
    }

    payload.logger.info(
      `[Embedding] ✅ Generated ${dimensions}D embedding for ${name}`
    );

    if (spec.recommendations) {
      await computeRecommendations(collection, id, payload);
    }

    return { success: true, skipped: false };
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    payload.logger.error(
      `[Embedding] Failed to generate embedding for ${name}: ${errorMessage}`
    );
    return { success: false, error: errorMessage };
  }
}

/** Stores the nearest documents' ids on a post or note. Non-critical. */
async function computeRecommendations(
  collection: EmbeddableCollection,
  id: number,
  payload: Payload
): Promise<void> {
  const spec = EMBEDDABLE[collection];
  const recommendations = spec.recommendations;
  if (!recommendations) {
    return;
  }

  try {
    const doc = (await payload.findByID({
      collection,
      id,
      select: { embedding_vector: true, slug: true },
    })) as { embedding_vector?: unknown; slug?: string | null } | null;

    if (!doc?.embedding_vector) {
      payload.logger.info(
        `[Recommendations] ${spec.label} ${id} has no embedding, skipping recommendations`
      );
      return;
    }

    const similar = await recommendations.findSimilar(id, RECOMMENDATION_LIMIT);
    const recommendedIds = similar.map((item) => item.id);

    // Direct write: no version row, updatedAt unchanged.
    const table = payload.db.tables[collection];
    await payload.db.drizzle
      .update(table)
      .set({ [recommendations.column]: recommendedIds } as Record<
        string,
        unknown
      >)
      .where(eq(table.id, id));

    if (doc.slug) {
      refreshRecommendationCache(
        `${recommendations.cacheTagPrefix}-${doc.slug}`,
        recommendations.cacheProfile
      );
    }

    payload.logger.info(
      `[Recommendations] ✅ Computed ${recommendedIds.length} recommendations for ${spec.label.toLowerCase()} ${id}`
    );
  } catch (error) {
    payload.logger.error(
      `[Recommendations] Failed to compute recommendations for ${spec.label.toLowerCase()} ${id}: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}
