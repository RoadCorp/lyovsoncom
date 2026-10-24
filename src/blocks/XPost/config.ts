import type { Block } from "payload";
import { captionEditor } from "@/fields/default-lexical";

// Regex patterns for X/Twitter post ID extraction
const NUMERIC_ID_REGEX = /^\d+$/;
const STATUS_PATH_REGEX = /\/status\/(\d+)/;

// Improved X post ID/URL extraction function
const extractXPostID = (input: string): string => {
  if (!input) {
    return "";
  }

  // If it's already a numeric ID, return it
  if (NUMERIC_ID_REGEX.test(input)) {
    return input;
  }

  try {
    const urlObj = new URL(input);

    // Normalize hostname
    const hostname = urlObj.hostname.replace("www.", "");

    // Handle x.com and twitter.com domains
    if (hostname === "x.com" || hostname === "twitter.com") {
      // Extract ID from path format: /username/status/123456789
      const matches = urlObj.pathname.match(STATUS_PATH_REGEX);
      if (matches?.[1]) {
        return matches[1];
      }
    }
  } catch (_e) {
    // Not a URL, check if it's a full path
    const pathMatches = input.match(STATUS_PATH_REGEX);
    if (pathMatches?.[1]) {
      return pathMatches[1];
    }
  }

  return "";
};

export const XPost: Block = {
  slug: "xpost",
  labels: { singular: "X post", plural: "X posts" },
  admin: {
    components: { Block: "@/blocks/XPost/admin-preview#XPostPreview" },
  },
  interfaceName: "XPostBlock",
  fields: [
    {
      name: "postId",
      type: "text",
      required: true,
      label: "X Post URL or ID",
      admin: {
        description:
          "Enter an X (Twitter) post URL (e.g., https://x.com/username/status/123456789) or post ID",
      },
      hooks: {
        beforeChange: [
          ({ value }) => {
            if (!value) {
              return value;
            }
            const postId = extractXPostID(value);
            if (!postId) {
              throw new Error(
                "Invalid X post URL or ID. Please enter a valid X (Twitter) post URL or ID."
              );
            }
            return postId;
          },
        ],
      },
    },
    {
      name: "caption",
      type: "richText",
      editor: captionEditor,
      label: "Caption",
    },
  ],
};
