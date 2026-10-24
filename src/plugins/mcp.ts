import {
  defineCollectionTool,
  defineTool,
  mcpPlugin,
} from "@payloadcms/plugin-mcp";
import { strictObject, z } from "payload";

import { actingLyovsonId, isAgent } from "@/access/agents";

// Collection access does the real enforcement: agents get a Lyovson's access
// to content and media, and none to accounts.
const noTools = {
  count: false,
  countVersions: false,
  create: false,
  delete: false,
  duplicate: false,
  find: false,
  findDistinct: false,
  findVersionByID: false,
  findVersions: false,
  getCollectionSchema: false,
  getUploadInstructions: false,
  restoreVersion: false,
  update: false,
} as const;

const RULES = [
  "You have a Lyovson's access to posts, notes, activities, projects, references, topics and media: create, edit, publish, trash, restore and delete. You cannot see or change accounts, agents or API keys.",
  'Save drafts by default: pass `draft: true` to createDocuments and updateDocument. Publish only when the Lyovson you work for asks: pass `draft: false` with `_status: "published"`. With `draft: true` an edit to a published document waits as a draft; with `draft: false` it goes live.',
  "Trash a post, note, activity or project with updateDocument setting `deletedAt` to the current time; restore it with `trash: true` and `deletedAt: null`. deleteDocuments and deleteFromTrash delete permanently: use them only when asked to delete for good. deleteDocuments cannot see trashed documents; deleteFromTrash can.",
  "Default the author to the Lyovson you work for: `authors` on posts, `author` (their username) on notes, `participants` and review `lyovson` on activities.",
  "Rich text fields take Lexical JSON. Call getCollectionSchema before writing a collection for the first time.",
  "Find topics and references before creating them, so you link the existing one instead of a duplicate.",
  "Upload media with createDocuments and a `file` of source `base64`; a request is capped at about 4.5 MB, so keep files under about 3 MB. Deleting media also deletes its stored file for good.",
].join("\n");

const getContext = defineTool({
  access: ({ req }) => isAgent(req.user),
  annotations: { readOnlyHint: true, title: "Get context" },
  description:
    "Call this first. Returns who you work for, the Lyovsons' ids and usernames, and the rules for working on lyovson.com.",
}).handler(async ({ req }) => {
  const { docs } = await req.payload.find({
    collection: "lyovsons",
    depth: 0,
    limit: 10,
    overrideAccess: true,
    req,
    select: { name: true, username: true },
  });
  const context = {
    worksFor: actingLyovsonId(req.user),
    lyovsons: docs.map(({ id, name, username }) => ({ id, name, username })),
    rules: RULES,
  };

  return { content: [{ type: "text", text: JSON.stringify(context) }] };
});

// The built-in deleteDocuments passes no `trash` option, so Payload skips
// trashed documents and reports them as not found.
const deleteFromTrash = defineCollectionTool({
  access: ({ permissions, slug }) =>
    Boolean(permissions?.collections?.[slug]?.delete),
  annotations: { destructiveHint: true, title: "Delete from trash" },
  description:
    "Permanently delete a document by id, including one in the trash. This cannot be undone.",
  input: strictObject({ id: z.number() }),
}).handler(async ({ authorizedMCP, input, req, slug }) => {
  const { id } = input;
  try {
    await req.payload.delete({
      collection: slug,
      depth: 0,
      id,
      overrideAccess: authorizedMCP.overrideAccess,
      req,
      trash: true,
    });
    return {
      content: [{ type: "text", text: `Deleted ${slug} ${id} for good.` }],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return { content: [{ type: "text", text: message }], isError: true };
  }
});
const trashTools = { tools: { deleteFromTrash } };

/** `/api/mcp` for API-key agents: full access to content and media, none to accounts. */
export const mcp = mcpPlugin({
  collections: {
    activities: trashTools,
    agents: { tools: noTools },
    lyovsons: { tools: noTools },
    // Staged uploads land on one function instance and the bot guard
    // refuses scripted PUTs to /api, so agents upload inline instead.
    media: { tools: { getUploadInstructions: false } },
    notes: trashTools,
    posts: trashTools,
    projects: trashTools,
    references: {},
    topics: {},
  },
  mcp: {
    serverOptions: { serverInfo: { name: "lyovson.com" } },
  },
  tools: { getContext },
});
