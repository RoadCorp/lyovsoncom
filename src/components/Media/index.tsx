import type React from "react";
import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { ImageMedia } from "./ImageMedia";
import type { Props } from "./types";
import { VideoMedia } from "./VideoMedia";

export const Media: React.FC<Props> = (props) => {
  const { className, htmlElement = "div", resource } = props;

  const isVideo =
    typeof resource === "object" && resource?.mimeType?.includes("video");
  const Tag = htmlElement ?? Fragment;

  return (
    <Tag
      {...(htmlElement === null
        ? {}
        : {
            className: cn(className, "contents"),
          })}
    >
      {isVideo ? <VideoMedia {...props} /> : <ImageMedia {...props} />}
    </Tag>
  );
};
