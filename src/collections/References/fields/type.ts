import type { Field } from "payload";

const options = [
  { label: "Book", value: "book" },
  { label: "Movie", value: "movie" },
  { label: "TV Show", value: "tvShow" },
  { label: "Video Game", value: "videoGame" },
  { label: "Music", value: "music" },
  { label: "Podcast", value: "podcast" },
  { label: "Series", value: "series" },
  { label: "Person", value: "person" },
  { label: "Organization", value: "organization" },
  { label: "Course", value: "course" },
  { label: "Software", value: "software" },
  { label: "Other", value: "other" },
] as const;

export const REFERENCE_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  options.map(({ label, value }) => [value, label])
);

/** The type picks the catalog the reference is searched in. */
export const referenceTypeField: Field = {
  name: "type",
  type: "select",
  required: true,
  options: [...options],
  admin: {
    description:
      "Books search Open Library, films and shows TMDB, games IGDB, music MusicBrainz, podcasts Apple Podcasts; the rest Wikidata",
  },
};
