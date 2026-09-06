import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";
import type { Note } from "@/payload-types";
import { revalidatePublicContent } from "@/utilities/revalidate-public-content";

export const revalidateNote: CollectionAfterChangeHook<Note> = ({
  doc,
  previousDoc,
  context,
}) => {
  if (!context?.skipRevalidation) {
    revalidatePublicContent("notes", doc, previousDoc);
  }
  return doc;
};

export const revalidateNoteDelete: CollectionAfterDeleteHook<Note> = ({
  doc,
  context,
}) => {
  if (!context?.skipRevalidation) {
    revalidatePublicContent("notes", null, doc);
  }
  return doc;
};
