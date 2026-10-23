import type { PayloadRequest } from "payload";
import { BlockPreview } from "@/components/admin/block-preview";
import { BlockPreviewCaption } from "@/components/admin/block-preview-caption";
import type { GIFBlock, Media } from "@/payload-types";
import { normalizeAspectRatio } from "@/utilities/aspect-ratio";

// The editor's form state holds relations as IDs.
function findMedia(req: PayloadRequest, value?: number | Media | null) {
  return typeof value === "number"
    ? req.payload
        .findByID({ collection: "media", depth: 0, id: value, req })
        .catch(() => null)
    : Promise.resolve(value ?? null);
}

export async function GIFPreview({
  req,
  siblingData,
}: {
  req: PayloadRequest;
  siblingData?: Partial<GIFBlock>;
}) {
  const [media, poster] = await Promise.all([
    findMedia(req, siblingData?.media),
    findMedia(req, siblingData?.poster),
  ]);
  const src = media?.url ?? siblingData?.mp4Url;
  const isImage = media?.mimeType?.startsWith("image/");

  return (
    <BlockPreview>
      {src ? (
        <div
          className="block-preview__frame"
          style={
            siblingData?.aspectRatio
              ? { aspectRatio: normalizeAspectRatio(siblingData.aspectRatio) }
              : undefined
          }
        >
          {isImage ? (
            // biome-ignore lint/performance/noImgElement: animated GIF preview
            <img
              alt={media?.alt ?? ""}
              height={media?.height ?? undefined}
              src={src}
              width={media?.width ?? undefined}
            />
          ) : (
            <video
              autoPlay
              loop
              muted
              playsInline
              poster={poster?.url ?? siblingData?.posterUrl ?? undefined}
            >
              {!media && siblingData?.webmUrl && (
                <source src={siblingData.webmUrl} type="video/webm" />
              )}
              <source src={src} type={media?.mimeType ?? "video/mp4"} />
            </video>
          )}
        </div>
      ) : (
        <p className="block-preview__empty">Choose or upload a GIF.</p>
      )}
      <BlockPreviewCaption content={siblingData?.caption} />
    </BlockPreview>
  );
}
