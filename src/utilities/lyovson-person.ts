import type { Lyovson, Media } from "@/payload-types";
import { absoluteUrl } from "./routes";
import { getKnownAuthor } from "./site-config";

type PersonRecord =
  | Pick<Lyovson, "avatar" | "name" | "quote" | "socialLinks" | "username">
  | null
  | undefined;

export function getLyovsonAvatarUrl(person: PersonRecord) {
  const avatar =
    person?.avatar && typeof person.avatar === "object"
      ? (person.avatar as Media)
      : null;

  return avatar?.url ? absoluteUrl(avatar.url) : undefined;
}

export function getLyovsonSameAs(person: PersonRecord) {
  const links =
    person?.socialLinks
      ?.map((link) => link.url)
      .filter((url): url is string => Boolean(url)) ?? [];

  if (links.length > 0) {
    return links;
  }

  const knownAuthor = person?.username ? getKnownAuthor(person.username) : null;

  return knownAuthor ? [...knownAuthor.sameAs] : undefined;
}

export function getLyovsonDisplayName(
  person: PersonRecord,
  fallbackName?: string | null
) {
  const knownAuthor = person?.username ? getKnownAuthor(person.username) : null;

  return knownAuthor?.name || person?.name || fallbackName || "Lyovson";
}

export function getLyovsonPersonInput(person: PersonRecord) {
  const username = person?.username || null;

  if (!username) {
    return null;
  }

  return {
    name: getLyovsonDisplayName(person, username),
    username,
    avatarUrl: getLyovsonAvatarUrl(person),
    bio: person?.quote || undefined,
    sameAs: getLyovsonSameAs(person),
  };
}

export function getPersonInputFromUsername(
  username: string | null | undefined
) {
  const knownAuthor = getKnownAuthor(username);

  if (!(username && knownAuthor)) {
    return null;
  }

  return {
    name: knownAuthor.name,
    username,
    sameAs: [...knownAuthor.sameAs],
  };
}
