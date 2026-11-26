import { extractLexicalText } from "@/utilities/extract-lexical-text";

const WORDS_PER_MINUTE = 220;
const WHITESPACE_PATTERN = /\s+/u;

export function countWords(text: string): number {
  const trimmed = text.trim();
  if (!trimmed) {
    return 0;
  }
  return trimmed.split(WHITESPACE_PATTERN).length;
}

/**
 * Estimates editorial reading time in whole minutes from a Lexical document.
 * Returns null when the content has no readable text.
 */
export function estimateReadingTimeMinutes(content: unknown): number | null {
  const words = countWords(extractLexicalText(content));
  if (words === 0) {
    return null;
  }
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

export function formatReadingTime(minutes: number): string {
  return `${minutes} min read`;
}
