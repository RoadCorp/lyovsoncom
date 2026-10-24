// Trims edge hyphens (a title ending in a space gave "/posts/laurel-…-worlds-")
// but keeps inner "--" so new slugs match live URLs like /posts/stress--success.
// Accents fold to their base letter rather than vanishing: "Cuarón" → "cuaron".
export const formatSlug = (val: string): string =>
  val
    .normalize("NFKD")
    .replace(/\p{M}/gu, "")
    .trim()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
