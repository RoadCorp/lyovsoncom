import type { CollectionConfig } from "payload";
import { lyovsonOrAgent } from "@/access/agents";
import { anyone } from "@/access/anyone";
import { captionEditor } from "@/fields/default-lexical";
import {
  hasPublicChanges,
  revalidatePublicDependencies,
} from "@/utilities/revalidate-public-content";

export const Media: CollectionConfig = {
  slug: "media",
  access: {
    create: lyovsonOrAgent,
    delete: lyovsonOrAgent,
    read: anyone,
    // Payload 4 lets versions inherit `read`; keep history private.
    readVersions: lyovsonOrAgent,
    update: lyovsonOrAgent,
  },
  admin: {
    group: "Media & Settings",
  },
  fields: [
    {
      name: "alt",
      type: "text",
      //required: true,
    },
    {
      name: "credit",
      type: "text",
      admin: {
        description:
          "Attribution the image's licence asks for. Shown with the image.",
      },
    },
    {
      name: "caption",
      type: "richText",
      editor: captionEditor,
    },
  ],
  hooks: {
    afterChange: [
      ({ context, doc, operation, previousDoc }) => {
        // A new upload isn't rendered until content links to it.
        if (
          context?.skipRevalidation ||
          operation === "create" ||
          !hasPublicChanges(doc, previousDoc)
        ) {
          return doc;
        }
        revalidatePublicDependencies();
        return doc;
      },
    ],
    afterDelete: [
      ({ doc, context }) => {
        if (!context?.skipRevalidation) {
          revalidatePublicDependencies();
        }
        return doc;
      },
    ],
  },
  upload: {
    // Files live in Vercel Blob (see payload.config.ts); only media the site
    // renders is accepted.
    adminThumbnail: "thumbnail",
    mimeTypes: ["image/*", "video/mp4", "video/webm"],
  },
};
