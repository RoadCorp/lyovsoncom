import { cacheLife, cacheTag } from "next/cache";
import type { PaginatedDocs } from "payload";
import type { Note } from "@/payload-types";
import { publicNotesWhere } from "@/utilities/content-queries";
import { getPayloadClient } from "@/utilities/payload-client";

export async function getNote(slug: string): Promise<Note | null> {
  "use cache";
  cacheTag("notes");
  cacheTag(`note-${slug}`);
  cacheLife("notes");

  const payload = await getPayloadClient();
  const response = await payload.find({
    collection: "notes",
    where: {
      ...publicNotesWhere(),
      slug: {
        equals: slug,
      },
    },
    limit: 1,
    depth: 2,
  });

  return (response.docs[0] as Note) || null;
}

export async function getLatestNotes(limit = 12): Promise<PaginatedDocs<Note>> {
  "use cache";
  cacheTag("notes");
  cacheTag("homepage");
  cacheLife("notes");

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "notes",
    depth: 2,
    limit,
    overrideAccess: false,
    sort: "-publishedAt",
    where: publicNotesWhere(),
  });

  return {
    ...result,
    docs: result.docs as Note[],
  };
}

export async function getPaginatedNotes(
  pageNumber: number,
  limit = 12
): Promise<PaginatedDocs<Note>> {
  "use cache";
  cacheTag("notes");
  cacheTag(`notes-page-${pageNumber}`);
  cacheLife("notes");

  const payload = await getPayloadClient();
  const result = await payload.find({
    collection: "notes",
    depth: 2,
    limit,
    page: pageNumber,
    overrideAccess: false,
    sort: "-publishedAt",
    where: publicNotesWhere(),
  });

  return {
    ...result,
    docs: result.docs as Note[],
  };
}

export async function getNoteCount() {
  "use cache";
  cacheTag("notes");
  cacheTag("note-count");
  cacheLife("notes");

  const payload = await getPayloadClient();
  return await payload.count({
    collection: "notes",
    overrideAccess: false,
    where: publicNotesWhere(),
  });
}
