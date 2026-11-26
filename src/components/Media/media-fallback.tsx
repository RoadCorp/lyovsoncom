import type { LucideIcon } from "lucide-react";
import { CornerKnots } from "@/components/ornaments";

interface MediaFallbackProps {
  icon: LucideIcon;
  label?: string;
}

/**
 * Decorative bookplate stand-in for content without an image, so the image cell
 * of a card or hero isn't left empty. Hidden from assistive technology.
 */
export function MediaFallback({ icon: Icon, label }: MediaFallbackProps) {
  return (
    <div
      aria-hidden="true"
      className="media-frame media-fallback flex h-full w-full flex-col items-center justify-center gap-3"
    >
      <div className="ornament-lattice" />
      <div className="media-fallback-frame" />
      <CornerKnots className="ornament-corner--subtle" inset="sm" />
      <Icon className="relative z-1 h-12 w-12" strokeWidth={1.25} />
      {label ? (
        <span className="type-eyebrow relative z-1">{label}</span>
      ) : null}
    </div>
  );
}
