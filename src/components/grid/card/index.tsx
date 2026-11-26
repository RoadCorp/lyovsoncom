import type {
  AriaRole,
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactNode,
} from "react";
import type { GridSlot } from "@/components/grid/layout";
import { GRID_SLOTS } from "@/components/grid/layout";
import { ApexLozenge } from "@/components/ornaments";
import { cn } from "@/lib/utils";

interface GridCardBaseProps<T extends ElementType> {
  as?: T;
  children: ReactNode;
  className?: string;
  /** Override internal grid column count (`--grid-internal-cols`). */
  cols?: number;
  frameLabel?: ReactNode;
  interactive?: boolean;
  role?: AriaRole;
  /** Override internal grid row count (`--grid-internal-rows`). */
  rows?: number;
  /** Canonical responsive grid placement slot from `GRID_SLOTS`. */
  slot?: GridSlot;
  style?: CSSProperties;
  variant?: "default" | "content";
}

type GridCardProps<T extends ElementType> = GridCardBaseProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof GridCardBaseProps<T>>;

function resolveCardStyle(
  cols: number | undefined,
  rows: number | undefined,
  style: CSSProperties | undefined
): CSSProperties | undefined {
  if (cols === undefined && rows === undefined && style === undefined) {
    return undefined;
  }

  return {
    ...(cols === undefined
      ? undefined
      : ({ "--grid-internal-cols": cols } as CSSProperties)),
    ...(rows === undefined
      ? undefined
      : ({ "--grid-internal-rows": rows } as CSSProperties)),
    ...style,
  };
}

export const GridCard = <T extends ElementType = "div">({
  as,
  children,
  className,
  cols,
  frameLabel,
  interactive = false,
  role,
  rows,
  slot,
  style,
  variant = "default",
  ...rest
}: GridCardProps<T>) => {
  const Component = (as ?? "div") as ElementType;
  const resolvedStyle = resolveCardStyle(cols, rows, style);

  const cardClassName = cn(
    "surface-card grid-card rounded-xl",
    variant === "default" ? "grid-card--default" : "grid-card--content",
    frameLabel && "surface-card-framed",
    interactive && "ui-interactive",
    slot && GRID_SLOTS[slot],
    className
  );

  return (
    <Component
      className={cardClassName}
      role={role}
      style={resolvedStyle}
      {...(rest as ComponentPropsWithoutRef<T>)}
    >
      {frameLabel ? (
        <div className="surface-card-legend">
          <ApexLozenge className="ornament-accent opacity-75" size={9} />
          <span className="min-w-0 truncate">{frameLabel}</span>
          <ApexLozenge className="ornament-accent opacity-75" size={9} />
        </div>
      ) : null}
      {children}
    </Component>
  );
};
