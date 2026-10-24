import type { Access, PayloadRequest } from "payload";

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

/** Lyovsons and their agents: full access to content and media. */
export const lyovsonOrAgent: Access = ({ req: { user } }) =>
  isLyovson(user) || isAgent(user);
