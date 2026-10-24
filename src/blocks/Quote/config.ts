import type { Block } from "payload";
import { captionEditor } from "@/fields/default-lexical";

export const Quote: Block = {
  slug: "quote",
  labels: { singular: "Quote", plural: "Quotes" },
  admin: {
    components: { Block: "@/blocks/Quote/admin-preview#QuotePreview" },
  },
  interfaceName: "QuoteBlock",
  fields: [
    {
      name: "quote",
      type: "richText",
      editor: captionEditor,
      required: true,
      label: "Quote Text",
    },
    {
      name: "attribution",
      type: "text",
      label: "Attribution",
    },
  ],
};
