import type { CollectionConfig } from "payload";
import { anyone } from "@/access/anyone";
import { authenticated } from "@/access/authenticated";
import { draftVersions } from "@/collections/shared";
import { slugField } from "@/fields/slug";
import {
  hasPublicChanges,
  isDraftOnlySave,
  revalidatePublicDependencies,
} from "@/utilities/revalidate-public-content";
import { bookFields } from "./fields/book";
import { companyFields } from "./fields/company";
import { courseFields } from "./fields/course";
import { externalIdsField } from "./fields/external-ids";
import { gameFields } from "./fields/game";
import { linksField } from "./fields/links";
import { musicFields } from "./fields/music";
import { personFields } from "./fields/person";
import { podcastFields } from "./fields/podcast";
import { screenFields } from "./fields/screen";
import { referenceTypeField } from "./fields/type";
import { webFields } from "./fields/web";

export const References: CollectionConfig<"references"> = {
  slug: "references",
  access: {
    create: authenticated,
    delete: authenticated,
    read: anyone,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    image: true,
    description: true,
    type: true,
  },
  admin: {
    group: "Organization",
    useAsTitle: "title",
    defaultColumns: ["title", "type", "updatedAt"],
    description:
      "Unified references for people, companies, works, and web media",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "The title or name of this reference",
      },
    },
    referenceTypeField,
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      required: true,
      admin: {
        position: "sidebar",
        description: "Image for this reference (cover, photo, logo, etc.)",
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Overview",
          fields: [
            {
              name: "description",
              type: "textarea",
              admin: {
                description: "Brief description or summary",
              },
            },
          ],
        },
        {
          label: "Details",
          fields: [
            ...bookFields,
            ...screenFields,
            ...gameFields,
            ...musicFields,
            ...podcastFields,
            ...personFields,
            ...companyFields,
            ...webFields,
            ...courseFields,
          ],
        },
        {
          label: "Web/Links",
          fields: [linksField],
        },
        {
          label: "IDs",
          fields: [externalIdsField],
        },
        {
          label: "Metadata",
          fields: [
            {
              name: "tags",
              type: "text",
              hasMany: true,
              admin: {
                description: "Tags for this reference",
              },
            },
          ],
        },
      ],
    },
    ...slugField(),
  ],
  hooks: {
    afterChange: [
      ({ context, doc, operation, previousDoc, req }) => {
        // A new reference isn't rendered until content links to it, and
        // draft saves (autosave every 30s) don't change the published one.
        if (
          context?.skipRevalidation ||
          operation === "create" ||
          isDraftOnlySave(req, doc) ||
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
  versions: draftVersions(),
};
