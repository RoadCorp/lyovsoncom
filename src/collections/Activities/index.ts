import type { CollectionConfig } from "payload";
import { authenticated } from "@/access/authenticated";
import { authenticatedOrPublishedPublic } from "@/access/authenticated-or-published-public";
import { revalidateContentHooks } from "@/collections/hooks/revalidate-content";
import { draftVersions } from "@/collections/shared";
import { contentTextField, embeddingFields } from "@/fields/embedding";
import { richEditorConfig } from "@/fields/lexical-configs";
import { publishedAtField } from "@/fields/published-at";
import { seoField } from "@/fields/seo";
import { markActivityEmbeddingStaleHook } from "@/utilities/mark-embedding-stale";
import { populateContentTextHook } from "./hooks/populate-content-text";
import { populateSlugSourceHook } from "./hooks/populate-slug-source";

const revalidateActivity = revalidateContentHooks("activities");

export const Activities: CollectionConfig = {
  slug: "activities",
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublishedPublic,
    // Payload 4 lets versions inherit `read`; keep drafts and history private.
    readVersions: authenticated,
    update: authenticated,
  },
  defaultPopulate: {
    slug: true,
    reference: true,
    activityType: true,
    startedAt: true,
    finishedAt: true,
  },
  admin: {
    group: "Content",
    defaultColumns: ["reference", "activityType", "startedAt", "updatedAt"],
    description:
      "Log reading, watching, listening, playing, visiting, and learning activities",
  },
  fields: [
    {
      name: "reference",
      type: "relationship",
      relationTo: "references",
      required: true,
      admin: {
        position: "sidebar",
        description: "What are you reading/watching/listening to/playing?",
      },
    },
    {
      name: "activityType",
      type: "select",
      options: [
        { label: "Read", value: "read" },
        { label: "Watch", value: "watch" },
        { label: "Listen", value: "listen" },
        { label: "Play", value: "play" },
        { label: "Visit", value: "visit" },
        { label: "Learn", value: "learn" },
      ],
      required: true,
      admin: {
        position: "sidebar",
        description: "Type of activity",
      },
    },
    {
      name: "participants",
      type: "relationship",
      relationTo: "lyovsons",
      hasMany: true,
      admin: {
        position: "sidebar",
        description: "Who participated in this activity?",
      },
    },
    {
      name: "startedAt",
      type: "date",
      admin: {
        position: "sidebar",
        description: "When did you start?",
        date: {
          pickerAppearance: "dayOnly",
        },
      },
    },
    {
      name: "finishedAt",
      type: "date",
      admin: {
        position: "sidebar",
        description: "When did you finish?",
        date: {
          pickerAppearance: "dayOnly",
        },
      },
    },
    {
      name: "visibility",
      type: "select",
      options: [
        { label: "Public", value: "public" },
        { label: "Private", value: "private" },
      ],
      defaultValue: "public",
      admin: {
        position: "sidebar",
        description: "Who can see this activity?",
      },
    },
    seoField,
    {
      type: "tabs",
      tabs: [
        {
          label: "Info",
          fields: [
            {
              name: "notes",
              type: "richText",
              editor: richEditorConfig,
              admin: {
                description: "General information about this activity",
              },
            },
          ],
        },
        {
          label: "Notes",
          fields: [
            {
              name: "reviews",
              type: "array",
              admin: {
                description:
                  "Notes from participants (each can include a note and/or rating)",
              },
              fields: [
                {
                  name: "lyovson",
                  type: "relationship",
                  relationTo: "lyovsons",
                  required: true,
                  admin: {
                    description: "Who wrote this note?",
                  },
                },
                {
                  name: "note",
                  type: "text",
                  admin: {
                    description:
                      "Optional personal note about this activity (plain text)",
                  },
                },
                {
                  name: "rating",
                  type: "number",
                  min: 1,
                  max: 10,
                  admin: {
                    description: "Optional rating out of 10",
                  },
                },
              ],
            },
          ],
        },
        {
          label: "Metadata",
          fields: [
            publishedAtField({
              description: "When this activity should be published",
            }),
          ],
        },
      ],
    },
    {
      name: "slugSource",
      type: "text",
      admin: {
        hidden: true,
      },
      hooks: {
        beforeValidate: [populateSlugSourceHook],
      },
    },
    // Set by populateSlugSourceHook from the referenced work. Not Payload's
    // unique slug field: the URL is scoped by date, so repeats are expected.
    {
      name: "slug",
      type: "text",
      index: true,
      admin: {
        hidden: true,
      },
    },
    ...embeddingFields(),
    contentTextField("activity content"),
  ],
  hooks: {
    beforeChange: [populateContentTextHook, markActivityEmbeddingStaleHook],
    afterChange: [revalidateActivity.afterChange],
    afterDelete: [revalidateActivity.afterDelete],
  },
  versions: draftVersions(),
};
