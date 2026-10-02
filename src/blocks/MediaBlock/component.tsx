import type { StaticImageData } from "next/image";
import { Media } from "@/components/Media";
import RichText from "@/components/RichText";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { MediaBlock as MediaBlockProps } from "@/payload-types";

type Props = MediaBlockProps & {
  breakout?: boolean;
  captionClassName?: string;
  className?: string;
  enableGutter?: boolean;
  imgClassName?: string;
  staticImage?: StaticImageData;
  disableInnerContainer?: boolean;
};

export function MediaBlock(props: Props) {
  const { captionClassName, className, imgClassName, media, staticImage } =
    props;

  let caption: {
    root: {
      type: string;
      children: unknown[];
    };
  } | null = null;
  if (media && typeof media === "object") {
    caption = media.caption || null;
  }
  const hasCaption = Boolean(caption);

  return (
    <Card
      className={cn(
        "surface-block reveal-stagger-1 gap-0 overflow-hidden py-0 content-block",
        className
      )}
    >
      <CardContent className={cn(hasCaption ? "p-3" : "p-0")}>
        <Media
          className="media-frame flex h-full items-center justify-center"
          imgClassName={cn(
            "h-full object-cover",
            hasCaption && "rounded-lg",
            imgClassName
          )}
          pictureClassName="mt-0 mb-0"
          resource={media}
          src={staticImage}
        />
      </CardContent>
      {caption && (
        <CardFooter className="surface-caption sm:px-5 sm:py-3" dir="auto">
          <RichText
            className={cn("surface-caption-text", captionClassName)}
            content={caption}
            enableGutter={false}
            enableProse={false}
          />
        </CardFooter>
      )}
    </Card>
  );
}
