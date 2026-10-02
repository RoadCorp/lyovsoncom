import crypto from "node:crypto";
import { openai } from "@ai-sdk/openai";
import { embed } from "ai";

// Re-export extractLexicalText as extractTextFromContent for backwards compatibility
export { extractLexicalText as extractTextFromContent } from "./extract-lexical-text";

const EMBEDDING_TEXT_LIMIT = 8000;
export const EMBEDDING_MODEL = "text-embedding-3-small";
export const EMBEDDING_VECTOR_DIMENSIONS = 1536;
const HASH_PREFIX_LENGTH = 16;

// Hash exactly what is embedded, so edits past the limit don't trigger a
// paid re-embed that would produce the same vector.
export function createTextHash(text: string): string {
  return crypto
    .createHash("sha256")
    .update(text.slice(0, EMBEDDING_TEXT_LIMIT))
    .digest("hex")
    .slice(0, HASH_PREFIX_LENGTH);
}

// Main embedding generation function
export async function generateEmbedding(text: string): Promise<{
  vector: number[];
  model: string;
  dimensions: number;
}> {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }

  try {
    const { embedding } = await embed({
      model: openai.embedding(EMBEDDING_MODEL),
      value: text.slice(0, EMBEDDING_TEXT_LIMIT),
    });

    if (embedding.length !== EMBEDDING_VECTOR_DIMENSIONS) {
      throw new Error(
        `Unexpected embedding length: expected ${EMBEDDING_VECTOR_DIMENSIONS}, got ${embedding.length}`
      );
    }

    return {
      vector: embedding,
      model: EMBEDDING_MODEL,
      dimensions: embedding.length,
    };
  } catch (error) {
    throw new Error(
      `Failed to generate embedding: ${error instanceof Error ? error.message : String(error)}`,
      { cause: error }
    );
  }
}
