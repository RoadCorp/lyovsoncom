import RichText from "@/components/RichText";
import { cn } from "@/lib/utils";
import type { BannerBlock as BannerBlockProps } from "@/payload-types";

type Props = {
  className?: string;
} & BannerBlockProps;

export function BannerBlock({ className, content, style }: Props) {
  const bannerStyle = style || "info";
  const styleClasses = {
    info: "glass-alert-info",
    error: "glass-alert-error",
    success: "glass-alert-success",
    warning: "glass-alert-warning",
  };

  const accentClasses = {
    info: "glass-semantic-info",
    error: "glass-semantic-error",
    success: "glass-semantic-success",
    warning: "glass-semantic-warning",
  };

  const iconClasses = {
    info: "💡",
    error: "⚠️",
    success: "✅",
    warning: "⚡",
  };

  return (
    <div className={cn("glass-longform-block mx-auto w-full", className)}>
      <div
        className={cn(
          "glass-section glass-alert glass-interactive flex items-start gap-3 rounded-xl px-5 py-5 sm:gap-4 sm:px-6",
          styleClasses[bannerStyle]
        )}
      >
        {/* Icon indicator */}
        <div
          className={cn(
            "glass-badge mt-1 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
            accentClasses[bannerStyle]
          )}
        >
          <span className="text-lg">{iconClasses[bannerStyle]}</span>
        </div>

        {/* Content */}
        <div className="glass-text min-w-0 flex-1" dir="auto">
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
