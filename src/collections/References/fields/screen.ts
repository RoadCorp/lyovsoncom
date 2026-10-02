import type { Field } from "payload";
import { showForTypes } from "./conditions";

/** Movie and TV fields; season and episode numbers also apply to podcasts. */
export const screenFields: Field[] = [
  {
    name: "runtime",
    type: "number",
    admin: {
      description: "Runtime in minutes",
      condition: showForTypes("movie"),
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
      condition: showForTypes("movie"),
    },
  },
  {
    name: "networkOrService",
    type: "text",
    admin: {
      description: "Network or streaming service",
      condition: showForTypes("tvShow", "movie"),
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
      condition: showForTypes("tvShow"),
    },
  },
  {
    name: "seasonNumber",
    type: "number",
    admin: {
      description: "Season number",
      condition: showForTypes("tvShow", "podcast"),
    },
  },
  {
    name: "episodeNumber",
    type: "number",
    admin: {
      description: "Episode number",
      condition: showForTypes("tvShow", "podcast"),
    },
  },
];
