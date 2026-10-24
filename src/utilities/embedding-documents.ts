import type { Activity, Post } from "@/payload-types";
import { getActivityTypeLabel } from "@/utilities/activity-type";
import type { EmbeddableCollection } from "@/utilities/generate-embedding-helpers";
import {
  absoluteUrl,
  activitiesRoute,
  activityRoute,
  postRoute,
} from "@/utilities/routes";

const VECTOR_BRACKETS = /^\[|\]$/g;

export type EmbeddableDoc = Activity | Post;

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
      url: absoluteUrl(path ?? activitiesRoute()),
      content: activity.notes,
    };
  }

  const post = doc as Post;
  return {
    title: post.title,
    url: absoluteUrl(postRoute(post.slug ?? "")),
    content: post.content,
  };
}
