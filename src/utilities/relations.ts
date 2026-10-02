type RelationId = number | string;

/**
 * Returns the id of a relationship value, whether Payload gave us the raw id
 * (a number on Postgres) or a populated document.
 */
export function getRelationId(value: unknown): RelationId | null {
  if (typeof value === "number" || (typeof value === "string" && value)) {
    return value;
  }

  if (typeof value === "object" && value !== null && "id" in value) {
    const { id } = value as { id?: unknown };
    if (typeof id === "number" || (typeof id === "string" && id)) {
      return id;
    }
  }

  return null;
}

/** True when a relationship value is a populated document, not just an id. */
export function isPopulated<T extends object>(
  value: T | RelationId | null | undefined
): value is T {
  return typeof value === "object" && value !== null;
}
