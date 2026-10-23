import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import type { Block } from "payload";

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
        description: "An MP4, WebM or animated GIF file.",
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
          "Width / height, e.g. 16:9. Leave empty to use the file's.",
      },
    },
    // Hotlinked GIPHY picks, and older Tenor blocks that
    // scripts/replace-tenor-gifs.ts could not match on GIPHY.
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
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ];
        },
      }),
      label: "Caption",
    },
  ],
};
