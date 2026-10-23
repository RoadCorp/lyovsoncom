import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import type { Block } from "payload";

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
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ];
        },
      }),
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
