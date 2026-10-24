import type { CollectionConfig } from "payload";
import { lyovsonOrAgent } from "@/access/agents";
import { anyone } from "@/access/anyone";
import { slugField } from "@/fields/slug";
import type { Reference } from "@/payload-types";
import {
  hasPublicChanges,
  revalidatePublicDependencies,
} from "@/utilities/revalidate-public-content";
import { relationFields } from "./fields/relations";
import { referenceTypeField } from "./fields/type";

const WIKIDATA_ID = /^Q\d+$/;

const linksToOthers = (doc: Reference) =>
  [doc.credits, doc.partOf, doc.basedOn, doc.members].some(
    (links) => (links?.length ?? 0) > 0
  );

/**
 * The works, people and organizations content points to. Most are filled
 * from a catalog search (see ./catalog); every field stays editable by hand
 * for things no catalog has.
 */
export const References: CollectionConfig = {
  slug: "references",
  access: {
    create: lyovsonOrAgent,
    delete: lyovsonOrAgent,
    read: anyone,
    // Payload 4 lets versions inherit `read`; keep history private.
    readVersions: lyovsonOrAgent,
    update: lyovsonOrAgent,
  },
  defaultPopulate: {
    title: true,
    slug: true,
    image: true,
    description: true,
    type: true,
    creator: true,
    year: true,
    url: true,
    wikidataId: true,
  },
  admin: {
    group: "Organization",
    useAsTitle: "title",
    defaultColumns: ["title", "type", "creator", "year", "updatedAt"],
    description: "Books, films, music, games, people and organizations",
  },
  fields: [
    referenceTypeField,
    {
      name: "catalogSearch",
      type: "ui",
      admin: {
        components: {
          Field: "@/collections/References/catalog/picker#CatalogPicker",
        },
      },
    },
    {
      name: "title",
      type: "text",
      required: true,
    },
    {
      type: "row",
      fields: [
        {
          name: "creator",
          type: "text",
          admin: {
            description: "Author, director, artist, studio or host",
          },
        },
        {
          name: "year",
          type: "number",
          min: 0,
          max: 9999,
          admin: { width: "30%" },
        },
      ],
    },
    {
      name: "description",
      type: "textarea",
      admin: {
        description: "One line; filled from Wikidata",
      },
    },
    {
      name: "url",
      type: "text",
      label: "Link",
      admin: {
        description: "Where the reference links: its catalog or official page",
      },
    },
    ...relationFields,
    {
      name: "image",
      type: "upload",
      relationTo: "media",
      admin: {
        position: "sidebar",
        description: "Cover, poster, photo or logo; copied from the catalog",
      },
    },
    {
      name: "wikidataId",
      type: "text",
      label: "Wikidata item",
      index: true,
      validate: (value: unknown) =>
        !value ||
        (typeof value === "string" && WIKIDATA_ID.test(value)) ||
        "A Wikidata item id, e.g. Q42",
      admin: {
        position: "sidebar",
        placeholder: "Q42",
      },
    },
    {
      type: "row",
      admin: { position: "sidebar" },
      fields: [
        {
          name: "catalogSource",
          type: "select",
          label: "Catalog",
          options: [
            { label: "Open Library", value: "openLibrary" },
            { label: "TMDB", value: "tmdb" },
            { label: "IGDB", value: "igdb" },
            { label: "MusicBrainz", value: "musicBrainz" },
            { label: "Apple Podcasts", value: "itunes" },
            { label: "Wikidata", value: "wikidata" },
          ],
        },
        {
          name: "catalogId",
          type: "text",
          label: "Catalog id",
        },
      ],
    },
    slugField(),
  ],
  hooks: {
    afterChange: [
      ({ context, doc, operation, previousDoc }) => {
        // A new reference isn't rendered until something links to it, which
        // it does itself when it credits, joins or adapts another one.
        if (
          context?.skipRevalidation ||
          (operation === "create" && !linksToOthers(doc)) ||
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
};
