import type { Field } from "payload";
import { showForTypes } from "./conditions";

const isWebMedia = showForTypes(
  "website",
  "article",
  "video",
  "repository",
  "tool",
  "social"
);
const isArticle = showForTypes("article");
const isVideo = showForTypes("video");

export const webFields: Field[] = [
  {
    name: "url",
    type: "text",
    required: true,
    admin: {
      description: "URL for this web/media reference",
      condition: isWebMedia,
    },
  },
  {
    name: "siteName",
    type: "text",
    admin: {
      description: "Site or platform name",
      condition: isWebMedia,
    },
  },
  {
    name: "author",
    type: "text",
    admin: {
      description: "Article author",
      condition: isArticle,
    },
  },
  {
    name: "publishedAt",
    type: "date",
    admin: {
      description: "Publication date",
      condition: isArticle,
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
      condition: isVideo,
    },
  },
  {
    name: "videoId",
    type: "text",
    admin: {
      description: "Video ID",
      condition: isVideo,
    },
  },
];
