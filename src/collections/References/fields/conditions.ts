import type { Condition } from "payload";

/** Admin condition that shows a field only for the given reference types. */
export function showForTypes(...types: string[]): Condition {
  return (data) => types.includes(data?.type);
}
