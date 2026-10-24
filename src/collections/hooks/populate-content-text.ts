/**
 * Populate content_text field with extracted plain text from Lexical content
 *
 * This hook extracts plain text from the Lexical rich text editor content
 * and stores it in the content_text column for full-text search indexing.
 *
 * The content_text field is then included in the search_vector tsvector column
 * to enable keyword search across the entire post content, not just
 * the title. Activities index more than their rich text and use their own hook.
 */

import type { CollectionBeforeChangeHook } from "payload";
import { extractTextFromContent } from "@/utilities/generate-embedding";

export const populateContentTextHook: CollectionBeforeChangeHook = ({
  data,
  operation,
}) => {
  // Only run on create and update operations
  if (operation !== "create" && operation !== "update") {
    return data;
  }

  // Partial updates (trash, restore, a title fix) carry no content; keep the
  // stored text rather than clearing it.
  if (!("content" in data)) {
    return data;
  }

  data.content_text = data.content
    ? extractTextFromContent(data.content) || null
    : null;

  return data;
};
