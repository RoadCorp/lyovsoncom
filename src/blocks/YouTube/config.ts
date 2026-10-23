import {
  FixedToolbarFeature,
  InlineToolbarFeature,
  lexicalEditor,
} from "@payloadcms/richtext-lexical";
import type { Block } from "payload";

// YouTube ID validation regex (11 characters of alphanumeric and -/_)
const YOUTUBE_ID_REGEX = /^[A-Za-z0-9_-]{11}$/;

// Improved YouTube ID extraction function
export const extractYouTubeID = (url: string): string => {
  if (!url) {
    return "";
  }

  // If it's already an ID (11 characters of alphanumeric and -/_)
  if (YOUTUBE_ID_REGEX.test(url)) {
    return url;
  }

  try {
    const urlObj = new URL(url);

    // Normalize hostname for safety (e.g., www.youtube.com vs youtube.com)
    const hostname = urlObj.hostname.replace("www.", "");

    // Handle youtu.be links
    if (hostname === "youtu.be") {
      return urlObj.pathname.slice(1); // Strip leading '/'
    }

    // Handle youtube.com links
    if (hostname === "youtube.com" || hostname === "m.youtube.com") {
      if (urlObj.pathname.includes("/shorts/")) {
        return urlObj.pathname.split("/shorts/")[1].split("/")[0]; // Handle trailing slashes
      }
      if (urlObj.pathname.includes("/embed/")) {
        return urlObj.pathname.split("/embed/")[1].split("/")[0];
      }
      const videoId = urlObj.searchParams.get("v");
      if (videoId) {
        return videoId;
      }
    }

    // Handle gaming.youtube.com and other subdomains
    if (hostname.endsWith("youtube.com")) {
      const videoId = urlObj.searchParams.get("v");
      if (videoId) {
        return videoId;
      }
    }
  } catch (_e) {
    // Invalid URL, return empty string
    return "";
  }

  return "";
};

export const YouTube: Block = {
  slug: "youtube",
  labels: { singular: "YouTube video", plural: "YouTube videos" },
  admin: {
    components: { Block: "@/blocks/YouTube/admin-preview#YouTubePreview" },
  },
  interfaceName: "YouTubeBlock",
  fields: [
    {
      name: "videoId",
      type: "text",
      required: true,
      label: "YouTube Video URL or ID",
      admin: {
        description:
          "Enter a YouTube URL (e.g., https://www.youtube.com/watch?v=dQw4w9WgXcQ) or video ID",
      },
      hooks: {
        beforeChange: [
          ({ value }) => {
            if (!value) {
              return value;
            }
            const videoId = extractYouTubeID(value);
            if (!videoId) {
              throw new Error(
                "Invalid YouTube URL or video ID. Please enter a valid YouTube URL or ID."
              );
            }
            return videoId;
          },
        ],
      },
    },
    {
      name: "caption",
      type: "richText",
      editor: lexicalEditor({
        features: ({ rootFeatures }) => {
          return [
            ...rootFeatures,
            FixedToolbarFeature(),
            InlineToolbarFeature(),
          ];
        },
      }),
      label: "Caption",
    },
    {
      name: "aspectRatio",
      type: "select",
      defaultValue: "16:9",
      options: [
        {
          label: "16:9",
          value: "16:9",
        },
        {
          label: "4:3",
          value: "4:3",
        },
        {
          label: "1:1",
          value: "1:1",
        },
      ],
    },
  ],
};
