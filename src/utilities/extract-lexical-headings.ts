import { extractLexicalText } from "@/utilities/extract-lexical-text";

export interface LexicalHeading {
  id: string;
  level: 2 | 3;
  text: string;
}

const COMBINING_DIACRITICS_PATTERN = /[\u0300-\u036f]/gu;
const NON_SLUG_CHARS_PATTERN = /[^a-z0-9]+/gu;
const EDGE_HYPHENS_PATTERN = /^-+|-+$/gu;

function slugifyHeadingBase(text: string): string {
  const normalized = text
    .normalize("NFKD")
    .replace(COMBINING_DIACRITICS_PATTERN, "")
    .toLowerCase()
    .replace(NON_SLUG_CHARS_PATTERN, "-")
    .replace(EDGE_HYPHENS_PATTERN, "");

  return normalized || "section";
}

/**
 * Creates a deterministic, collision-safe heading ID generator for a single
 * document pass. Repeated headings receive `-2`, `-3`, etc. suffixes.
 */
export function createHeadingSlugger(): (text: string) => string {
  const seen = new Map<string, number>();

  return (text: string) => {
    const base = slugifyHeadingBase(text);
    const count = (seen.get(base) ?? 0) + 1;
    seen.set(base, count);
    return count === 1 ? base : `${base}-${count}`;
  };
}

export function extractLexicalHeadingText(node: unknown): string {
  return extractLexicalText(node).replace(/\s+/gu, " ").trim();
}

function collectHeadings(
  nodes: unknown,
  slugger: (text: string) => string,
  out: LexicalHeading[]
): void {
  if (!Array.isArray(nodes)) {
    return;
  }

  for (const node of nodes) {
    if (!node || typeof node !== "object") {
      continue;
    }

    const record = node as Record<string, unknown>;
    if (
      record.type === "heading" &&
      (record.tag === "h2" || record.tag === "h3")
    ) {
      const text = extractLexicalHeadingText(record.children);
      if (text) {
        out.push({
          id: slugger(text),
          level: record.tag === "h2" ? 2 : 3,
          text,
        });
      }
      continue;
    }

    if ("children" in record && Array.isArray(record.children)) {
      collectHeadings(record.children, slugger, out);
    }
  }
}

/**
 * Extracts h2 and h3 headings from a Lexical document with the exact same
 * deterministic IDs assigned by RichText serialization.
 */
export function extractLexicalHeadings(content: unknown): LexicalHeading[] {
  if (!content || typeof content !== "object" || !("root" in content)) {
    return [];
  }

  const root = (content as { root?: { children?: unknown } }).root;
  if (!root || typeof root !== "object") {
    return [];
  }

  const headings: LexicalHeading[] = [];
  collectHeadings(root.children, createHeadingSlugger(), headings);
  return headings;
}
