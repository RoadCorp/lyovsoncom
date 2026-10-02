import type {
  ActivitiesSelect,
  NotesSelect,
  PostsSelect,
} from "@/payload-types";

// Search-only fields that never render: embeddings and the plain-text copy of
// the rich text. Excluding them keeps them out of public reads and cache entries.
export const publicContentSelect = {
  content_text: false,
  embedding_vector: false,
  embedding_model: false,
  embedding_dimensions: false,
  embedding_generated_at: false,
  embedding_text_hash: false,
} as const satisfies NotesSelect<false> &
  ActivitiesSelect<false> &
  PostsSelect<false>;
