import type { Field } from "payload";
import { showForTypes } from "./conditions";

const isMusic = showForTypes("music");

export const musicFields: Field[] = [
  {
    name: "album",
    type: "relationship",
    relationTo: "references",
    admin: {
      description: "Album this song belongs to",
      condition: isMusic,
    },
  },
  {
    name: "trackNumber",
    type: "number",
    admin: {
      description: "Track number",
      condition: isMusic,
    },
  },
  {
    name: "label",
    type: "text",
    admin: {
      description: "Record label",
      condition: isMusic,
    },
  },
  {
    name: "barcode",
    type: "text",
    admin: {
      description: "Barcode/UPC",
      condition: isMusic,
    },
  },
];
