import type { LucideIcon } from "lucide-react";

interface MediaFallbackProps {
  icon: LucideIcon;
  label?: string;
}

/**
 * Decorative stand-in for content without an image, so the image cell of a
 * card or hero isn't left empty. Hidden from assistive technology.
 */
export function MediaFallback({ icon: Icon, label }: MediaFallbackProps) {
  return (
    <div
      aria-hidden="true"
      className="media-frame media-fallback flex h-full w-full flex-col items-center justify-center gap-3"
    >
      <Icon className="h-12 w-12" strokeWidth={1.25} />
      {label ? (
        <span className="font-mono text-[0.6875rem] uppercase tracking-[0.16em]">
          {label}
        </span>
      ) : null}
    </div>
  );
}
