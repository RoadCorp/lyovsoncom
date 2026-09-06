"use client";
import type React from "react";
import { useLayoutEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import type { Props as MediaProps } from "../types";

export const VideoMedia: React.FC<MediaProps> = ({
  onClick,
  resource,
  videoClassName,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  useLayoutEffect(() => {
    const video = videoRef.current;
    return () => video?.pause();
  }, []);
  if (!(resource && typeof resource === "object" && resource.filename)) {
    return null;
  }

  return (
    <video
      autoPlay={true}
      className={cn(videoClassName)}
      controls={false}
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
