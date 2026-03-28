import type { CollectionConfig } from "payload";

import { anyone } from "@/access/anyone";
import { authenticated } from "@/access/authenticated";
import { slugField } from "@/fields/slug";

export const References: CollectionConfig = {
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
    {
      name: "type",
      type: "select",
      required: true,
      options: [
        { label: "Book", value: "book" },
        { label: "Movie", value: "movie" },
        { label: "TV Show", value: "tvShow" },
        { label: "Video Game", value: "videoGame" },
        { label: "Music", value: "music" },
        { label: "Podcast", value: "podcast" },
        { label: "Series", value: "series" },
        { label: "Person", value: "person" },
        { label: "Company", value: "company" },
        { label: "Website", value: "website" },
        { label: "Article", value: "article" },
        { label: "Video", value: "video" },
        { label: "Repository", value: "repository" },
        { label: "Tool", value: "tool" },
        { label: "Social", value: "social" },
        { label: "Course", value: "course" },
        { label: "Match", value: "match" },
        { label: "Other", value: "other" },
      ],
      admin: {
        position: "sidebar",
        description: "What type of reference is this?",
      },
    },
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
            // Book-specific fields
            {
              name: "isbn",
              type: "text",
              admin: {
                description: "ISBN number",
                condition: (data) =>
                  data?.type === "book" || data?.type === "series",
              },
            },
            {
              name: "publisher",
              type: "text",
              admin: {
                description: "Publisher name",
                condition: (data) =>
                  data?.type === "book" ||
                  data?.type === "series" ||
                  data?.type === "videoGame",
              },
            },
            {
              name: "pageCount",
              type: "number",
              admin: {
                description: "Number of pages",
                condition: (data) =>
                  data?.type === "book" || data?.type === "series",
              },
            },
            {
              name: "language",
              type: "text",
              admin: {
                description: "Language",
                condition: (data) =>
                  data?.type === "book" ||
                  data?.type === "movie" ||
                  data?.type === "tvShow",
              },
            },
            {
              name: "format",
              type: "select",
              options: [
                { label: "Hardcover", value: "hardcover" },
                { label: "Paperback", value: "paperback" },
                { label: "Ebook", value: "ebook" },
                { label: "Audiobook", value: "audiobook" },
              ],
              admin: {
                description: "Book format",
                condition: (data) =>
                  data?.type === "book" || data?.type === "series",
              },
            },
            {
              name: "series",
              type: "relationship",
              relationTo: "references",
              filterOptions: {
                type: {
                  equals: "series",
                },
              },
              admin: {
                description: "Series this item belongs to",
                condition: (data) =>
                  data?.type === "book" ||
                  data?.type === "movie" ||
                  data?.type === "tvShow" ||
                  data?.type === "videoGame" ||
                  data?.type === "music",
              },
            },
            // Movie/TV-specific fields
            {
              name: "runtime",
              type: "number",
              admin: {
                description: "Runtime in minutes",
                condition: (data) => data?.type === "movie",
              },
            },
            {
              name: "mpaaRating",
              type: "select",
              options: [
                { label: "G", value: "g" },
                { label: "PG", value: "pg" },
                { label: "PG-13", value: "pg13" },
                { label: "R", value: "r" },
                { label: "NC-17", value: "nc17" },
                { label: "NR", value: "nr" },
              ],
              admin: {
                description: "MPAA rating",
                condition: (data) => data?.type === "movie",
              },
            },
            {
              name: "networkOrService",
              type: "text",
              admin: {
                description: "Network or streaming service",
                condition: (data) =>
                  data?.type === "tvShow" || data?.type === "movie",
              },
            },
            {
              name: "status",
              type: "select",
              options: [
                { label: "Ongoing", value: "ongoing" },
                { label: "Ended", value: "ended" },
                { label: "Cancelled", value: "cancelled" },
              ],
              admin: {
                description: "Show status",
                condition: (data) => data?.type === "tvShow",
              },
            },
            {
              name: "seasonNumber",
              type: "number",
              admin: {
                description: "Season number",
                condition: (data) =>
                  data?.type === "tvShow" || data?.type === "podcast",
              },
            },
            {
              name: "episodeNumber",
              type: "number",
              admin: {
                description: "Episode number",
                condition: (data) =>
                  data?.type === "tvShow" || data?.type === "podcast",
              },
            },
            // Game-specific fields
            {
              name: "platforms",
              type: "select",
              hasMany: true,
              options: [
                { label: "PC", value: "pc" },
                { label: "PlayStation", value: "playstation" },
                { label: "Xbox", value: "xbox" },
                { label: "Nintendo Switch", value: "switch" },
                { label: "Mobile", value: "mobile" },
                { label: "VR", value: "vr" },
              ],
              admin: {
                description: "Gaming platforms",
                condition: (data) => data?.type === "videoGame",
              },
            },
            {
              name: "esrbRating",
              type: "select",
              options: [
                { label: "E - Everyone", value: "e" },
                { label: "E10+ - Everyone 10+", value: "e10" },
                { label: "T - Teen", value: "t" },
                { label: "M - Mature", value: "m" },
                { label: "AO - Adults Only", value: "ao" },
              ],
              admin: {
                description: "ESRB rating",
                condition: (data) => data?.type === "videoGame",
              },
            },
            {
              name: "metacriticScore",
              type: "number",
              min: 0,
              max: 100,
              admin: {
                description: "Metacritic score",
                condition: (data) => data?.type === "videoGame",
              },
            },
            {
              name: "developer",
              type: "text",
              admin: {
                description: "Game developer",
                condition: (data) => data?.type === "videoGame",
              },
            },
            // Music-specific fields
            {
              name: "album",
              type: "relationship",
              relationTo: "references",
              admin: {
                description: "Album this song belongs to",
                condition: (data) => data?.type === "music",
              },
            },
            {
              name: "trackNumber",
              type: "number",
              admin: {
                description: "Track number",
                condition: (data) => data?.type === "music",
              },
            },
            {
              name: "label",
              type: "text",
              admin: {
                description: "Record label",
                condition: (data) => data?.type === "music",
              },
            },
            {
              name: "barcode",
              type: "text",
              admin: {
                description: "Barcode/UPC",
                condition: (data) => data?.type === "music",
              },
            },
            // Podcast-specific fields
            {
              name: "show",
              type: "relationship",
              relationTo: "references",
              admin: {
                description: "Podcast show this episode belongs to",
                condition: (data) => data?.type === "podcast",
              },
            },
            // Person-specific fields
            {
              name: "roles",
              type: "select",
              hasMany: true,
              options: [
                { label: "Author", value: "author" },
                { label: "Director", value: "director" },
                { label: "Actor", value: "actor" },
                { label: "Musician", value: "musician" },
                { label: "Developer", value: "developer" },
                { label: "Host", value: "host" },
                { label: "Public Figure", value: "publicFigure" },
              ],
              admin: {
                description: "What roles does this person have?",
                condition: (data) => data?.type === "person",
              },
            },
            {
              name: "birthDate",
              type: "date",
              admin: {
                description: "Birth date",
                condition: (data) => data?.type === "person",
                date: {
                  pickerAppearance: "dayOnly",
                },
              },
            },
            {
              name: "deathDate",
              type: "date",
              admin: {
                description: "Death date",
                condition: (data) => data?.type === "person",
                date: {
                  pickerAppearance: "dayOnly",
                },
              },
            },
            {
              name: "nationality",
              type: "text",
              admin: {
                description: "Nationality",
                condition: (data) => data?.type === "person",
              },
            },
            {
              name: "website",
              type: "text",
              admin: {
                description: "Personal or professional website",
                placeholder: "https://example.com",
                condition: (data) =>
                  data?.type === "person" || data?.type === "company",
              },
            },
            {
              name: "socialLinks",
              type: "json",
              admin: {
                description: "Social media links and profiles",
                condition: (data) => data?.type === "person",
              },
            },
            // Company-specific fields
            {
              name: "industry",
              type: "text",
              admin: {
                description: "Industry",
                condition: (data) => data?.type === "company",
              },
            },
            {
              name: "foundedDate",
              type: "date",
              admin: {
                description: "Founded date",
                condition: (data) => data?.type === "company",
                date: {
                  pickerAppearance: "dayOnly",
                },
              },
            },
            // Web/media-specific fields
            {
              name: "url",
              type: "text",
              required: true,
              admin: {
                description: "URL for this web/media reference",
                condition: (data) =>
                  data?.type === "website" ||
                  data?.type === "article" ||
                  data?.type === "video" ||
                  data?.type === "repository" ||
                  data?.type === "tool" ||
                  data?.type === "social",
              },
            },
            {
              name: "siteName",
              type: "text",
              admin: {
                description: "Site or platform name",
                condition: (data) =>
                  data?.type === "website" ||
                  data?.type === "article" ||
                  data?.type === "video" ||
                  data?.type === "repository" ||
                  data?.type === "tool" ||
                  data?.type === "social",
              },
            },
            {
              name: "author",
              type: "text",
              admin: {
                description: "Article author",
                condition: (data) => data?.type === "article",
              },
            },
            {
              name: "publishedAt",
              type: "date",
              admin: {
                description: "Publication date",
                condition: (data) => data?.type === "article",
                date: {
                  pickerAppearance: "dayAndTime",
                },
              },
            },
            {
              name: "platform",
              type: "text",
              admin: {
                description: "Video platform (YouTube, Vimeo, etc.)",
                condition: (data) => data?.type === "video",
              },
            },
            {
              name: "videoId",
              type: "text",
              admin: {
                description: "Video ID",
                condition: (data) => data?.type === "video",
              },
            },
            // Course-specific fields
            {
              name: "instructor",
              type: "text",
              admin: {
                description: "Instructor or creator name",
                condition: (data) => data?.type === "course",
              },
            },
            {
              name: "coursePlatform",
              type: "select",
              options: [
                { label: "Udemy", value: "udemy" },
                { label: "Coursera", value: "coursera" },
                { label: "Frontend Masters", value: "frontendMasters" },
                { label: "MasterClass", value: "masterclass" },
                { label: "Pluralsight", value: "pluralsight" },
                { label: "edX", value: "edx" },
                { label: "Skillshare", value: "skillshare" },
                { label: "LinkedIn Learning", value: "linkedinLearning" },
                { label: "Egghead", value: "egghead" },
                { label: "YouTube", value: "youtube" },
                { label: "Other", value: "other" },
              ],
              admin: {
                description: "Platform offering the course",
                condition: (data) => data?.type === "course",
              },
            },
            {
              name: "courseDuration",
              type: "text",
              admin: {
                description: "Total duration (e.g. '12h 30m', '8 weeks')",
                condition: (data) => data?.type === "course",
              },
            },
            {
              name: "courseLevel",
              type: "select",
              options: [
                { label: "Beginner", value: "beginner" },
                { label: "Intermediate", value: "intermediate" },
                { label: "Advanced", value: "advanced" },
              ],
              admin: {
                description: "Difficulty level",
                condition: (data) => data?.type === "course",
              },
            },
            {
              name: "courseUrl",
              type: "text",
              admin: {
                description: "URL to the course",
                condition: (data) => data?.type === "course",
              },
            },
          ],
        },
        {
          label: "Web/Links",
          fields: [
            {
              name: "links",
              type: "array",
              admin: {
                description: "Additional links (purchase, streaming, etc.)",
              },
              fields: [
                {
                  name: "label",
                  type: "text",
                  required: true,
                },
                {
                  name: "url",
                  type: "text",
                  required: true,
                },
                {
                  name: "kind",
                  type: "select",
                  options: [
                    { label: "Purchase", value: "purchase" },
                    { label: "Streaming", value: "streaming" },
                    { label: "Official", value: "official" },
                    { label: "Social", value: "social" },
                    { label: "Other", value: "other" },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: "IDs",
          fields: [
            {
              name: "externalIds",
              type: "group",
              admin: {
                description: "External service IDs",
              },
              fields: [
                {
                  name: "imdbId",
                  type: "text",
                  admin: {
                    description: "IMDB ID",
                  },
                },
                {
                  name: "tvdbId",
                  type: "text",
                  admin: {
                    description: "TVDB ID",
                  },
                },
                {
                  name: "spotifyId",
                  type: "text",
                  admin: {
                    description: "Spotify ID",
                  },
                },
                {
                  name: "appleMusicId",
                  type: "text",
                  admin: {
                    description: "Apple Music ID",
                  },
                },
                {
                  name: "spotifyUrl",
                  type: "text",
                  admin: {
                    description: "Spotify URL",
                  },
                },
                {
                  name: "applePodcastsUrl",
                  type: "text",
                  admin: {
                    description: "Apple Podcasts URL",
                  },
                },
                {
                  name: "websiteUrl",
                  type: "text",
                  admin: {
                    description: "Website URL",
                  },
                },
                {
                  name: "steamId",
                  type: "text",
                  admin: {
                    description: "Steam ID",
                  },
                },
                {
                  name: "igdbId",
                  type: "text",
                  admin: {
                    description: "IGDB ID",
                  },
                },
                {
                  name: "googleBooksId",
                  type: "text",
                  admin: {
                    description: "Google Books ID",
                  },
                },
              ],
            },
          ],
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
      ({ doc, req }) => {
        req.payload.logger.info(`Revalidating reference: ${doc.slug}`);
        // TODO: Add revalidation logic for references when we have reference pages
      },
    ],
  },
  versions: {
    drafts: {
      autosave: {
        interval: 30_000,
      },
    },
    maxPerDoc: 5,
  },
};
