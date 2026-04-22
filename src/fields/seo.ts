import type { Field } from "payload";

export const seoField: Field = {
  name: "seo",
  type: "group",
  admin: {
    position: "sidebar",
    description:
      "Optional explicit overrides for search and social metadata. Leave blank to use content defaults.",
  },
  fields: [
    {
      name: "title",
      type: "text",
      admin: {
        description:
          "Optional raw page title. Do not include site branding here.",
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description:
          "Optional search and social description override for this page.",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Optional social sharing image override. Falls back to the content image or the default OG image.",
      },
    },
  ],
};
