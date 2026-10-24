import { defineTool, mcpPlugin } from "@payloadcms/plugin-mcp";

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
  "Trash a post, note, activity or project with updateDocument setting `deletedAt` to the current time; restore it with `trash: true` and `deletedAt: null`. deleteDocuments deletes permanently, in every collection: use it only when asked to delete for good.",
  "Default the author to the Lyovson you work for: `authors` on posts, `author` (their username) on notes, `participants` and review `lyovson` on activities.",
  "Rich text fields take Lexical JSON. Call getCollectionSchema before writing a collection for the first time.",
  "Find topics and references before creating them, so you link the existing one instead of a duplicate.",
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

/** `/api/mcp` for API-key agents: full access to content and media, none to accounts. */
export const mcp = mcpPlugin({
  collections: {
    activities: {
      description:
        "Things a Lyovson read, watched, listened to or played. Each activity links one reference (find it first), has an activityType and finishedAt date, and can hold participants' reviews with a note and rating.",
    },
    agents: { tools: noTools },
    lyovsons: { tools: noTools },
    notes: {
      description:
        "Short notes: thoughts and quotes. A quote can link its sourceReference and quotedPerson. `author` is a Lyovson's username; `visibility` is public or private.",
    },
    posts: {
      description:
        "Long-form articles with a title, description and Lexical content, authored by Lyovsons and tagged with topics and references.",
    },
    media: {
      description:
        "Images and files. Deleting one also deletes its stored file, which cannot be restored.",
    },
    projects: {
      description:
        "Portfolio projects and case studies, with drafts and a trash like posts.",
    },
    references: {
      description:
        "Books, films, shows, games, people and other works that posts, notes and activities link to.",
    },
    topics: {
      description: "Topics that tag posts and notes.",
    },
  },
  mcp: {
    serverOptions: { serverInfo: { name: "lyovson.com" } },
  },
  tools: { getContext },
});
