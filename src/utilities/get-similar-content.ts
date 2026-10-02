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
import type { Note, Post } from "@/payload-types";
import { EMBEDDING_VECTOR_DIMENSIONS } from "@/utilities/generate-embedding";

interface SimilarContentDocs {
  notes: Note;
  posts: Post;
}

type SimilarContentCollection = keyof SimilarContentDocs;

export async function getSimilarContent<
  TCollection extends SimilarContentCollection,
>(
  collection: TCollection,
  id: number,
  limit = 3
): Promise<SimilarContentDocs[TCollection][]> {
  const payload = await getPayload({ config: configPromise });

  const current = await payload.findByID({
    collection: collection as SimilarContentCollection,
    id,
    select: {
      embedding_vector: true,
    },
  });

  if (!current?.embedding_vector) {
    return [];
  }

  // Parse pgvector string format "[1.0,2.0,...]" to array
  let embedding: number[];
  try {
    embedding = JSON.parse(current.embedding_vector);
  } catch {
    return [];
  }

  if (embedding.length !== EMBEDDING_VECTOR_DIMENSIONS) {
    return [];
  }

  const table = payload.db.tables[collection];

  const similar = await payload.db.drizzle
    .select({
      id: table.id,
    })
    .from(table)
    .where(
      and(
        ne(table.id, id),
        eq(table._status, "published"),
        // Keep parity with public note access
        collection === "notes" ? eq(table.visibility, "public") : undefined,
        isNotNull(table.embedding_vector)
      )
    )
    // Ascending cosine distance allows index use; stored strings need vector casts.
    .orderBy(
      asc(
        sql`${table.embedding_vector}::vector <=> ${JSON.stringify(embedding)}::vector`
      )
    )
    .limit(limit);

  const fullDocs = await Promise.all(
    similar.map((doc) =>
      payload.findByID({
        collection,
        id: doc.id,
        depth: 1,
      })
    )
  );

  return fullDocs.filter(Boolean) as SimilarContentDocs[TCollection][];
}
