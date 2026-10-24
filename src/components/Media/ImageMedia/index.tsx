import type { StaticImageData } from "next/image";
import NextImage from "next/image";
import type React from "react";
import { cn } from "@/lib/utils";
import type { Props as MediaProps } from "../types";

const GRID_IMAGE_SIZES =
  "(min-width: 1260px) 816px, (min-width: 840px) 400px, 100vw";

export const ImageMedia: React.FC<MediaProps> = (props) => {
  const {
    alt: altFromProps,
    fill,
    imgClassName,
    priority,
    resource,
    size: sizeFromProps,
    src: srcFromProps,
    loading: loadingFromProps,
    pictureClassName,
  } = props;

  let width: number | undefined;
  let height: number | undefined;
  let alt = altFromProps;
  let src: StaticImageData | string = srcFromProps || "";

  if (!src && resource && typeof resource === "object") {
    const {
      alt: altFromResource,
      height: fullHeight,
      url,
      width: fullWidth,
    } = resource;

    width = fullWidth || 0;
    height = fullHeight || 0;
    alt = altFromProps || altFromResource || "";

    src = url || "";
  }

  // Default sizes match the fixed grid matrix (1x1 and 2x1 surfaces).
  // Callers can still override with the `size` prop for special cases.
  const sizes = sizeFromProps || GRID_IMAGE_SIZES;

  return (
    <picture
      className={cn(
        pictureClassName,
        "col-span-1 col-start-1 row-span-1 row-start-1",
        "h-full w-full"
      )}
    >
      <NextImage
        alt={alt || ""}
        className={cn(imgClassName, "h-full w-full")}
        fetchPriority={priority ? "high" : "auto"}
        fill={fill}
        height={fill ? undefined : height}
        loading={priority ? "eager" : loadingFromProps || "lazy"}
        quality={80}
        sizes={sizes}
        src={src}
        style={{ objectFit: "cover" }}
        width={fill ? undefined : width}
      />
    </picture>
  );
};
