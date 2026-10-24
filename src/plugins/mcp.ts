import { defineTool, mcpPlugin } from "@payloadcms/plugin-mcp";

import { actingLyovsonId, isAgent } from "@/access/agents";

// Collection access does the real enforcement; these maps only keep the
// advertised tools to what an agent needs.
const noHistory = {
  countVersions: false,
  findVersionByID: false,
  findVersions: false,
  restoreVersion: false,
} as const;
const draftTools = { ...noHistory, delete: false, duplicate: false } as const;
const readOnlyTools = { ...draftTools, create: false, update: false } as const;
const noTools = {
  ...readOnlyTools,
  count: false,
  find: false,
  findDistinct: false,
  getCollectionSchema: false,
  getUploadInstructions: false,
} as const;

const RULES = [
  "You create and edit drafts of posts, notes and activities. You cannot publish, delete or trash anything: a Lyovson reviews your drafts and publishes them in the admin.",
  "Pass `draft: true` to createDocuments and updateDocument, so required fields such as the slug can wait for review.",
  "You can edit a document only while it is a draft. Private and trashed documents are hidden from you.",
  "Default the author to the Lyovson you work for: `authors` on posts, `author` (their username) on notes, `participants` and review `lyovson` on activities.",
  "Rich text fields take Lexical JSON. Call getCollectionSchema before writing a collection for the first time.",
  "Link topics and references by id after finding them; you cannot create either.",
].join("\n");

const getContext = defineTool({
  access: ({ req }) => isAgent(req.user),
  annotations: { readOnlyHint: true, title: "Get context" },
  description:
    "Call this first. Returns who you work for, the Lyovsons' ids and usernames, and the rules for drafting on lyovson.com.",
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

/** `/api/mcp` for API-key agents: draft-only writing, read-only lookups. */
export const mcp = mcpPlugin({
  collections: {
    activities: {
      description:
        "Things a Lyovson read, watched, listened to or played. Each activity links one reference (find it first), has an activityType and finishedAt date, and can hold participants' reviews with a note and rating.",
      tools: draftTools,
    },
    agents: { tools: noTools },
    lyovsons: { tools: noTools },
    media: { tools: noTools },
    notes: {
      description:
        "Short notes: thoughts and quotes. A quote can link its sourceReference and quotedPerson. `author` is a Lyovson's username; `visibility` is public or private.",
      tools: draftTools,
    },
    posts: {
      description:
        "Long-form articles with a title, description and Lexical content, authored by Lyovsons and tagged with topics and references.",
      tools: draftTools,
    },
    projects: { tools: noTools },
    references: {
      description:
        "Books, films, shows, games, people and other works that posts, notes and activities link to. Read-only.",
      tools: readOnlyTools,
    },
    topics: {
      description: "Topics that tag posts and notes. Read-only.",
      tools: readOnlyTools,
    },
  },
  mcp: {
    serverOptions: { serverInfo: { name: "lyovson.com" } },
  },
  tools: { getContext },
});
