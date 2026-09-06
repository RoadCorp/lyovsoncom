type ExtractionMode = "newline" | "plain";

function getNestedLexicalContent(content: Record<string, unknown>): unknown {
  if ("root" in content && content.root) {
    return content.root;
  }

  if ("children" in content && content.children) {
    return content.children;
  }

  if ("content" in content && content.content) {
    return content.content;
  }

  return null;
}

function extractTextByMode(content: unknown, mode: ExtractionMode): string {
  if (!content) {
    return "";
  }

  if (typeof content === "string") {
    return content;
  }

  if (Array.isArray(content)) {
    const extracted = content.map((item) => extractTextByMode(item, mode));
    return mode === "newline"
      ? extracted.filter(Boolean).join("\n")
      : extracted.join(" ");
  }

  if (typeof content !== "object") {
    return "";
  }

  if ("text" in content && typeof content.text === "string") {
    return content.text;
  }

  if (mode === "newline" && "type" in content && content.type === "linebreak") {
    return "\n";
  }

  if (
    mode === "newline" &&
    "type" in content &&
    content.type === "paragraph" &&
    "children" in content &&
    content.children
  ) {
    return extractTextByMode(content.children, mode).trim();
  }

  const nestedContent = getNestedLexicalContent(
    content as Record<string, unknown>
  );
  return nestedContent ? extractTextByMode(nestedContent, mode) : "";
}

export function extractLexicalText(content: unknown): string {
  return extractTextByMode(content, "plain");
}

/**
 * Extract plain text from Lexical rich text content, preserving line breaks.
 *
 * Useful for poem / verse excerpts where line breaks are meaningful.
 *
 * - Paragraph nodes become newline-delimited blocks
 * - linebreak nodes become '\n'
 */
export function extractLexicalTextWithNewlines(content: unknown): string {
  return extractTextByMode(content, "newline");
}
