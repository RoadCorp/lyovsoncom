import { type CollectionBeforeChangeHook, Forbidden } from "payload";

import { isAgent } from "@/access/agents";

/**
 * Agents save drafts only: publishing and trashing stay with a Lyovson.
 * Update access checks the newest version, which is a draft whenever a
 * Lyovson has unpublished edits, so the live row decides what agents edit.
 */
export const keepAgentDrafts: CollectionBeforeChangeHook = async ({
  collection,
  data,
  operation,
  originalDoc,
  req,
}) => {
  if (!isAgent(req.user)) {
    return data;
  }
  if (data._status === "published" || data.deletedAt) {
    throw new Forbidden(req.t);
  }
  if (operation === "update") {
    const live = await req.payload.db.findOne<{ _status?: string; id: number }>(
      {
        collection: collection.slug,
        req,
        where: { id: { equals: originalDoc?.id } },
      }
    );
    if (live?._status !== "draft") {
      throw new Forbidden(req.t);
    }
  }
  return data;
};
