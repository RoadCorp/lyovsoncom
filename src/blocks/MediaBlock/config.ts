import type { Block } from "payload";

export const MediaBlock: Block = {
  slug: "mediaBlock",
  labels: { singular: "Media", plural: "Media" },
  admin: {
    components: {
      Block: "@/blocks/MediaBlock/admin-preview#MediaBlockPreview",
    },
  },
  interfaceName: "MediaBlock",
  fields: [
    {
      name: "media",
      type: "upload",
      relationTo: "media",
      required: true,
    },
  ],
};
