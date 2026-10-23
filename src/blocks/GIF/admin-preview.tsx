import { BlockPreview } from "@/components/admin/block-preview";
import { BlockPreviewCaption } from "@/components/admin/block-preview-caption";
import type { GIFBlock } from "@/payload-types";
import { normalizeAspectRatio } from "@/utilities/aspect-ratio";

export function GIFPreview({
  siblingData,
}: {
  siblingData?: Partial<GIFBlock>;
}) {
  return (
    <BlockPreview>
      {siblingData?.mp4Url ? (
        <div
          className="block-preview__frame"
          style={{
            aspectRatio: normalizeAspectRatio(siblingData.aspectRatio || "1"),
          }}
        >
          <video
            autoPlay
            loop
            muted
            playsInline
            poster={siblingData.posterUrl || undefined}
          >
            {siblingData.webmUrl && (
              <source src={siblingData.webmUrl} type="video/webm" />
            )}
            <source src={siblingData.mp4Url} type="video/mp4" />
          </video>
        </div>
      ) : (
        <p className="block-preview__empty">Choose a GIF.</p>
      )}
      <BlockPreviewCaption content={siblingData?.caption} />
    </BlockPreview>
  );
}
