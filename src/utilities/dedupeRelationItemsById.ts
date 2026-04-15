type RelationValue =
  | number
  | string
  | {
      id?: number | string | null;
    }
  | null
  | undefined;

type RelationObject = Exclude<
  RelationValue,
  number | string | null | undefined
>;

export function dedupeRelationItemsById<T extends RelationObject>(
  items: Array<T | number | string | null | undefined> | null | undefined
) {
  if (!items || items.length === 0) {
    return [] as T[];
  }

  const dedupedItems: T[] = [];
  const seenIds = new Set<string>();

  for (const item of items) {
    if (!(typeof item === "object" && item !== null)) {
      continue;
    }

    const itemId = item.id;

    if (!(typeof itemId === "number" || typeof itemId === "string")) {
      continue;
    }

    const dedupeKey = String(itemId);

    if (seenIds.has(dedupeKey)) {
      continue;
    }

    seenIds.add(dedupeKey);
    dedupedItems.push(item as T);
  }

  return dedupedItems;
}
