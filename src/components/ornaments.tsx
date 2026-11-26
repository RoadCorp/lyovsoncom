import { cn } from "@/lib/utils";

interface OrnamentIconProps {
  className?: string;
  size?: number;
}

/**
 * Diamond eternity knot drawn from the crest's top clasp.
 * Purely decorative — always hidden from assistive technology.
 */
export function EternityKnot({ className, size = 16 }: OrnamentIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn("ornament-glyph shrink-0", className)}
      fill="none"
      focusable="false"
      height={size}
      viewBox="0 0 24 24"
      width={size}
    >
      <path
        d="M12 2.5L21.5 12L12 21.5L2.5 12Z"
        stroke="currentColor"
        strokeLinejoin="miter"
        strokeWidth="1.75"
      />
      <path
        d="M12 6.8L17.2 12L12 17.2L6.8 12Z"
        stroke="currentColor"
        strokeLinejoin="miter"
        strokeWidth="1.65"
      />
      <path
        d="M8.5 8.5L15.5 15.5M15.5 8.5L8.5 15.5"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="1.5"
      />
    </svg>
  );
}

/**
 * Miniature diamond lozenge drawn from the crest's bottom apex clasp.
 * Used as a metadata separator, framed legend clasp, and pending indicator.
 */
export function ApexLozenge({ className, size = 10 }: OrnamentIconProps) {
  return (
    <svg
      aria-hidden="true"
      className={cn("ornament-glyph shrink-0", className)}
      fill="none"
      focusable="false"
      height={size}
      viewBox="0 0 16 16"
      width={size}
    >
      <path
        d="M8 2L14 8L8 14L2 8Z"
        stroke="currentColor"
        strokeLinejoin="miter"
        strokeWidth="1.65"
      />
      <circle cx="8" cy="8" fill="currentColor" r="1.45" />
    </svg>
  );
}

interface CornerKnotsProps {
  className?: string;
  inset?: "sm" | "md";
  variant?: "ticks" | "triquetra";
}

function CornerTriquetraSvg({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      viewBox="0 0 32 32"
    >
      <path
        d="M2 24V2H24M2 9C9 9 13 5 13 2M9 2C9 9 5 13 2 13M5.5 5.5Q12 6 10 10Q6 12 5.5 5.5Z"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.55"
      />
      <circle cx="15.5" cy="5" fill="currentColor" r="1" />
      <circle cx="5" cy="15.5" fill="currentColor" r="1" />
    </svg>
  );
}

function CornerTickSvg({ className }: { className: string }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      focusable="false"
      viewBox="0 0 16 16"
    >
      <path
        d="M2 12V2H12M2 6L6 2"
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.4"
      />
    </svg>
  );
}

const CORNER_LAYOUT = {
  ticks: {
    size: "h-3 w-3",
    tl: "top-1.5 left-1.5",
    tr: "top-1.5 right-1.5 -scale-x-100",
    bl: "bottom-1.5 left-1.5 -scale-y-100",
    br: "right-1.5 bottom-1.5 -scale-100",
  },
  triquetraSm: {
    size: "h-[18px] w-[18px]",
    tl: "top-2 left-2",
    tr: "top-2 right-2 -scale-x-100",
    bl: "bottom-2 left-2 -scale-y-100",
    br: "right-2 bottom-2 -scale-100",
  },
  triquetraMd: {
    size: "h-[22px] w-[22px]",
    tl: "top-2.5 left-2.5",
    tr: "top-2.5 right-2.5 -scale-x-100",
    bl: "bottom-2.5 left-2.5 -scale-y-100",
    br: "right-2.5 bottom-2.5 -scale-100",
  },
} as const;

/**
 * Four mirrored corner brackets anchored to a `relative` parent container.
 * Use `triquetra` on stage/bookplate cards and `ticks` on compact tiles.
 */
export function CornerKnots({
  className,
  inset = "md",
  variant = "triquetra",
}: CornerKnotsProps) {
  const isTicks = variant === "ticks";
  let layoutKey: keyof typeof CORNER_LAYOUT = "triquetraMd";
  if (isTicks) {
    layoutKey = "ticks";
  } else if (inset === "sm") {
    layoutKey = "triquetraSm";
  }

  const layout = CORNER_LAYOUT[layoutKey];
  const base = cn(
    "ornament-corner pointer-events-none absolute",
    layout.size,
    className
  );
  const Glyph = isTicks ? CornerTickSvg : CornerTriquetraSvg;

  return (
    <>
      <Glyph className={cn(base, layout.tl)} />
      <Glyph className={cn(base, layout.tr)} />
      <Glyph className={cn(base, layout.bl)} />
      <Glyph className={cn(base, layout.br)} />
    </>
  );
}

interface FleuronRuleProps {
  className?: string;
  variant?: "finis" | "knot" | "lozenge";
}

/**
 * Engraved hairline rule centered with a crest knot or lozenge.
 * - `lozenge`: compact plaque rule (stat cells, short dividers)
 * - `knot`: section & profile divider
 * - `finis`: end-of-essay literary colophon (◇ ❖ ◇)
 */
export function FleuronRule({ className, variant = "knot" }: FleuronRuleProps) {
  if (variant === "lozenge") {
    return (
      <div
        aria-hidden="true"
        className={cn("ornament-rule ornament-rule--compact", className)}
      >
        <span className="ornament-rule-wing" />
        <ApexLozenge className="ornament-accent" size={9} />
        <span className="ornament-rule-wing ornament-rule-wing--right" />
      </div>
    );
  }

  if (variant === "finis") {
    return (
      <div
        aria-hidden="true"
        className={cn("ornament-rule ornament-rule--finis", className)}
      >
        <span className="ornament-rule-wing" />
        <ApexLozenge className="ornament-muted" size={10} />
        <EternityKnot className="ornament-accent" size={18} />
        <ApexLozenge className="ornament-muted" size={10} />
        <span className="ornament-rule-wing ornament-rule-wing--right" />
      </div>
    );
  }

  return (
    <div aria-hidden="true" className={cn("ornament-rule", className)}>
      <span className="ornament-rule-wing" />
      <EternityKnot className="ornament-accent" size={14} />
      <span className="ornament-rule-wing ornament-rule-wing--right" />
    </div>
  );
}
