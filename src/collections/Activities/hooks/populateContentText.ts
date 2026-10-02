/**
 * Populate content_text field with extracted plain text from Lexical content
 *
 * This hook extracts plain text from the Lexical rich text editor content
 * and stores it in the content_text column for full-text search indexing.
 *
 * The content_text field is then included in the search_vector tsvector column
 * to enable keyword search across the entire activity content.
 */

import type { CollectionBeforeChangeHook, PayloadRequest } from "payload";
import { getActivityTypeLabel } from "@/utilities/activity-type";
import { extractLexicalText } from "@/utilities/extract-lexical-text";
import { getRelationId } from "@/utilities/relations";

async function getReferenceTitle(
  reference: unknown,
  req: PayloadRequest
): Promise<string | null> {
  // Populated references already carry their title.
  if (
    typeof reference === "object" &&
    reference !== null &&
    "title" in reference &&
    typeof reference.title === "string"
  ) {
    return reference.title;
  }

  const referenceId = getRelationId(reference);

  if (referenceId === null) {
    return null;
  }

  try {
    const ref = await req.payload.findByID({
      collection: "references",
      id: referenceId,
      depth: 0,
      select: { title: true },
      req,
    });
    return ref?.title ? String(ref.title) : null;
  } catch {
    return null;
  }
}

export const populateContentTextHook: CollectionBeforeChangeHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  // Only run on create and update operations
  if (operation !== "create" && operation !== "update") {
    return data;
  }

  // Partial updates only carry changed fields; fall back to the stored doc.
  const reference = data.reference ?? originalDoc?.reference;
  const activityType = data.activityType ?? originalDoc?.activityType;
  const notes = data.notes ?? originalDoc?.notes;

  const parts: string[] = [];

  const referenceTitle = await getReferenceTitle(reference, req);
  if (referenceTitle) {
    const label = getActivityTypeLabel(activityType);
    parts.push(`${label} ${referenceTitle}`);
  }

  const notesText = notes ? extractLexicalText(notes) : "";
  if (notesText) {
    parts.push(notesText);
  }

  data.content_text = parts.length > 0 ? parts.join(" ") : null;

  return data;
};
