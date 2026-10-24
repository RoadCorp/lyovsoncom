import { type CollectionBeforeChangeHook, Forbidden } from "payload";

import { isAgent } from "@/access/agents";

/** Agents save drafts only: publishing and trashing stay with a Lyovson. */
export const keepAgentDrafts: CollectionBeforeChangeHook = ({ data, req }) => {
  if (isAgent(req.user) && (data._status === "published" || data.deletedAt)) {
    throw new Forbidden(req.t);
  }
  return data;
};
