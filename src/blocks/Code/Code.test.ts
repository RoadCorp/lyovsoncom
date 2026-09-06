import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Code } from "./Code";

describe("server-rendered code blocks", () => {
  it("escapes source text and retains syntax colors without client highlighting", () => {
    const html = renderToStaticMarkup(
      createElement(Code, {
        code: 'const label = "<script>";',
        language: "javascript",
      })
    );
    expect(html).toContain("var(--syntax-keyword)");
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toContain("<script>");
    expect(html).toContain('aria-label="Copy code"');
  });
  it("renders unknown languages as plain selectable text", () => {
    const html = renderToStaticMarkup(
      createElement(Code, {
        code: "first\nsecond",
        language: "unknown-language",
      })
    );
    expect(html).toContain("first");
    expect(html).toContain("second");
    expect(html).toContain("UNKNOWN-LANGUAGE");
  });
});
