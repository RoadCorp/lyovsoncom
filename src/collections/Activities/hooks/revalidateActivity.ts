import type {
  CollectionAfterChangeHook,
  CollectionAfterDeleteHook,
} from "payload";
import type { Activity } from "@/payload-types";
import {
  isDraftOnlySave,
  revalidatePublicContent,
} from "@/utilities/revalidate-public-content";

export const revalidateActivity: CollectionAfterChangeHook<Activity> = ({
  doc,
  previousDoc,
  context,
  req,
}) => {
  // Draft saves and autosaves don't change the published page.
  if (!(context?.skipRevalidation || isDraftOnlySave(req, doc))) {
    revalidatePublicContent("activities", doc, previousDoc);
  }
  return doc;
};

export const revalidateActivityDelete: CollectionAfterDeleteHook<Activity> = ({
  doc,
  context,
}) => {
  if (!context?.skipRevalidation) {
    revalidatePublicContent("activities", null, doc);
  }
  return doc;
};
