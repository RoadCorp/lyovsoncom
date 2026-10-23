import type { StaticImageData } from "next/image";
import type { ElementType, Ref } from "react";

import type { Media as MediaType } from "@/payload-types";

export interface Props {
  alt?: string;
  className?: string;
  /** Overlay the resource's caption, for images whose licence asks for credit. */
  credit?: boolean;
  fill?: boolean; // for NextImage only
  htmlElement?: ElementType | null;
  imgClassName?: string;
  loading?: "lazy" | "eager"; // for NextImage only
  onClick?: () => void;
  onLoad?: () => void;
  pictureClassName?: string;
  priority?: boolean; // for NextImage only
  ref?: Ref<HTMLImageElement | HTMLVideoElement | null>;
  resource?: MediaType | string | number; // for Payload media
  size?: string; // for NextImage only
  src?: StaticImageData; // for static media
  videoClassName?: string;
}
