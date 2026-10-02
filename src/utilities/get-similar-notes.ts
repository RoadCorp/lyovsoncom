import type { Note } from "@/payload-types";
import { getSimilarContent } from "@/utilities/get-similar-content";

export function getSimilarNotes(noteId: number, limit = 3): Promise<Note[]> {
  return getSimilarContent("notes", noteId, limit);
}
