import type { AccessArgs } from "payload";

import type { Lyovson } from "@/payload-types";
import { isLyovson } from "./is-lyovson";

type isAuthenticated = (args: AccessArgs<Lyovson>) => boolean;

export const authenticated: isAuthenticated = ({ req: { user } }) => {
  return isLyovson(user);
};
