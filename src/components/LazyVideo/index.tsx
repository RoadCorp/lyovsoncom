"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/utilities/use-prefers-reduced-motion";

interface LazyVideoProps {
  alt?: string;
  aspectRatio?: string;
  className?: string;
  mp4Src?: string;
  poster?: string;
  webmSrc?: string;
}

// Attach video sources near the viewport, pause when React hides the content
// and resume when it shows it again. A video whose sources all fail gets
// data-failed, so its container can hide it.
export const LazyVideo = ({
  mp4Src,
  webmSrc,
  poster,
  aspectRatio,
  className,
  alt = "Video content",
}: LazyVideoProps) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [failed, setFailed] = useState(false);
  // GIFs are short loops; with reduced motion, show the poster and controls.
  const reduceMotion = usePrefersReducedMotion();

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
        rootMargin: "300px",
      }
    );

    observer.observe(videoElement);

    // Pausing clears the autoplay flag, so play again when React reveals it.
    if (videoElement.currentSrc && videoElement.autoplay) {
      videoElement.play().catch(() => undefined);
    }

    return () => {
      observer.disconnect();
      if (!videoElement.paused) {
        videoElement.pause();
      }
    };
  }, []);

  return (
    <video
      aria-label={alt}
      autoPlay={!reduceMotion}
      className={cn(
        "media-frame h-auto w-full rounded-lg object-cover",
        className
      )}
      controls={reduceMotion}
      data-failed={failed || undefined}
      loop
      muted
      playsInline
      poster={poster}
      // Without a poster, load the first frame once in view.
      preload={poster ? "none" : "metadata"}
      ref={videoRef}
      style={{ aspectRatio }}
    >
      {isLoaded && (
        <>
          {webmSrc && (
            <source
              onError={mp4Src ? undefined : () => setFailed(true)}
              src={webmSrc}
              type="video/webm"
            />
          )}
          {mp4Src && (
            <source
              onError={() => setFailed(true)}
              src={mp4Src}
              type="video/mp4"
            />
          )}
        </>
      )}
    </video>
  );
};
