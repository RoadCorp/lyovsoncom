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

async function getReferenceTitle(
  reference: unknown,
  req: PayloadRequest
): Promise<string | null> {
  let referenceId: string | null = null;
  if (typeof reference === "string") {
    referenceId = reference;
  } else if (
    typeof reference === "object" &&
    reference !== null &&
    "id" in reference
  ) {
    referenceId = String((reference as { id: string }).id);
  }

  if (!referenceId) {
    return null;
  }

  try {
    const ref = await req.payload.findByID({
      collection: "references",
      id: referenceId,
    });
    if (ref && typeof ref === "object" && "title" in ref) {
      return String((ref as { title: string }).title);
    }
    return null;
  } catch {
    return null;
  }
}

export const populateContentTextHook: CollectionBeforeChangeHook = async ({
  data,
  operation,
  req,
}) => {
  // Only run on create and update operations
  if (operation !== "create" && operation !== "update") {
    return data;
  }

  const parts: string[] = [];

  const referenceTitle = await getReferenceTitle(data.reference, req);
  if (referenceTitle) {
    const label = getActivityTypeLabel(data.activityType);
    parts.push(`${label} ${referenceTitle}`);
  }

  const notesText = data.notes ? extractLexicalText(data.notes) : "";
  if (notesText) {
    parts.push(notesText);
  }

  data.content_text = parts.length > 0 ? parts.join(" ") : null;

  return data;
};
