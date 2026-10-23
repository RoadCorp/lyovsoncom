// Trims edge hyphens (a title ending in a space gave "/posts/laurel-…-worlds-")
// but keeps inner "--" so new slugs match live URLs like /posts/stress--success.
export const formatSlug = (val: string): string =>
  val
    .trim()
    .replace(/ /g, "-")
    .replace(/[^\w-]+/g, "")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();
