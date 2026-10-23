import { LazyVideo } from "@/components/LazyVideo";
import { Media } from "@/components/Media";
import RichText from "@/components/RichText";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Media as MediaType } from "@/payload-types";
import { normalizeAspectRatio } from "@/utilities/aspect-ratio";
import type { GIFBlock as GIFBlockType } from "./types";

/**
 * GIF Block: a looping, muted video (or an animated GIF image) from Media,
 * or a GIPHY pick hotlinked from GIPHY with its attribution. Older Tenor
 * blocks keep their URLs until scripts/replace-tenor-gifs.ts swaps them.
 * A block with nothing to show renders nothing.
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
  const giphyUrl = media ? null : props.sourceUrl;
  const hasFooter = Boolean(props.caption || giphyUrl);
  const isImage = media?.mimeType?.startsWith("image/");
  const { mp4Src, webmSrc } = videoSources(props, media);

  if (!(isImage || mp4Src || webmSrc)) {
    return null;
  }

  return (
    <Card className="surface-block reveal-stagger-1 gap-0 overflow-hidden py-0 content-block">
      <CardContent className={cn(hasFooter ? "p-3" : "p-0")}>
        <div className="media-frame overflow-hidden rounded-lg">
          {isImage ? (
            <Media
              imgClassName="h-auto object-cover"
              pictureClassName="mt-0 mb-0"
              resource={media ?? undefined}
            />
          ) : (
            <LazyVideo
              alt={media?.alt || "Animated GIF"}
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
      </CardContent>

      {hasFooter && (
        <CardFooter
          className="surface-caption flex-col items-start gap-1 sm:px-5 sm:py-3"
          dir="auto"
        >
          {props.caption && (
            <RichText
              className="surface-caption-text"
              content={props.caption}
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
        </CardFooter>
      )}
    </Card>
  );
}
