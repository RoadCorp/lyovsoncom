import type { CollectionConfig } from "payload";
import { authenticated } from "@/access/authenticated";
import { authenticatedOrPublished } from "@/access/authenticatedOrPublished";
import { populateContentTextHook } from "@/collections/hooks/populateContentText";
import { draftVersions, previewAdmin } from "@/collections/shared";
import { contentTextField, embeddingFields } from "@/fields/embedding";
import { richEditorConfig } from "@/fields/lexical-configs";
import { publishedAtField } from "@/fields/publishedAt";
import { seoField } from "@/fields/seo";
import { slugField } from "@/fields/slug";
import { markPostEmbeddingStaleHook } from "@/utilities/mark-embedding-stale";
import { populateAuthors } from "./hooks/populateAuthors";
import { revalidateDelete, revalidatePost } from "./hooks/revalidatePost";

export const Posts: CollectionConfig<"posts"> = {
  slug: "posts",
  // Fields returned when another document references this one.
  defaultPopulate: {
    title: true,
    slug: true,
    type: true,
    description: true,
    featuredImage: true,
    publishedAt: true,
    updatedAt: true,
  },
  access: {
    create: authenticated,
    delete: authenticated,
    read: authenticatedOrPublished,
    update: authenticated,
  },
  admin: {
    group: "Content",
    defaultColumns: ["title", "type", "slug", "updatedAt"],
    ...previewAdmin("posts"),
    useAsTitle: "title",
  },
  fields: [
    {
      name: "title",
      type: "text",
      required: true,
      admin: {
        description: "The main title of your post",
      },
    },
    {
      name: "featuredImage",
      type: "upload",
      relationTo: "media",
      admin: {
        position: "sidebar",
        description: "Main image used in cards and social sharing",
      },
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        position: "sidebar",
        description: "Brief description for previews and SEO",
        placeholder: "Write a compelling description...",
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
              editor: richEditorConfig,
              label: false,
              required: true,
            },
          ],
          label: "Content",
          description: "Write your post content here",
        },
        {
          fields: [
            {
              name: "type",
              type: "select",
              options: [
                { label: "Article", value: "article" },
                { label: "Review", value: "review" },
                { label: "Video", value: "video" },
                { label: "Podcast Episode", value: "podcast" },
                { label: "Photo Essay", value: "photo" },
              ],
              defaultValue: "article",
              required: true,
              admin: {
                description: "What type of content is this?",
              },
            },
            {
              name: "rating",
              type: "number",
              min: 1,
              max: 10,
              admin: {
                description: "Rate from 1-10 stars",
                condition: (data) => data.type === "review",
              },
            },
            {
              name: "reference",
              type: "relationship",
              relationTo: "references",
              hasMany: true,
              admin: {
                description: "What are you reviewing? (can select multiple)",
                condition: (data) => data.type === "review",
              },
            },
            {
              name: "videoEmbedUrl",
              type: "text",
              admin: {
                description: "YouTube, Vimeo, or other video embed URL",
                condition: (data) => data.type === "video",
                placeholder: "https://www.youtube.com/watch?v=...",
              },
            },
            {
              name: "podcastEmbedUrl",
              type: "text",
              admin: {
                description:
                  "Spotify, Apple Podcasts, or other podcast embed URL",
                condition: (data) => data.type === "podcast",
                placeholder: "https://open.spotify.com/episode/...",
              },
            },
          ],
          label: "Type & Reviews",
          description: "Set the content type and review details",
        },
        {
          fields: [
            {
              name: "topics",
              type: "relationship",
              relationTo: "topics",
              hasMany: true,
              admin: {
                description: "Tag this post with relevant topics",
              },
            },
            {
              name: "project",
              type: "relationship",
              relationTo: "projects",
              admin: {
                description:
                  "Group this post into a series or project (optional)",
              },
            },
            {
              name: "references",
              type: "relationship",
              relationTo: "references",
              hasMany: true,
              admin: {
                description:
                  "People, companies, works, and web media referenced in this post",
              },
            },
            {
              name: "notesReferenced",
              type: "relationship",
              relationTo: "notes",
              hasMany: true,
              admin: {
                description: "Notes that connect to this post",
              },
            },
          ],
          label: "Connections",
          description:
            "Connect this post to other content in your knowledge base",
        },
      ],
    },
    publishedAtField({
      description: "When this post should be published",
      position: "sidebar",
    }),
    {
      name: "authors",
      type: "relationship",
      admin: {
        position: "sidebar",
        description: "Who authored this post",
      },
      hasMany: true,
      relationTo: "lyovsons",
    },
    // This field is only used to populate the user data via the `populateAuthors` hook
    // This is because the `user` collection has access control locked to protect user privacy
    // GraphQL will also not return mutated user data that differs from the underlying schema
    {
      name: "populatedAuthors",
      type: "array",
      access: {
        update: () => false,
      },
      admin: {
        disabled: true,
        readOnly: true,
      },
      fields: [
        {
          name: "id",
          type: "text",
        },
        {
          name: "name",
          type: "text",
        },
        {
          name: "username",
          type: "text",
        },
      ],
    },
    // Pre-computed recommendations (stored as JSON array of post IDs)
    {
      name: "recommended_post_ids",
      type: "json",
      access: {
        update: () => false, // Only updated via hooks
      },
      admin: {
        hidden: true,
        description:
          "Pre-computed recommended post IDs based on semantic similarity",
      },
    },
    contentTextField(),
    ...embeddingFields(),
    ...slugField(),
  ],
  hooks: {
    beforeChange: [populateContentTextHook, markPostEmbeddingStaleHook],
    afterChange: [revalidatePost],
    afterRead: [populateAuthors],
    afterDelete: [revalidateDelete],
  },
  versions: draftVersions(),
};

// NOTE: Migrated from categories/tags to types/topics/projects structure
