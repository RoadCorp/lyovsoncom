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

// Attach video sources near the viewport and pause when React hides the content.
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
        rootMargin: "300px",
      }
    );

    observer.observe(videoElement);

    return () => {
      observer.disconnect();
      videoElement.pause();
    };
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
      preload="none"
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
