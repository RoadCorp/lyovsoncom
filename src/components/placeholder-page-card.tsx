import type { ReactNode } from "react";
import { GridCard, GridCardSection } from "@/components/grid";
import { CornerKnots } from "@/components/ornaments";
import { cn } from "@/lib/utils";

export function PlaceholderPageCard({
  children,
  className,
  description,
  eyebrow,
  note,
  title,
}: {
  children?: ReactNode;
  className?: string;
  description: string;
  eyebrow: string;
  note: string;
  title: string;
}) {
  return (
    <GridCard
      className={cn(
        "g2:col-start-2 g2:col-end-3 g2:row-start-1 self-start",
        "g3:col-start-2 g3:col-end-4 g3:w-[var(--grid-card-2x1)]",
        "aspect-auto h-auto",
        className
      )}
      interactive={false}
    >
      <GridCardSection className="col-span-3 row-span-3 flex flex-col gap-5 p-6">
        <CornerKnots inset="sm" variant="triquetra" />
        <div className="relative z-1 space-y-3">
          <p className="tone-muted type-eyebrow">{eyebrow}</p>
          <h1 className="tone-heading text-3xl font-bold">{title}</h1>
          <p className="tone-muted max-w-2xl text-sm leading-relaxed">
            {description}
          </p>
        </div>

        <div className="surface-panel ornament-braid-rail relative z-1 rounded-lg py-4 pr-4 pl-7">
          <p className="tone-heading text-sm font-medium">Placeholder page</p>
          <p className="tone-muted mt-2 text-sm leading-relaxed">{note}</p>
        </div>

        {children}
      </GridCardSection>
    </GridCard>
  );
}
