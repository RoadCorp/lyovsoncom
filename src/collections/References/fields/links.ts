import type { Field } from "payload";

export const linksField: Field = {
  name: "links",
  type: "array",
  admin: {
    description: "Additional links (purchase, streaming, etc.)",
  },
  fields: [
    {
      name: "label",
      type: "text",
      required: true,
    },
    {
      name: "url",
      type: "text",
      required: true,
    },
    {
      name: "kind",
      type: "select",
      options: [
        { label: "Purchase", value: "purchase" },
        { label: "Streaming", value: "streaming" },
        { label: "Official", value: "official" },
        { label: "Social", value: "social" },
        { label: "Other", value: "other" },
      ],
    },
  ],
};
