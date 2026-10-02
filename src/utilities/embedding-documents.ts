import type { Activity, Note, Post } from "@/payload-types";
import { getActivityTypeLabel } from "@/utilities/activity-type";
import {
  buildEmbeddingText,
  type EmbeddableCollection,
} from "@/utilities/generate-embedding-helpers";
import {
  absoluteUrl,
  activityRoute,
  noteRoute,
  postRoute,
} from "@/utilities/routes";

const WORD_SPLIT_REGEX = /\s+/;
const WORDS_PER_MINUTE = 200;
const VECTOR_BRACKETS = /^\[|\]$/g;

export type EmbeddableDoc = Activity | Note | Post;

export interface StoredEmbedding {
  dimensions?: number | null;
  generatedAt?: string | null;
  model?: string | null;
  textHash?: string | null;
  vector: number[];
}

export function readStoredEmbedding(
  doc: EmbeddableDoc
): StoredEmbedding | null {
  const raw = doc.embedding_vector;
  if (typeof raw !== "string" || !raw) {
    return null;
  }
  return {
    vector: raw.replace(VECTOR_BRACKETS, "").split(",").map(Number),
    model: doc.embedding_model,
    dimensions: doc.embedding_dimensions,
    generatedAt: doc.embedding_generated_at,
    textHash: doc.embedding_text_hash,
  };
}

/** Title, public URL and collection-specific extras for the response. */
export function describeEmbeddableDoc(
  collection: EmbeddableCollection,
  doc: EmbeddableDoc
) {
  if (collection === "activities") {
    const activity = doc as Activity;
    const reference =
      typeof activity.reference === "object" ? activity.reference : null;
    const path = activityRoute(activity);
    return {
      title: reference?.title
        ? `${getActivityTypeLabel(activity.activityType)} ${reference.title}`
        : "Activity",
      url: absoluteUrl(path ?? `/activities/unknown/${activity.slug}`),
      content: activity.notes,
    };
  }

  if (collection === "notes") {
    const note = doc as Note;
    const wordCount = buildEmbeddingText("notes", note).split(
      WORD_SPLIT_REGEX
    ).length;
    return {
      title: note.title,
      url: absoluteUrl(noteRoute(note.slug ?? "")),
      content: note.content,
      metadata: {
        type: "note",
        wordCount,
        readingTime: Math.ceil(wordCount / WORDS_PER_MINUTE),
        contentFormat: "lexical",
        hasContent: Boolean(note.content),
      },
    };
  }

  const post = doc as Post;
  return {
    title: post.title,
    url: absoluteUrl(postRoute(post.slug ?? "")),
    content: post.content,
  };
}
