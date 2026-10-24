/**
 * True only for a signed-in Lyovson. Other auth collections (API-key agents)
 * get only the access their own collection grants, never a Lyovson's.
 */
export function isLyovson<T extends { collection?: string }>(
  user: T | null | undefined
): user is Extract<T, { collection: "lyovsons" }> {
  return user?.collection === "lyovsons";
}
