import type { Field } from "payload";

export const referenceTypeField: Field = {
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
};
