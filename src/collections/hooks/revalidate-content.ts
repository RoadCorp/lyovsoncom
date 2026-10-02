import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";
import {
  isDraftOnlySave,
  type PublicCollection,
  revalidatePublicContent,
} from "@/utilities/revalidate-public-content";

/** Invalidates a public collection's cached pages when a document changes. */
export const revalidateContentHooks = (collection: PublicCollection) => {
  const afterChange: CollectionAfterChangeHook = ({
    doc,
    previousDoc,
    context,
    req,
  }) => {
    // Draft saves and autosaves don't change the published page.
    if (!(context?.skipRevalidation || isDraftOnlySave(req, doc))) {
      revalidatePublicContent(collection, doc, previousDoc);
    }
    return doc;
  };

  const afterDelete: CollectionAfterDeleteHook = ({ doc, context }) => {
    if (!context?.skipRevalidation) {
      revalidatePublicContent(collection, null, doc);
    }
    return doc;
  };

  return { afterChange, afterDelete };
};
