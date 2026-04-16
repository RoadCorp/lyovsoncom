"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

interface LazyVideoProps {
  alt?: string;
  aspectRatio?: string;
  className?: string;
  mp4Src?: string;
  poster?: string;
  webmSrc?: string;
}

/**
 * LazyVideo Component - Intersection Observer Lazy Loading
 *
 * Performance Optimizations:
 * - Uses Intersection Observer API for lazy loading
 * - Loads video sources only when scrolling near (300px margin)
 * - Supports MP4 and WebM formats with automatic fallback
 * - Autoplay + loop + muted for GIF-like behavior
 * - Poster image placeholder while loading
 *
 * Use Case:
 * - Optimized replacement for Tenor GIF embeds
 * - Converts GIF → MP4/WebM for 80-85% size reduction
 */
export const LazyVideo = ({
  mp4Src,
  webmSrc,
  poster,
  aspectRatio = "1 / 1",
  className,
  alt = "Video content",
}: LazyVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setIsLoaded(true);
          observer.disconnect();
        }
      },
      {
        rootMargin: "300px", // Start loading when 300px away from viewport
      }
    );

    observer.observe(videoElement);

    return () => observer.disconnect();
  }, []);

  return (
    <video
      aria-label={alt}
      autoPlay
      className={cn(
        "media-frame h-auto w-full rounded-lg object-cover",
        className
      )}
      loop
      muted
      playsInline
      poster={poster}
      ref={videoRef}
      style={{ aspectRatio }}
    >
      {isLoaded && (
        <>
          {webmSrc && <source src={webmSrc} type="video/webm" />}
          {mp4Src && <source src={mp4Src} type="video/mp4" />}
        </>
      )}
    </video>
  );
};
