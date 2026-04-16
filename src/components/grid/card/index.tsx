import type {
  AriaRole,
  ComponentPropsWithoutRef,
  CSSProperties,
  ElementType,
  ReactNode,
} from "react";

import { cn } from "@/lib/utils";

interface GridCardBaseProps<T extends ElementType> {
  as?: T;
  children: ReactNode;
  className?: string;
  frameLabel?: ReactNode;
  interactive?: boolean;
  role?: AriaRole;
  style?: CSSProperties;
  variant?: "default" | "content";
}

type GridCardProps<T extends ElementType> = GridCardBaseProps<T> &
  Omit<ComponentPropsWithoutRef<T>, keyof GridCardBaseProps<T>>;

export const GridCard = <T extends ElementType = "div">({
  as,
  children,
  className,
  frameLabel,
  interactive = false,
  role,
  style,
  variant = "default",
  ...rest
}: GridCardProps<T>) => {
  const Component = (as ?? "div") as ElementType;

  const baseStyle: CSSProperties =
    variant === "default"
      ? {
          minHeight: "var(--grid-card-size)",
          gridTemplateColumns:
            "repeat(var(--grid-internal-cols), minmax(0, 1fr))",
          gridTemplateRows: "repeat(var(--grid-internal-rows), minmax(0, 1fr))",
        }
      : {};

  const cardClassName = cn(
    "surface-card rounded-xl",
    "grid gap-[var(--grid-section-gap)] p-[var(--grid-frame-padding)]",
    frameLabel && "surface-card-framed",
    variant === "default" ? "aspect-square" : "auto-rows-auto grid-cols-1",
    interactive && "ui-interactive",
    className
  );

  return (
    <Component
      className={cardClassName}
      role={role ?? (Component === "div" ? "article" : undefined)}
      style={{ ...baseStyle, ...style }}
      {...(rest as ComponentPropsWithoutRef<T>)}
    >
      {frameLabel ? (
        <div className="surface-card-legend">{frameLabel}</div>
      ) : null}
      {children}
    </Component>
  );
};

export const GridCardContent = ({
  children,
  className,
  interactive,
  role,
  style,
  ...props
}: Omit<GridCardProps<"article">, "variant" | "as">) => {
  return (
    <GridCard
      as="article"
      className={cn("p-6", className)}
      interactive={interactive}
      role={role}
      style={style}
      variant="content"
      {...props}
    >
      {children}
    </GridCard>
  );
};
