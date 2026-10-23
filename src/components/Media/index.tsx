import type React from "react";
import { Fragment } from "react";
import { cn } from "@/lib/utils";
import { extractLexicalText } from "@/utilities/extract-lexical-text";
import { ImageMedia } from "./ImageMedia";
import type { Props } from "./types";
import { VideoMedia } from "./VideoMedia";

export const Media: React.FC<Props> = (props) => {
  const { className, credit, htmlElement = "div", resource } = props;

  const isVideo =
    typeof resource === "object" && resource?.mimeType?.includes("video");
  const Tag = htmlElement ?? Fragment;
  // Commons images carry the credit their licence asks for as the caption.
  const creditText =
    credit && typeof resource === "object" && resource?.caption
      ? extractLexicalText(resource.caption)
      : "";

  return (
    <Tag
      {...(htmlElement === null
        ? {}
        : {
            className: cn("contents", className),
          })}
    >
      {isVideo ? <VideoMedia {...props} /> : <ImageMedia {...props} />}
      {creditText ? (
        <span className="pointer-events-none absolute inset-x-0 bottom-0 line-clamp-2 bg-black/60 px-2 py-1 text-[0.6875rem] text-white">
          {creditText}
        </span>
      ) : null}
    </Tag>
  );
};
