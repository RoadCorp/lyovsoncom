import type { Block } from "payload";
import { captionEditor } from "@/fields/default-lexical";

export const Banner: Block = {
  slug: "banner",
  labels: { singular: "Banner", plural: "Banners" },
  fields: [
    {
      name: "style",
      type: "select",
      defaultValue: "info",
      options: [
        { label: "Info", value: "info" },
        { label: "Warning", value: "warning" },
        { label: "Error", value: "error" },
        { label: "Success", value: "success" },
      ],
      required: true,
    },
    {
      name: "content",
      type: "richText",
      editor: captionEditor,
      label: false,
      required: true,
    },
  ],
  interfaceName: "BannerBlock",
};
