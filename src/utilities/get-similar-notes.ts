import configPromise from "@payload-config";
import {
  and,
  asc,
  eq,
  isNotNull,
  ne,
  sql,
} from "@payloadcms/db-vercel-postgres/drizzle";
import { getPayload } from "payload";
import type { Note } from "@/payload-types";
import { EMBEDDING_VECTOR_DIMENSIONS } from "@/utilities/generate-embedding";

export async function getSimilarNotes(
  noteId: number,
  limit = 3
): Promise<Note[]> {
  const payload = await getPayload({ config: configPromise });

  const currentNote = await payload.findByID({
    collection: "notes",
    id: noteId,
    select: {
      embedding_vector: true,
    },
  });

  if (!currentNote?.embedding_vector) {
    return [];
  }

  // Parse pgvector string format "[1.0,2.0,...]" to array
  let embedding: number[];
  try {
    embedding = JSON.parse(currentNote.embedding_vector);
  } catch {
    return [];
  }

  if (embedding.length !== EMBEDDING_VECTOR_DIMENSIONS) {
    return [];
  }

  const notesTable = payload.db.tables.notes;

  const similarNotes = await payload.db.drizzle
    .select({
      id: notesTable.id,
    })
    .from(notesTable)
    .where(
      and(
        ne(notesTable.id, noteId),
        eq(notesTable._status, "published"),
        eq(notesTable.visibility, "public"), // Keep parity with public note access
        isNotNull(notesTable.embedding_vector)
      )
    )
    // Ascending cosine distance allows index use; stored strings need vector casts.
    .orderBy(
      asc(
        sql`${notesTable.embedding_vector}::vector <=> ${JSON.stringify(embedding)}::vector`
      )
    )
    .limit(limit);

  const fullNotes = await Promise.all(
    similarNotes.map((n) =>
      payload.findByID({
        collection: "notes",
        id: n.id,
        depth: 1,
      })
    )
  );

  return fullNotes.filter(Boolean) as Note[];
}
