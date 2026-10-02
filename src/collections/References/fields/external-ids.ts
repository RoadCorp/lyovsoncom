import type { Field } from "payload";

function externalIdField(name: string, description: string): Field {
  return {
    name,
    type: "text",
    admin: {
      description,
    },
  };
}

export const externalIdsField: Field = {
  name: "externalIds",
  type: "group",
  admin: {
    description: "External service IDs",
  },
  fields: [
    externalIdField("imdbId", "IMDB ID"),
    externalIdField("tvdbId", "TVDB ID"),
    externalIdField("spotifyId", "Spotify ID"),
    externalIdField("appleMusicId", "Apple Music ID"),
    externalIdField("spotifyUrl", "Spotify URL"),
    externalIdField("applePodcastsUrl", "Apple Podcasts URL"),
    externalIdField("websiteUrl", "Website URL"),
    externalIdField("steamId", "Steam ID"),
    externalIdField("igdbId", "IGDB ID"),
    externalIdField("googleBooksId", "Google Books ID"),
  ],
};
