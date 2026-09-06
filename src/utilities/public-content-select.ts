import type { ActivitiesSelect, NotesSelect } from "@/payload-types";

export const publicContentSelect = {
  embedding_vector: false,
  embedding_model: false,
  embedding_dimensions: false,
  embedding_generated_at: false,
  embedding_text_hash: false,
} as const satisfies NotesSelect<false> & ActivitiesSelect<false>;
