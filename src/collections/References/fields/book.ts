import type { Field } from "payload";
import { showForTypes } from "./conditions";

export const bookFields: Field[] = [
  {
    name: "isbn",
    type: "text",
    admin: {
      description: "ISBN number",
      condition: showForTypes("book", "series"),
    },
  },
  {
    name: "publisher",
    type: "text",
    admin: {
      description: "Publisher name",
      condition: showForTypes("book", "series", "videoGame"),
    },
  },
  {
    name: "pageCount",
    type: "number",
    admin: {
      description: "Number of pages",
      condition: showForTypes("book", "series"),
    },
  },
  {
    name: "language",
    type: "text",
    admin: {
      description: "Language",
      condition: showForTypes("book", "movie", "tvShow"),
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
      condition: showForTypes("book", "series"),
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
      condition: showForTypes("book", "movie", "tvShow", "videoGame", "music"),
    },
  },
];
