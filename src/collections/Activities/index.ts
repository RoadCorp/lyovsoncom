import type { CollectionConfig } from "payload";
import { authenticated } from "@/access/authenticated";
import { authenticatedOrPublishedPublic } from "@/access/authenticatedOrPublishedPublic";
import { revalidateContentHooks } from "@/collections/hooks/revalidateContent";
import { draftVersions } from "@/collections/shared";
import { contentTextField, embeddingFields } from "@/fields/embedding";
import { richEditorConfig } from "@/fields/lexical-configs";
import { publishedAtField } from "@/fields/publishedAt";
import { seoField } from "@/fields/seo";
import { slugField } from "@/fields/slug";
import { formatSlug } from "@/fields/slug/formatSlug";
import { markActivityEmbeddingStaleHook } from "@/utilities/mark-embedding-stale";
import { getRelationId } from "@/utilities/relations";
import { populateContentTextHook } from "./hooks/populateContentText";

const revalidateActivity = revalidateContentHooks("activities");

export const Activities: CollectionConfig<"activities"> = {
  slug: "activities",
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublishedPublic,
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
        beforeValidate: [
          // biome-ignore lint/complexity/noExcessiveCognitiveComplexity: slugSource composition depends on related reference title
          async ({ data, operation, originalDoc, req }) => {
            const originalSlugSource =
              originalDoc &&
              typeof originalDoc === "object" &&
              "slugSource" in originalDoc &&
              typeof originalDoc.slugSource === "string"
                ? originalDoc.slugSource
                : "";

            if (operation !== "create" && operation !== "update") {
              return data?.slugSource || originalSlugSource;
            }

            // Use incoming reference first; fall back to original document on partial updates.
            const referenceValue =
              data?.reference ??
              (originalDoc &&
              typeof originalDoc === "object" &&
              "reference" in originalDoc
                ? originalDoc.reference
                : null);
            const referenceId = getRelationId(referenceValue);

            if (referenceId !== null) {
              try {
                const reference = (await req.payload.findByID({
                  collection: "references",
                  id: referenceId,
                })) as unknown as { title?: string };

                if (reference?.title) {
                  if (data) {
                    data.slug = formatSlug(reference.title);
                  }
                  return reference.title;
                }
              } catch (error) {
                req.payload.logger.error(
                  `Failed to fetch reference ${referenceId} for activity slug: ${error instanceof Error ? error.message : String(error)}`
                );
              }
            }

            const fallbackSlugSource = data?.slugSource || originalSlugSource;
            if (fallbackSlugSource && data) {
              data.slug = formatSlug(fallbackSlugSource);
            }
            return fallbackSlugSource;
          },
        ],
      },
    },
    ...slugField("slugSource", {
      slugOverrides: {
        admin: {
          hidden: true,
        },
      },
    }),
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
