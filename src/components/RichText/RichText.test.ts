import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import RichText from "./index";

vi.mock("@/blocks/XPost/Component", () => ({ XPostBlock: () => null }));

describe("stored rich text", () => {
  it("preserves paragraphs, combined emphasis and line breaks while escaping text", () => {
    const html = renderToStaticMarkup(
      createElement(RichText, {
        content: {
          root: {
            children: [
              {
                type: "paragraph",
                children: [
                  {
                    type: "text",
                    format: 3,
                    text: "<script>alert(1)</script>",
                  },
                  { type: "linebreak" },
                  { type: "text", text: "Next line" },
                ],
              },
              {
                type: "paragraph",
                children: [{ type: "text", text: "Second paragraph" }],
              },
            ],
          },
        },
      })
    );
    expect(html).toContain("<strong>");
    expect(html).toContain("<em>");
    expect(html).toContain("&lt;script&gt;alert(1)&lt;/script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain("<br/>");
    expect(html).toContain("Next line");
    expect(html).toContain("Second paragraph");
  });

  it("keeps surrounding text readable when a stored block is no longer supported", () => {
    const html = renderToStaticMarkup(
      createElement(RichText, {
        content: {
          root: {
            children: [
              null,
              { type: "text", text: "Before" },
              { type: "block", fields: { blockType: "retired-widget" } },
              { type: "text", text: "After" },
            ],
          },
        },
      })
    );
    expect(html).toContain("Before");
    expect(html).toContain("Unsupported content block: retired-widget");
    expect(html).toContain("After");
  });
});
