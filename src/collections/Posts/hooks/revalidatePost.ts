import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";
import type { Post } from "@/payload-types";
import {
  isDraftOnlySave,
  revalidatePublicContent,
} from "@/utilities/revalidate-public-content";

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  context,
  req,
}) => {
  // Draft saves and autosaves don't change the published page.
  if (!(context?.skipRevalidation || isDraftOnlySave(req, doc))) {
    revalidatePublicContent("posts", doc, previousDoc);
  }
  return doc;
};

export const revalidateDelete: CollectionAfterDeleteHook<Post> = ({
  doc,
  context,
}) => {
  if (!context?.skipRevalidation) {
    revalidatePublicContent("posts", null, doc);
  }
  return doc;
};
