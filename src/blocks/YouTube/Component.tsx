import RichText from "@/components/RichText";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { YouTubeBlock as YouTubeBlockType } from "@/payload-types";
import { YouTubePlayer } from "./YouTubePlayer";

/**
 * YouTube Block - Optimized Facade Pattern Implementation
 *
 * Performance Optimizations:
 * - Uses facade pattern (click-to-load) to defer YouTube iframe loading
 * - Shows lightweight thumbnail image until user interaction
 * - Eliminates ~1.5 MB YouTube player JavaScript on initial page load
 * - Only loads iframe when user clicks play button
 * - Uses the site's solid-surface media treatment with a custom play overlay
 * - Supports flexible CSS aspect ratios (for example "16:9", "4:3", "1:1")
 *
 * Note: This implementation is equivalent to @next/third-parties/YouTubeEmbed
 * but includes custom styling and caption support specific to this design system.
 */

export function YouTubeBlock({
  videoId,
  caption,
  aspectRatio = "16:9",
}: YouTubeBlockType) {
  if (!videoId) {
    return null;
  }

  return (
    <Card className="surface-block reveal-stagger-1 gap-0 overflow-hidden py-0 content-block">
      <CardContent className={cn(caption ? "p-3" : "p-0")}>
        <YouTubePlayer
          aspectRatio={aspectRatio || undefined}
          videoId={videoId}
        />
      </CardContent>

      {caption && (
        <CardFooter className="surface-caption sm:px-5 sm:py-3" dir="auto">
          <RichText
            className="surface-caption-text"
            content={caption}
            enableGutter={false}
            enableProse={false}
          />
        </CardFooter>
      )}
    </Card>
  );
}
