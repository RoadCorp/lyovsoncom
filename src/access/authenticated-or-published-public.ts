import type { Access } from "payload";

export const authenticatedOrPublishedPublic: Access = ({ req: { user } }) => {
  if (user) {
    return true;
  }

  return {
    _status: {
      equals: "published",
    },
    visibility: {
      equals: "public",
    },
  };
};
