export function normalizeSearchQuery(
  value: string | string[] | undefined
): string {
  const query = Array.isArray(value) ? value[0] : value;
  return query?.trim() || "";
}
