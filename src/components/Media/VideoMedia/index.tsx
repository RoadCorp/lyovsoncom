"use client";
import type React from "react";
import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { usePrefersReducedMotion } from "@/utilities/use-prefers-reduced-motion";
import type { Props as MediaProps } from "../types";

export const VideoMedia: React.FC<MediaProps> = ({
  onClick,
  resource,
  videoClassName,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduceMotion = usePrefersReducedMotion();
  useLayoutEffect(() => {
    const video = videoRef.current;
    // Server markup autoplays; stop it once we know motion should be reduced.
    if (reduceMotion) {
      video?.pause();
    }
    return () => video?.pause();
  }, [reduceMotion]);
  if (!(resource && typeof resource === "object" && resource.filename)) {
    return null;
  }

  return (
    <video
      autoPlay={!reduceMotion}
      className={cn(videoClassName)}
      controls={reduceMotion}
      loop={true}
      muted={true}
      onClick={onClick}
      playsInline={true}
      preload="none"
      ref={videoRef}
    >
      <source src={resource.url || `/media/${resource.filename}`} />
    </video>
  );
};
