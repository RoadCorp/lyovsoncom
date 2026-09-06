import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";
import type { Post } from "@/payload-types";
import { revalidatePublicContent } from "@/utilities/revalidate-public-content";

export const revalidatePost: CollectionAfterChangeHook<Post> = ({
  doc,
  previousDoc,
  context,
}) => {
  if (!context?.skipRevalidation) {
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
