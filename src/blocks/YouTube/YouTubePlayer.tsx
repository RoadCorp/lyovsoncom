"use client";

import Image from "next/image";
import type React from "react";
import { useState } from "react";
import { normalizeAspectRatio } from "@/utilities/aspectRatio";

const PlayButton = () => (
  <div
    aria-hidden="true"
    className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center"
  >
    <div className="relative">
      <div className="glass-play-button">
        <div className="glass-play-icon" />
      </div>
      <div className="glass-play-glow absolute inset-0 rounded-full" />
    </div>
  </div>
);

interface YouTubePlayerProps {
  aspectRatio?: string;
  videoId: string;
}

const THUMBNAIL_VARIANTS = [
  "maxresdefault",
  "hqdefault",
  "mqdefault",
  "default",
] as const;

export const YouTubePlayer: React.FC<YouTubePlayerProps> = ({
  videoId,
  aspectRatio = "16:9",
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [thumbnailVariantIndex, setThumbnailVariantIndex] = useState(0);
  const normalizedAspectRatio = normalizeAspectRatio(aspectRatio || "16:9");
  const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/${THUMBNAIL_VARIANTS[thumbnailVariantIndex]}.jpg`;

  function handleThumbnailError() {
    if (thumbnailVariantIndex >= THUMBNAIL_VARIANTS.length - 1) {
      return;
    }

    setThumbnailVariantIndex((currentIndex) => currentIndex + 1);
  }

  return (
    <div
      className="glass-media relative w-full overflow-hidden rounded-lg"
      style={{ aspectRatio: normalizedAspectRatio }}
    >
      {isLoaded ? (
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full rounded-lg"
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title="YouTube video player"
        />
      ) : (
        <button
          aria-label="Play video"
          className="glass-focus-ring glass-hover-group group relative block h-full w-full"
          onClick={() => setIsLoaded(true)}
          type="button"
        >
          <div className="glass-media-dim absolute inset-0 z-10" />

          {/* Thumbnail image */}
          <div className="absolute inset-0">
            <Image
              alt=""
              className="object-cover"
              fill
              loading="lazy"
              onError={handleThumbnailError}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
              src={thumbnailUrl}
            />
          </div>

          {/* Play button */}
          <PlayButton />
        </button>
      )}
    </div>
  );
};
