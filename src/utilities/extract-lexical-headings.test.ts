import { describe, expect, it } from "vitest";
import {
  createHeadingSlugger,
  extractLexicalHeadings,
} from "./extract-lexical-headings";

describe("extractLexicalHeadings", () => {
  it("extracts h2 and h3 headings with deterministic, deduplicated IDs", () => {
    const content = {
      root: {
        children: [
          {
            type: "heading",
            tag: "h1",
            children: [{ type: "text", text: "Ignored Title" }],
          },
          {
            type: "heading",
            tag: "h2",
            children: [{ type: "text", text: "Lyóvson Crest & Type" }],
          },
          {
            type: "paragraph",
            children: [{ type: "text", text: "Body paragraph" }],
          },
          {
            type: "heading",
            tag: "h3",
            children: [{ type: "text", text: "Notes" }],
          },
          {
            type: "heading",
            tag: "h3",
            children: [{ type: "text", text: "Notes" }],
          },
          {
            type: "heading",
            tag: "h2",
            children: [{ type: "text", text: "   " }],
          },
        ],
      },
    };

    expect(extractLexicalHeadings(content)).toEqual([
      { id: "lyovson-crest-type", level: 2, text: "Lyóvson Crest & Type" },
      { id: "notes", level: 3, text: "Notes" },
      { id: "notes-2", level: 3, text: "Notes" },
    ]);
  });

  it("falls back to 'section' for symbol-only headings", () => {
    const slugger = createHeadingSlugger();
    expect(slugger("◇ ◇ ◇")).toBe("section");
    expect(slugger("!!!")).toBe("section-2");
  });
});
