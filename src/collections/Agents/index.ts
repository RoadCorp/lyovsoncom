import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/authenticated";

/**
 * API-key accounts for AI assistants. They sign in only with their key, never
 * reach the admin, and through `/api/mcp` create and edit drafts that a
 * Lyovson reviews and publishes.
 */
export const Agents: CollectionConfig = {
  slug: "agents",
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticated,
    update: authenticated,
  },
  admin: {
    group: "People",
    defaultColumns: ["name", "lyovson"],
    useAsTitle: "name",
    description:
      "AI assistants that draft posts, notes and activities through /api/mcp. Enable an API key to connect one; a Lyovson publishes what they draft.",
  },
  auth: {
    disableLocalStrategy: true,
    useAPIKey: true,
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "lyovson",
      type: "relationship",
      relationTo: "lyovsons",
      required: true,
      admin: {
        description:
          "Who this assistant works for. It is the default author and participant of what the assistant drafts.",
      },
    },
  ],
  // Version history would keep copies of API keys.
  versions: false,
};
