import type { CollectionConfig } from "payload";

import { authenticated } from "@/access/authenticated";

/**
 * API-key accounts for AI assistants. They sign in only with their key, never
 * reach the admin, and through `/api/mcp` have their Lyovson's access to content
 * and media, but none to accounts.
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
      "AI assistants with a Lyovson's access to content and media through /api/mcp, but none to accounts. Enable an API key to connect one.",
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
          "Who this assistant works for. It is the default author and participant of what the assistant writes.",
      },
    },
  ],
  // Version history would keep copies of API keys.
  versions: false,
};
