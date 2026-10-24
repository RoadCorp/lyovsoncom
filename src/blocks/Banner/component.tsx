import { CircleCheck, Info, OctagonAlert, TriangleAlert } from "lucide-react";
import RichText from "@/components/RichText";
import { cn } from "@/lib/utils";
import type { BannerBlock as BannerBlockProps } from "@/payload-types";

type Props = {
  className?: string;
} & BannerBlockProps;

export function BannerBlock({ className, content, style }: Props) {
  const bannerStyle = style || "info";
  const styleClasses = {
    info: "surface-alert-info",
    error: "surface-alert-error",
    success: "surface-alert-success",
    warning: "surface-alert-warning",
  };

  const accentClasses = {
    info: "state-info",
    error: "state-error",
    success: "state-success",
    warning: "state-warning",
  };

  const icons = {
    info: Info,
    error: OctagonAlert,
    success: CircleCheck,
    warning: TriangleAlert,
  };
  const Icon = icons[bannerStyle];

  return (
    <div className={cn("mx-auto w-full content-block", className)}>
      <div
        className={cn(
          "surface-panel surface-alert flex items-start gap-3 rounded-xl px-5 py-5 sm:gap-4 sm:px-6",
          styleClasses[bannerStyle]
        )}
      >
        {/* Icon indicator */}
        <div
          className={cn(
            "surface-chip surface-alert-icon mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
            accentClasses[bannerStyle]
          )}
        >
          <Icon aria-hidden="true" className="h-4 w-4" />
        </div>

        {/* Content */}
        <div className="tone-body min-w-0 flex-1" dir="auto">
          <RichText
            className="text-sm leading-relaxed sm:text-base"
            content={content}
            enableGutter={false}
            enableProse={false}
          />
        </div>
      </div>
    </div>
  );
}
