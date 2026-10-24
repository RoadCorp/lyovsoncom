import type { Access } from "payload";
import { isAgent } from "./agents";
import { isLyovson } from "./is-lyovson";

export const authenticatedOrPublishedPublic: Access = ({ req: { user } }) => {
  if (isLyovson(user) || isAgent(user)) {
    return true;
  }

  return {
    _status: {
      equals: "published",
    },
    // `?trash=true` would otherwise list trashed documents.
    deletedAt: {
      exists: false,
    },
    visibility: {
      equals: "public",
    },
  };
};
