import Image from "next/image";
import { BlockPreview } from "@/components/admin/block-preview";
import { BlockPreviewCaption } from "@/components/admin/block-preview-caption";
import type { YouTubeBlock } from "@/payload-types";
import { normalizeAspectRatio } from "@/utilities/aspect-ratio";
import { extractYouTubeID } from "./config";

export function YouTubePreview({
  siblingData,
}: {
  siblingData?: Partial<YouTubeBlock>;
}) {
  // Unsaved edits can still hold the pasted URL; the hook stores the ID.
  const videoId = extractYouTubeID(siblingData?.videoId ?? "");

  return (
    <BlockPreview>
      {videoId ? (
        <div
          className="block-preview__frame"
          style={{
            aspectRatio: normalizeAspectRatio(
              siblingData?.aspectRatio || "16:9"
            ),
          }}
        >
          <Image
            alt=""
            fill
            sizes="560px"
            src={`https://img.youtube.com/vi/${videoId}/hqdefault.jpg`}
          />
          <span aria-hidden="true" className="block-preview__play">
            <svg
              aria-hidden="true"
              fill="currentColor"
              height="20"
              viewBox="0 0 20 20"
              width="20"
            >
              <path d="M6 4l10 6-10 6z" />
            </svg>
          </span>
        </div>
      ) : (
        <p className="block-preview__empty">Add a YouTube URL or ID.</p>
      )}
      <BlockPreviewCaption content={siblingData?.caption} />
    </BlockPreview>
  );
}
