import type { Field } from "payload";
import { showForTypes } from "./conditions";

/** Season and episode numbers are shared with TV shows (see screen.ts). */
export const podcastFields: Field[] = [
  {
    name: "show",
    type: "relationship",
    relationTo: "references",
    admin: {
      description: "Podcast show this episode belongs to",
      condition: showForTypes("podcast"),
    },
  },
];
