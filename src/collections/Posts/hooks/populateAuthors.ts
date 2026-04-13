import type { CollectionAfterReadHook } from "payload";
import type { Lyovson } from "@/payload-types";

// The `lyovson` collection has access control locked so that lyovsons are not publicly accessible
// This means that we need to populate the authors manually here to protect lyovson privacy
// GraphQL will not return mutated lyovson data that differs from the underlying schema
// So we use an alternative `populatedAuthors` field to populate the lyovson data, hidden from the admin UI
export const populateAuthors: CollectionAfterReadHook = async ({
  doc,
  req,
  req: { payload },
}) => {
  if (doc?.authors) {
    const authorDocs: Lyovson[] = [];
    const processedIds = new Set<string | number>();

    for (const author of doc.authors) {
      const authorId = typeof author === "object" ? author?.id : author;

      // Skip if we've already processed this author ID
      if (!authorId || processedIds.has(authorId)) {
        continue;
      }

      processedIds.add(authorId);

      const authorDoc = await payload.findByID({
        id: authorId,
        collection: "lyovsons",
        depth: 0,
        req,
        overrideAccess: true,
      });

      if (authorDoc) {
        authorDocs.push(authorDoc as Lyovson);
      }
    }

    doc.populatedAuthors = authorDocs.map((authorDoc) => ({
      id: authorDoc.id,
      name: authorDoc.name,
      username: authorDoc.username,
    }));
  }

  return doc;
};
