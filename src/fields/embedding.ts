import type { Field, TextField } from "payload";
import { embeddingFieldRead } from "@/access/private-field-read";

/** Hidden from anonymous reads and written only by hooks and embedding jobs. */
const hookManagedAccess = () => ({
  read: embeddingFieldRead,
  update: () => false,
});

/**
 * Plain text extracted from the document for full-text search indexing.
 * `source` names what the text is extracted from in the admin description.
 */
export const contentTextField = (source = "rich text content"): TextField => ({
  name: "content_text",
  type: "text",
  access: hookManagedAccess(),
  admin: {
    hidden: true,
    description: `Plain text extracted from ${source} for full-text search indexing`,
  },
});

/** Pre-computed embedding for semantic search, plus what produced it. */
export const embeddingFields = (): Field[] => [
  {
    name: "embedding_vector",
    type: "text", // Maps to vector(1536) in the database
    access: hookManagedAccess(),
    admin: {
      hidden: true,
      description: "Vector embedding for semantic search (pgvector format)",
    },
  },
  {
    name: "embedding_model",
    type: "text",
    access: hookManagedAccess(),
    admin: {
      hidden: true,
    },
  },
  {
    name: "embedding_dimensions",
    type: "number",
    access: hookManagedAccess(),
    admin: {
      hidden: true,
    },
  },
  {
    name: "embedding_generated_at",
    type: "date",
    access: hookManagedAccess(),
    admin: {
      hidden: true,
    },
  },
  {
    name: "embedding_text_hash",
    type: "text",
    access: hookManagedAccess(),
    admin: {
      hidden: true,
    },
  },
];
