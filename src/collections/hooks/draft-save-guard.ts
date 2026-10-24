import type { CollectionBeforeOperationHook } from "payload";
import { isAgent } from "@/access/agents";

/**
 * Payload treats a `draft: true` write whose data says `_status: "published"`
 * as a publish. Agents echo `_status` back from what they read, so their draft
 * saves are forced to stay drafts; publishing takes `draft: false`.
 *
 * Also marks every draft-only save in `req.context.draftSave`: the admin sends
 * `?draft=true`, but the Local API and MCP pass `draft` as an argument, which
 * the revalidation hooks can't see on `req.query`.
 */
export const draftSaveGuard: CollectionBeforeOperationHook = ({
  args,
  operation,
  req,
}) => {
  if (!((operation === "create" || operation === "update") && args.draft)) {
    return args;
  }

  const data = args.data as Record<string, unknown> | undefined;
  if (data && isAgent(req.user) && data._status === "published") {
    data._status = "draft";
  }

  if (data?._status !== "published") {
    req.context.draftSave = true;
  }

  return args;
};
