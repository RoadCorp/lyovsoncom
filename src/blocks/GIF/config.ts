import type { Block } from "payload";
import { captionEditor } from "@/fields/default-lexical";

export const GIF: Block = {
  slug: "gif",
  labels: { singular: "GIF", plural: "GIFs" },
  admin: {
    components: { Block: "@/blocks/GIF/admin-preview#GIFPreview" },
  },
  interfaceName: "GIFBlock",
  fields: [
    {
      name: "gifPicker",
      type: "ui",
      admin: {
        components: {
          Field: "@/blocks/GIF/gif-picker#GifPicker",
        },
      },
    },
    {
      name: "media",
      type: "upload",
      relationTo: "media",
      label: "Or upload a GIF or video",
      filterOptions: {
        or: [
          { mimeType: { equals: "image/gif" } },
          { mimeType: { like: "video/" } },
        ],
      },
      admin: {
        description:
          "An MP4 or WebM file is best; an animated GIF is often 10 times larger.",
      },
    },
    {
      name: "poster",
      type: "upload",
      relationTo: "media",
      label: "Poster (optional)",
      filterOptions: { mimeType: { like: "image/" } },
      admin: {
        description:
          "A still frame, shown before the video loads and with reduced motion.",
      },
    },
    {
      name: "aspectRatio",
      type: "text",
      admin: {
        description:
          "Width / height, e.g. 16:9. Filled in from GIPHY picks and uploaded videos; it reserves the space before the GIF loads.",
      },
    },
    {
      name: "alt",
      type: "text",
      label: "Alt text",
      admin: {
        description:
          "What the GIF shows, for screen readers. Filled in from GIPHY; uploads fall back to the file's alt text.",
      },
    },
    // Hotlinked GIPHY picks.
    {
      name: "mp4Url",
      type: "text",
      admin: {
        hidden: true,
      },
    },
    {
      name: "webmUrl",
      type: "text",
      admin: {
        hidden: true,
      },
    },
    {
      name: "posterUrl",
      type: "text",
      admin: {
        hidden: true,
      },
    },
    {
      name: "sourceUrl",
      type: "text",
      admin: {
        hidden: true,
      },
    },
    {
      name: "caption",
      type: "richText",
      editor: captionEditor,
      label: "Caption",
    },
  ],
};
