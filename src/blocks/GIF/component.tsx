import { LazyVideo } from "@/components/LazyVideo";
import { Media } from "@/components/Media";
import RichText from "@/components/RichText";
import { cn } from "@/lib/utils";
import type { Media as MediaType } from "@/payload-types";
import { normalizeAspectRatio } from "@/utilities/aspect-ratio";
import { captionWithText } from "@/utilities/extract-lexical-text";
import type { GIFBlock as GIFBlockType } from "./types";

/**
 * GIF Block: a looping, muted video (or an animated GIF image) from Media,
 * or a GIPHY pick hotlinked from GIPHY with its attribution.
 * A block with nothing to show renders nothing, and a GIF that fails to load
 * hides its card.
 */
function videoSources(props: GIFBlockType, media: MediaType | null) {
  if (!media) {
    return { mp4Src: props.mp4Url, webmSrc: props.webmUrl };
  }
  return media.mimeType === "video/webm"
    ? { mp4Src: null, webmSrc: media.url }
    : { mp4Src: media.url, webmSrc: null };
}

export function GIFBlock(props: GIFBlockType) {
  const media = typeof props.media === "object" ? props.media : null;
  const poster = typeof props.poster === "object" ? props.poster : null;
  const giphyUrl =
    !media && props.sourceUrl?.startsWith("https://giphy.com/")
      ? props.sourceUrl
      : null;
  const caption = captionWithText(props.caption);
  const hasFooter = Boolean(caption || giphyUrl);
  const isImage = media?.mimeType?.startsWith("image/");
  const { mp4Src, webmSrc } = videoSources(props, media);

  if (!(isImage || mp4Src || webmSrc)) {
    return null;
  }

  return (
    <figure className="surface-block reveal-stagger-1 flex flex-col overflow-hidden content-block has-[video[data-failed]]:hidden">
      <div className={cn(hasFooter ? "p-3" : "p-0")}>
        <div className="media-frame overflow-hidden rounded-lg">
          {isImage ? (
            <Media
              imgClassName="h-auto object-cover"
              pictureClassName="mt-0 mb-0"
              resource={media ?? undefined}
            />
          ) : (
            <LazyVideo
              alt={media?.alt || props.alt || "Animated GIF"}
              aspectRatio={
                props.aspectRatio
                  ? normalizeAspectRatio(props.aspectRatio)
                  : undefined
              }
              mp4Src={mp4Src || undefined}
              poster={poster?.url || props.posterUrl || undefined}
              webmSrc={webmSrc || undefined}
            />
          )}
        </div>
      </div>

      {hasFooter && (
        <figcaption
          className="surface-caption flex-col items-start gap-1 sm:px-5 sm:py-3"
          dir="auto"
        >
          {caption && (
            <RichText
              className="surface-caption-text"
              content={caption}
              enableGutter={false}
              enableProse={false}
            />
          )}
          {giphyUrl && (
            <a
              className="tone-muted text-sm underline-offset-4 hover:underline"
              href={giphyUrl}
              rel="noopener noreferrer"
              target="_blank"
            >
              via GIPHY
            </a>
          )}
        </figcaption>
      )}
    </figure>
  );
}
