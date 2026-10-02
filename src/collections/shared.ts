import type { CollectionAdminOptions, CollectionConfig } from "payload";
import { generatePreviewPath } from "@/utilities/generate-preview-path";
import { getServerSideURL } from "@/utilities/get-url";

/** Drafts with 30-second autosave, keeping the five latest versions. */
export const draftVersions = (): CollectionConfig["versions"] => ({
  drafts: {
    autosave: {
      interval: 30_000,
    },
  },
  maxPerDoc: 5,
});

/** Admin preview and live preview of the document's public page. */
export const previewAdmin = (
  collection: Parameters<typeof generatePreviewPath>[0]["collection"]
): Pick<CollectionAdminOptions, "livePreview" | "preview"> => {
  const previewURL = (data: Record<string, unknown> | undefined) => {
    const path = generatePreviewPath({
      slug: typeof data?.slug === "string" ? data.slug : "",
      collection,
    });

    return `${getServerSideURL()}${path}`;
  };

  return {
    livePreview: {
      url: ({ data }) => previewURL(data),
    },
    preview: (data) => previewURL(data),
  };
};
