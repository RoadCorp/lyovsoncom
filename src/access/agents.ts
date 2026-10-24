import type { Access, PayloadRequest, Where } from "payload";

import { isLyovson } from "./is-lyovson";

/** True for an API-key agent (see the Agents collection). */
export function isAgent<T extends { collection?: string }>(
  user: T | null | undefined
): user is Extract<T, { collection: "agents" }> {
  return user?.collection === "agents";
}

/** The Lyovson a request acts for: the signed-in Lyovson, or an agent's. */
export function actingLyovsonId(
  user: PayloadRequest["user"]
): number | undefined {
  if (isLyovson(user)) {
    return user.id;
  }
  if (isAgent(user)) {
    const { lyovson } = user;
    return typeof lyovson === "object" ? lyovson.id : lyovson;
  }
}

const untrashed: Where = { deletedAt: { exists: false } };
const publicUntrashed: Where = {
  ...untrashed,
  visibility: { equals: "public" },
};

interface AgentScope {
  publicOnly: boolean;
}

/** Lyovsons and agents may create; `keepAgentDrafts` keeps agents to drafts. */
export const lyovsonOrAgent: Access = ({ req: { user } }) =>
  isLyovson(user) || isAgent(user);

/** Agents also read drafts, but nothing private or trashed. */
export const withAgentRead =
  (read: Access, { publicOnly }: AgentScope): Access =>
  (args) => {
    if (isAgent(args.req.user)) {
      return publicOnly ? publicUntrashed : untrashed;
    }
    return read(args);
  };

/** Lyovsons edit anything; agents edit only documents that are drafts. */
export const lyovsonOrAgentDraft =
  ({ publicOnly }: AgentScope): Access =>
  ({ req: { user } }) => {
    if (isLyovson(user)) {
      return true;
    }
    if (isAgent(user)) {
      return {
        and: [
          publicOnly ? publicUntrashed : untrashed,
          { _status: { equals: "draft" } },
        ],
      };
    }
    return false;
  };
