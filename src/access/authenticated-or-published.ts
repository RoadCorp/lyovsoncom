import type { Access } from "payload";

export const authenticatedOrPublished: Access = ({ req: { user } }) => {
  if (user) {
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
  };
};
