import type { FieldHook, PayloadRequest } from "payload";
import { formatSlug } from "@/fields/slug/formatSlug";
import { getRelationId } from "@/utilities/relations";

function readStoredField(originalDoc: unknown, field: string): unknown {
  return originalDoc && typeof originalDoc === "object" && field in originalDoc
    ? (originalDoc as Record<string, unknown>)[field]
    : undefined;
}

async function getReferenceTitle(
  req: PayloadRequest,
  referenceId: number | string
): Promise<string | null> {
  try {
    const reference = (await req.payload.findByID({
      collection: "references",
      id: referenceId,
    })) as unknown as { title?: string };
    return reference?.title || null;
  } catch (error) {
    req.payload.logger.error(
      `Failed to fetch reference ${referenceId} for activity slug: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

/**
 * Activities have no title, so the slug comes from the referenced work's
 * title, falling back to the previous slug source when it can't be read.
 */
export const populateSlugSourceHook: FieldHook = async ({
  data,
  operation,
  originalDoc,
  req,
}) => {
  const storedSlugSource = readStoredField(originalDoc, "slugSource");
  const originalSlugSource =
    typeof storedSlugSource === "string" ? storedSlugSource : "";

  if (operation !== "create" && operation !== "update") {
    return data?.slugSource || originalSlugSource;
  }

  // Use incoming reference first; fall back to original document on partial updates.
  const referenceId = getRelationId(
    data?.reference ?? readStoredField(originalDoc, "reference") ?? null
  );
  const referenceTitle =
    referenceId === null ? null : await getReferenceTitle(req, referenceId);

  const slugSource = referenceTitle || data?.slugSource || originalSlugSource;
  if (slugSource && data) {
    data.slug = formatSlug(slugSource);
  }
  return slugSource;
};
