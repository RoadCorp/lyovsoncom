import type { FieldHook, PayloadRequest } from "payload";
import { describe, expect, it } from "vitest";
import { populateSlugSourceHook } from "./populate-slug-source";

const req = {
  payload: { findByID: async () => ({ title: "Alfonso Cuarón" }) },
} as unknown as PayloadRequest;

function run(operation: "create" | "update", originalDoc?: object) {
  const data: Record<string, unknown> = { reference: 1 };
  const args = { data, operation, originalDoc, req };
  return Promise.resolve(
    populateSlugSourceHook(args as unknown as Parameters<FieldHook>[0])
  ).then(() => data.slug);
}

describe("populateSlugSourceHook", () => {
  it("slugs a new activity from its reference's title", async () => {
    expect(await run("create")).toBe("alfonso-cuaron");
  });

  it("keeps a stored slug so the old activity URL still redirects", async () => {
    expect(
      await run("update", { reference: 1, slug: "alfonso-cuarn" })
    ).toBeUndefined();
  });
});
