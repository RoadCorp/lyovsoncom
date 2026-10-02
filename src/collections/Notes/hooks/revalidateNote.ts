import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";
import type { Note } from "@/payload-types";
import {
  isDraftOnlySave,
  revalidatePublicContent,
} from "@/utilities/revalidate-public-content";

export const revalidateNote: CollectionAfterChangeHook<Note> = ({
  doc,
  previousDoc,
  context,
  req,
}) => {
  // Draft saves and autosaves don't change the published page.
  if (!(context?.skipRevalidation || isDraftOnlySave(req, doc))) {
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
