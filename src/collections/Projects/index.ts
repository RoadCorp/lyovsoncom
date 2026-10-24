import type { CollectionConfig } from "payload";
import { lyovsonOrAgent } from "@/access/agents";
import { authenticatedOrPublished } from "@/access/authenticated-or-published";
import { draftSaveGuard } from "@/collections/hooks/draft-save-guard";
import { draftVersions } from "@/collections/shared";
import { richEditorConfig } from "@/fields/lexical-configs";
import { publishedAtField } from "@/fields/published-at";
import { seoField } from "@/fields/seo";
import { slugField } from "@/fields/slug";
import { LIVE_METRICS } from "@/utilities/live-metric-options";
import { revalidateDeletedProject, revalidateProject } from "./hooks";

const MAX_HIGHLIGHTS = 4;
const HTTP_URL = /^https?:\/\/\S+$/;

const validateUrl = (value: unknown) => {
  if (typeof value !== "string" || value.length === 0) {
    return true;
  }
  return HTTP_URL.test(value) || "Enter a full http(s) URL";
};

// A writing series is a column of posts: no code, screenshots or tech stack.
const notSeries = (data: Partial<{ kind: string | null }>) =>
  data.kind !== "series";

const monthPicker = {
  date: {
    pickerAppearance: "monthOnly",
    displayFormat: "MMMM yyyy",
  },
} as const;

export const Projects: CollectionConfig = {
  slug: "projects",
  // Fields returned when another document references this one. Every post
  // summary populates its project, so keep this to what post cards render.
  defaultPopulate: {
    _status: true,
    name: true,
    slug: true,
    image: true,
    description: true,
    updatedAt: true,
  },
  access: {
    create: lyovsonOrAgent,
    delete: lyovsonOrAgent,
    read: authenticatedOrPublished,
    // Payload 4 lets versions inherit `read`; keep drafts and history private.
    readVersions: lyovsonOrAgent,
    update: lyovsonOrAgent,
  },
  admin: {
    group: "Organization",
    useAsTitle: "name",
    defaultColumns: ["name", "kind", "people", "_status"],
  },
  fields: [
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "kind",
      type: "select",
      required: true,
      defaultValue: "website",
      options: [
        { label: "Website or app", value: "website" },
        { label: "Writing series", value: "series" },
        { label: "Other", value: "other" },
      ],
      admin: {
        position: "sidebar",
        description: "Sets the fields shown here and the structured data",
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description:
          "One-line summary shown on cards, under the title and in search results",
      },
    },
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      admin: {
        description:
          "Cover image. For portfolio work, use the light-theme desktop screenshot",
      },
    },
    {
      type: "tabs",
      tabs: [
        {
          label: "Portfolio",
          description: "Credit people to show this project on their portfolio",
          fields: [
            {
              name: "people",
              type: "relationship",
              relationTo: "lyovsons",
              hasMany: true,
              admin: {
                description: "Shown on each person's portfolio",
              },
            },
            {
              type: "row",
              fields: [
                {
                  name: "url",
                  type: "text",
                  label: "Live URL",
                  validate: validateUrl,
                  admin: { placeholder: "https://example.com" },
                },
                {
                  name: "repository",
                  type: "text",
                  label: "Repository URL",
                  validate: validateUrl,
                  admin: {
                    condition: notSeries,
                    description: "Optional, public repositories only",
                  },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "client",
                  type: "text",
                  admin: { description: "Who the work was for" },
                },
                {
                  name: "role",
                  type: "text",
                  admin: {
                    description: "What was done, e.g. Design & engineering",
                  },
                },
              ],
            },
            {
              type: "row",
              fields: [
                {
                  name: "startedAt",
                  type: "date",
                  admin: monthPicker,
                  validate: (value, { siblingData }) => {
                    const people = (siblingData as { people?: unknown[] })
                      .people;
                    return value || !people?.length
                      ? true
                      : "Portfolio projects need a start month";
                  },
                },
                {
                  name: "endedAt",
                  type: "date",
                  admin: {
                    ...monthPicker,
                    description: "Leave empty while the work is ongoing",
                  },
                },
              ],
            },
            {
              name: "stack",
              type: "text",
              hasMany: true,
              admin: {
                condition: notSeries,
                description: "Technologies, e.g. Next.js, Payload, Postgres",
              },
            },
            {
              name: "highlights",
              type: "array",
              maxRows: MAX_HIGHLIGHTS,
              admin: {
                description:
                  "Up to four measured numbers, e.g. 3 languages. Never estimates. Numbers that grow can read a live source; the typed value shows if it can't be read.",
              },
              fields: [
                {
                  type: "row",
                  fields: [
                    { name: "value", type: "text", required: true },
                    { name: "label", type: "text", required: true },
                    {
                      name: "live",
                      type: "select",
                      label: "Live source",
                      options: Object.entries(LIVE_METRICS).map(
                        ([value, label]) => ({ label, value })
                      ),
                      admin: {
                        description:
                          "Optional: read the current number, refreshed daily",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "Case study",
          description:
            "Each section renders under its own heading on the project page",
          fields: [
            {
              name: "caseStudy",
              type: "array",
              labels: { singular: "Section", plural: "Sections" },
              fields: [
                { name: "heading", type: "text", required: true },
                {
                  name: "content",
                  type: "richText",
                  editor: richEditorConfig,
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: "Gallery",
          admin: { condition: notSeries },
          fields: [
            {
              name: "gallery",
              type: "array",
              labels: { singular: "Image", plural: "Images" },
              fields: [
                {
                  name: "image",
                  type: "upload",
                  relationTo: "media",
                  required: true,
                },
                {
                  name: "alt",
                  type: "text",
                  required: true,
                  admin: {
                    description:
                      "What the screenshot shows, for screen readers",
                  },
                },
                {
                  type: "row",
                  fields: [
                    { name: "caption", type: "text" },
                    {
                      name: "capturedAt",
                      type: "date",
                      admin: {
                        date: { pickerAppearance: "dayOnly" },
                        description: "When the screenshot was taken",
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    seoField,
    publishedAtField({
      description: "Set automatically on first publish",
      position: "sidebar",
    }),
    slugField("name"),
  ],
  hooks: {
    beforeOperation: [draftSaveGuard],
    afterChange: [revalidateProject],
    afterDelete: [revalidateDeletedProject],
  },
  // Deleting moves a document to the trash, where it can be restored.
  trash: true,
  versions: draftVersions(),
};
