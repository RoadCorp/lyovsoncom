import { describe, expect, it, vi } from "vitest";
import { populateContentTextHook } from "./populateContentText";

const notes = {
  root: {
    type: "root",
    children: [
      {
        type: "paragraph",
        children: [{ type: "text", text: "Loved the ending." }],
      },
    ],
  },
};

function run(args: {
  data: Record<string, unknown>;
  originalDoc?: Record<string, unknown>;
  title?: string;
}) {
  const findByID = vi.fn().mockResolvedValue({ title: args.title ?? "" });
  const req = { payload: { findByID } };
  const result = populateContentTextHook({
    data: args.data,
    originalDoc: args.originalDoc,
    operation: "update",
    req,
  } as never);
  return { result, findByID };
}

describe("activity content_text", () => {
  it("includes the reference title when the reference is a numeric id", async () => {
    const { result, findByID } = run({
      data: { reference: 12, activityType: "watch", notes },
      title: "Project Hail Mary",
    });
    const data = await result;
    expect(findByID).toHaveBeenCalledWith(
      expect.objectContaining({ collection: "references", id: 12 })
    );
    expect(data.content_text).toContain("Project Hail Mary");
    expect(data.content_text).toContain("Loved the ending.");
  });

  it("uses a populated reference without another lookup", async () => {
    const { result, findByID } = run({
      data: { reference: { id: 3, title: "Siddhartha" }, activityType: "read" },
    });
    expect((await result).content_text).toContain("Siddhartha");
    expect(findByID).not.toHaveBeenCalled();
  });

  it("keeps the stored reference and notes on partial updates", async () => {
    const { result } = run({
      data: { rating: 8 },
      originalDoc: { reference: 5, activityType: "listen", notes },
      title: "No Line on the Horizon",
    });
    const data = await result;
    expect(data.content_text).toContain("No Line on the Horizon");
    expect(data.content_text).toContain("Loved the ending.");
  });

  it("clears content_text when there is nothing to index", async () => {
    const { result } = run({ data: { reference: null } });
    expect((await result).content_text).toBeNull();
  });
});
