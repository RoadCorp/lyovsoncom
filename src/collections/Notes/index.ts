import type { CollectionConfig } from "payload";
import { authenticated } from "@/access/authenticated";
import { authenticatedOrPublishedPublic } from "@/access/authenticatedOrPublishedPublic";
import { populateContentTextHook } from "@/collections/hooks/populateContentText";
import { revalidateContentHooks } from "@/collections/hooks/revalidateContent";
import { draftVersions, previewAdmin } from "@/collections/shared";
import { contentTextField, embeddingFields } from "@/fields/embedding";
import { noteEditorConfig } from "@/fields/lexical-configs";
import { publishedAtField } from "@/fields/publishedAt";
import { seoField } from "@/fields/seo";
import { slugField } from "@/fields/slug";
import { markNoteEmbeddingStaleHook } from "@/utilities/mark-embedding-stale";

const revalidateNote = revalidateContentHooks("notes");

export const Notes: CollectionConfig<"notes"> = {
  slug: "notes",
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublishedPublic,
    update: authenticated,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    author: true,
    visibility: true,
    type: true,
    topics: true,
    connections: true,
  },
  admin: {
    group: "Content",
    useAsTitle: "title",
    defaultColumns: ["title", "type", "author", "visibility", "updatedAt"],
    ...previewAdmin("notes"),
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "The main title of your note",
      },
    },
    {
      name: "type",
      type: "select",
      options: [
        { label: "Quote", value: "quote" },
        { label: "Thought", value: "thought" },
      ],
      defaultValue: "thought",
      required: true,
      admin: {
        position: "sidebar",
        description: "What type of note is this?",
      },
    },
    {
      name: "author",
      type: "select",
      options: [
        { label: "Rafa", value: "rafa" },
        { label: "Jess", value: "jess" },
      ],
      required: true,
      admin: {
        position: "sidebar",
        description: "Who wrote this note?",
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
      required: true,
      admin: {
        position: "sidebar",
        description: "Who can see this note?",
      },
    },
    seoField,
    {
      type: "tabs",
      tabs: [
        {
          fields: [
            {
              name: "content",
              type: "richText",
              editor: noteEditorConfig,
              label: false,
              required: true,
            },
          ],
          label: "Content",
          description: "Write your note content here",
        },
        {
          fields: [
            {
              name: "sourceReference",
              type: "relationship",
              relationTo: "references",
              admin: {
                description: "What reference is this quote from?",
                condition: (data) => data.type === "quote",
              },
            },
            {
              name: "quotedPerson",
              type: "text",
              admin: {
                description:
                  "Who said this quote? (e.g., author name, speaker)",
                condition: (data) => data.type === "quote",
                placeholder: "e.g., Jane Austen, Albert Einstein",
              },
            },
            {
              name: "pageNumber",
              type: "text",
              admin: {
                description: "Page number, timestamp, or location reference",
                condition: (data) => data.type === "quote",
                placeholder: "Page 42, 1:23:45, etc.",
              },
            },
          ],
          label: "Quote Details",
          description: "Additional information for quote-type notes",
        },
        {
          fields: [
            {
              name: "topics",
              type: "relationship",
              relationTo: "topics",
              hasMany: true,
              admin: {
                description: "What topics does this note cover?",
              },
            },
            {
              name: "connections",
              type: "relationship",
              relationTo: ["posts", "references", "notes"],
              hasMany: true,
              admin: {
                description:
                  "Connect this note to other content in your knowledge base",
              },
            },
          ],
          label: "Connections",
          description:
            "Link this note to related posts, books, people, and other notes",
        },
      ],
    },
    publishedAtField({
      description: "When this note should be published",
      position: "sidebar",
    }),
    ...embeddingFields(),
    // Pre-computed recommendations (stored as JSON array of note IDs)
    {
      name: "recommended_note_ids",
      type: "json",
      access: {
        update: () => false, // Only updated via hooks
      },
      admin: {
        hidden: true,
        description:
          "Pre-computed recommended note IDs based on semantic similarity",
      },
    },
    contentTextField(),
    ...slugField(),
  ],
  hooks: {
    beforeChange: [populateContentTextHook, markNoteEmbeddingStaleHook],
    afterChange: [revalidateNote.afterChange],
    afterDelete: [revalidateNote.afterDelete],
  },
  versions: draftVersions(),
};
