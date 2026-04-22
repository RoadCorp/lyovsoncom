const DEFAULT_CANONICAL_ORIGIN = "https://www.lyovson.com";
const DEFAULT_RUNTIME_ORIGIN = "http://localhost:3000";
const DEFAULT_OG_IMAGE_PATH = "/og-image.png";
const DEFAULT_LOGO_PATH = "/android-chrome-512x512.png";

function trimTrailingSlash(value: string) {
  return value.endsWith("/") ? value.slice(0, -1) : value;
}

function normalizeOrigin(value: string | undefined) {
  if (!value) {
    return null;
  }

  return trimTrailingSlash(value);
}

function getConfiguredRuntimeOrigin() {
  const configuredOrigin = normalizeOrigin(process.env.NEXT_PUBLIC_SERVER_URL);

  if (configuredOrigin) {
    return configuredOrigin;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return DEFAULT_RUNTIME_ORIGIN;
}

function escapeRegExp(value: string) {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export const siteConfig = {
  canonicalOrigin: DEFAULT_CANONICAL_ORIGIN,
  defaultDescription: "Official website of Rafa and Jess Lyóvson",
  defaultOgImagePath: DEFAULT_OG_IMAGE_PATH,
  logoPath: DEFAULT_LOGO_PATH,
  name: "Lyóvson.com",
  alternateNames: ["Lyovson.com", "lyovson.com"],
  socialHandle: "@lyovson",
  authors: [
    {
      name: "Rafa Lyóvson",
      username: "rafa",
      sameAs: ["https://x.com/rafalyovson", "https://github.com/rafalyovson"],
    },
    {
      name: "Jess Lyóvson",
      username: "jess",
      sameAs: [],
    },
  ],
} as const;

const knownSiteNames = [siteConfig.name, ...siteConfig.alternateNames].map(
  (value) => escapeRegExp(value.toLowerCase())
);

const siteNamePattern = new RegExp(
  `\\s*[|\\-—]\\s*(?:${knownSiteNames.join("|")})$`,
  "i"
);

export function getRuntimeSiteOrigin() {
  return getConfiguredRuntimeOrigin();
}

export function getCanonicalSiteOrigin() {
  return siteConfig.canonicalOrigin;
}

export function getCanonicalUrl(path = "/") {
  return new URL(path, getCanonicalSiteOrigin()).toString();
}

export function getRuntimeUrl(path = "/") {
  return new URL(path, getRuntimeSiteOrigin()).toString();
}

export function getDefaultOgImageUrl() {
  return getCanonicalUrl(siteConfig.defaultOgImagePath);
}

export function getSiteLogoUrl() {
  return getCanonicalUrl(siteConfig.logoPath);
}

export function getAuthorProfileUrl(username: string) {
  return getCanonicalUrl(`/${username}`);
}

export function stripSiteBranding(value: string) {
  return value.replace(siteNamePattern, "").trim();
}

export function getSocialTitle(value: string) {
  const strippedValue = stripSiteBranding(value);

  return strippedValue === siteConfig.name
    ? siteConfig.name
    : `${strippedValue} | ${siteConfig.name}`;
}

export function getKnownAuthor(username: string | null | undefined) {
  if (!username) {
    return null;
  }

  return (
    siteConfig.authors.find((author) => author.username === username) ?? null
  );
}

export function getSiteEntityAuthorData() {
  return siteConfig.authors.map((author) => ({
    name: author.name,
    username: author.username,
    sameAs: [...author.sameAs],
  }));
}
