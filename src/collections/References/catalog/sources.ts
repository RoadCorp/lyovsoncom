import { type CatalogItem, fetchJson, MAX_RESULTS, yearOf } from "./shared";

// Each search returns at most MAX_RESULTS items in the shared shape. Keys stay
// on the server; sources without one are skipped by `searchCatalog`.

interface OpenLibraryDoc {
  author_name?: string[];
  cover_i?: number;
  first_publish_year?: number;
  key: string;
  title: string;
}

export async function searchOpenLibrary(query: string) {
  const params = new URLSearchParams({
    fields: "key,title,author_name,first_publish_year,cover_i",
    limit: String(MAX_RESULTS),
    q: query,
  });
  const { docs } = await fetchJson<{ docs: OpenLibraryDoc[] }>(
    `https://openlibrary.org/search.json?${params}`
  );

  return docs.map((doc): CatalogItem => {
    const cover = doc.cover_i
      ? `https://covers.openlibrary.org/b/id/${doc.cover_i}`
      : undefined;
    return {
      creator: doc.author_name?.slice(0, 2).join(", "),
      imageUrl: cover && `${cover}-L.jpg`,
      source: "openLibrary",
      sourceId: doc.key.replace("/works/", ""),
      thumbUrl: cover && `${cover}-M.jpg`,
      title: doc.title,
      url: `https://openlibrary.org${doc.key}`,
      year: doc.first_publish_year,
    };
  });
}

interface TmdbResult {
  first_air_date?: string;
  id: number;
  name?: string;
  poster_path?: string | null;
  release_date?: string;
  title?: string;
}

/** Films and shows. TMDB ids are per kind, so the id keeps it: `movie/603`. */
export async function searchTmdb(query: string, kind: "movie" | "tv") {
  const params = new URLSearchParams({ query });
  const { results } = await fetchJson<{ results: TmdbResult[] }>(
    `https://api.themoviedb.org/3/search/${kind}?${params}`,
    { headers: { Authorization: `Bearer ${process.env.TMDB_READ_TOKEN}` } }
  );

  return results.slice(0, MAX_RESULTS).map(
    (result): CatalogItem => ({
      imageUrl: result.poster_path
        ? `https://image.tmdb.org/t/p/w780${result.poster_path}`
        : undefined,
      source: "tmdb",
      sourceId: `${kind}/${result.id}`,
      thumbUrl: result.poster_path
        ? `https://image.tmdb.org/t/p/w154${result.poster_path}`
        : undefined,
      title: result.title ?? result.name ?? "",
      url: `https://www.themoviedb.org/${kind}/${result.id}`,
      year: yearOf(result.release_date ?? result.first_air_date),
    })
  );
}

let twitchToken: { expiresAt: number; value: string } | undefined;

/** IGDB takes a Twitch app token, which lasts about two months. */
async function getTwitchToken() {
  if (twitchToken && twitchToken.expiresAt > Date.now()) {
    return twitchToken.value;
  }
  const params = new URLSearchParams({
    client_id: process.env.TWITCH_CLIENT_ID ?? "",
    client_secret: process.env.TWITCH_CLIENT_SECRET ?? "",
    grant_type: "client_credentials",
  });
  const { access_token, expires_in } = await fetchJson<{
    access_token: string;
    expires_in: number;
  }>(`https://id.twitch.tv/oauth2/token?${params}`, { method: "POST" });
  twitchToken = {
    expiresAt: Date.now() + (expires_in - 60) * 1000,
    value: access_token,
  };
  return access_token;
}

interface IgdbGame {
  cover?: { image_id: string };
  first_release_date?: number;
  id: number;
  involved_companies?: { company: { name: string }; developer: boolean }[];
  name: string;
  url?: string;
}

export async function searchIgdb(query: string) {
  const games = await fetchJson<IgdbGame[]>("https://api.igdb.com/v4/games", {
    body: `search "${query.replaceAll('"', "")}"; fields name,url,first_release_date,cover.image_id,involved_companies.developer,involved_companies.company.name; limit ${MAX_RESULTS};`,
    headers: {
      Authorization: `Bearer ${await getTwitchToken()}`,
      "Client-ID": process.env.TWITCH_CLIENT_ID ?? "",
    },
    method: "POST",
  });

  return games.map((game): CatalogItem => {
    const cover = game.cover
      ? `https://images.igdb.com/igdb/image/upload/t_cover_big/${game.cover.image_id}.jpg`
      : undefined;
    return {
      creator: game.involved_companies
        ?.filter((company) => company.developer)
        .map((company) => company.company.name)
        .join(", "),
      imageUrl: cover,
      source: "igdb",
      sourceId: String(game.id),
      thumbUrl: cover,
      title: game.name,
      url:
        game.url ??
        `https://www.igdb.com/search?q=${encodeURIComponent(game.name)}`,
      year: game.first_release_date
        ? new Date(game.first_release_date * 1000).getUTCFullYear()
        : undefined,
    };
  });
}

interface MusicBrainzReleaseGroup {
  "artist-credit"?: { name: string; joinphrase?: string }[];
  "first-release-date"?: string;
  id: string;
  "primary-type"?: string;
  title: string;
}

/** Albums, EPs and singles as MusicBrainz release groups. */
export async function searchMusicBrainz(query: string) {
  const params = new URLSearchParams({
    fmt: "json",
    limit: String(MAX_RESULTS),
    query,
  });
  const { "release-groups": groups } = await fetchJson<{
    "release-groups": MusicBrainzReleaseGroup[];
  }>(`https://musicbrainz.org/ws/2/release-group/?${params}`);

  return groups.map((group): CatalogItem => {
    // The Cover Art Archive answers 404 when it has no front cover.
    const cover = `https://coverartarchive.org/release-group/${group.id}/front`;
    return {
      creator: group["artist-credit"]
        ?.map((credit) => `${credit.name}${credit.joinphrase ?? ""}`)
        .join(""),
      description: group["primary-type"],
      imageUrl: `${cover}-500`,
      source: "musicBrainz",
      sourceId: group.id,
      thumbUrl: `${cover}-250`,
      title: group.title,
      url: `https://musicbrainz.org/release-group/${group.id}`,
      year: yearOf(group["first-release-date"]),
    };
  });
}

interface ItunesPodcast {
  artistName: string;
  artworkUrl100?: string;
  artworkUrl600?: string;
  collectionId: number;
  collectionName: string;
  collectionViewUrl: string;
}

export async function searchItunesPodcasts(query: string) {
  const params = new URLSearchParams({
    limit: String(MAX_RESULTS),
    media: "podcast",
    term: query,
  });
  const { results } = await fetchJson<{ results: ItunesPodcast[] }>(
    `https://itunes.apple.com/search?${params}`
  );

  return results.map(
    (podcast): CatalogItem => ({
      creator: podcast.artistName,
      imageUrl: podcast.artworkUrl600,
      source: "itunes",
      sourceId: String(podcast.collectionId),
      thumbUrl: podcast.artworkUrl100,
      title: podcast.collectionName,
      url: podcast.collectionViewUrl,
    })
  );
}
