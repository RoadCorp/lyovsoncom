import type { CollectionBeforeChangeHook } from "payload";
import { extractLexicalText } from "./extract-lexical-text";
import { getRelationId } from "./relations";

/**
 * How a tracked field is compared with the stored document:
 * - "value": stable JSON equality
 * - "relation": relationship ids, whether or not the value is populated
 * - "richText": extracted plain text (the part that feeds the embedding)
 * - "reviews": activity review rows by author id, note and rating
 */
type TrackedFieldKind = "relation" | "reviews" | "richText" | "value";

interface MarkEmbeddingStaleOptions {
  requirePublicVisibility?: boolean;
  trackedFields: Readonly<Record<string, TrackedFieldKind>>;
}

interface EmbeddableDoc {
  _status?: "draft" | "published" | null;
  visibility?: "public" | "private" | null;
}

type MutableDoc = Record<string, unknown> & EmbeddableDoc;

function shouldSkipFromContext(context: unknown): boolean {
  if (!(context && typeof context === "object")) {
    return false;
  }

  return Boolean(
    "skipEmbeddingGeneration" in context && context.skipEmbeddingGeneration
  );
}

function isAutoSaveOrDraft(req: { query?: Record<string, unknown> }): boolean {
  return req.query?.autosave === "true" || req.query?.draft === "true";
}

function resolveField<K extends keyof EmbeddableDoc>(
  data: MutableDoc,
  original: MutableDoc | null,
  field: K
): EmbeddableDoc[K] {
  return data[field] ?? original?.[field];
}

function stableStringify(value: unknown): string {
  return JSON.stringify(value ?? null, (_key, nested: unknown) =>
    nested && typeof nested === "object" && !Array.isArray(nested)
      ? Object.fromEntries(
          Object.entries(nested).sort(([a], [b]) => a.localeCompare(b))
        )
      : nested
  );
}

function relationIds(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => getRelationId(item) ?? item);
  }
  return getRelationId(value) ?? value ?? null;
}

function comparableValue(kind: TrackedFieldKind, value: unknown): unknown {
  switch (kind) {
    case "relation":
      return relationIds(value);
    case "richText":
      return value ? extractLexicalText(value).trim() : "";
    case "reviews":
      return Array.isArray(value)
        ? value.map((review) => ({
            lyovson: relationIds(review?.lyovson),
            note: review?.note ?? null,
            rating: review?.rating ?? null,
          }))
        : [];
    default:
      return value ?? null;
  }
}

/**
 * The admin submits every field on save, so presence in `data` says nothing.
 * A field counts as changed only when its embedding-relevant value differs
 * from the stored document; fields missing from a partial update are unchanged.
 */
export function hasTrackedFieldChanges(
  data: Record<string, unknown>,
  original: Record<string, unknown> | null,
  trackedFields: Readonly<Record<string, TrackedFieldKind>>
): boolean {
  return Object.entries(trackedFields).some(
    ([field, kind]) =>
      field in data &&
      stableStringify(comparableValue(kind, data[field])) !==
        stableStringify(comparableValue(kind, original?.[field]))
  );
}

function isWriteOperation(operation: string): boolean {
  return operation === "create" || operation === "update";
}

function toMutableDoc(doc: unknown): MutableDoc | null {
  return doc && typeof doc === "object" ? (doc as MutableDoc) : null;
}

function createMarkEmbeddingStaleHook({
  requirePublicVisibility = false,
  trackedFields,
}: MarkEmbeddingStaleOptions): CollectionBeforeChangeHook {
  return ({ context, data, operation, originalDoc, req }) => {
    if (!(isWriteOperation(operation) && data) || typeof data !== "object") {
      return data;
    }

    if (shouldSkipFromContext(context) || isAutoSaveOrDraft(req)) {
      return data;
    }

    const mutableData = data as MutableDoc;
    const original = toMutableDoc(originalDoc);

    if (resolveField(mutableData, original, "_status") !== "published") {
      return data;
    }

    if (
      requirePublicVisibility &&
      resolveField(mutableData, original, "visibility") !== "public"
    ) {
      return data;
    }

    const becamePublished = original?._status !== "published";
    const hasMeaningfulChanges =
      operation === "create" ||
      hasTrackedFieldChanges(mutableData, original, trackedFields);

    if (!(becamePublished || hasMeaningfulChanges)) {
      return data;
    }

    mutableData.embedding_text_hash = null;
    return mutableData;
  };
}

export const markPostEmbeddingStaleHook = createMarkEmbeddingStaleHook({
  trackedFields: {
    title: "value",
    description: "value",
    content: "richText",
    topics: "relation",
    project: "relation",
  },
});

export const markNoteEmbeddingStaleHook = createMarkEmbeddingStaleHook({
  trackedFields: {
    title: "value",
    type: "value",
    author: "value",
    quotedPerson: "value",
    topics: "relation",
    content: "richText",
  },
  requirePublicVisibility: true,
});

export const markActivityEmbeddingStaleHook = createMarkEmbeddingStaleHook({
  trackedFields: {
    reference: "relation",
    activityType: "value",
    notes: "richText",
    reviews: "reviews",
  },
  requirePublicVisibility: true,
});
