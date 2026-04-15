import type React from "react";
import { cn } from "@/lib/utils";
import type { Props as MediaProps } from "../types";

export const VideoMedia: React.FC<MediaProps> = ({
  onClick,
  resource,
  videoClassName,
}) => {
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
    >
      <source src={`/media/${resource.filename}`} />
    </video>
  );
};
