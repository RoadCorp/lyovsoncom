import { GridCard, GridCardSection } from "@/components/grid";
import { cn } from "@/lib/utils";

export function PlaceholderPageCard({
  className,
  description,
  eyebrow,
  note,
  title,
}: {
  className?: string;
  description: string;
  eyebrow: string;
  note: string;
  title: string;
}) {
  return (
    <GridCard
      className={cn(
        "g2:col-start-2 g2:col-end-3 g2:row-auto g2:row-start-2",
        "g3:col-start-2 g3:col-end-4 g3:w-[var(--grid-card-2x1)]",
        "aspect-auto h-auto",
        className
      )}
      interactive={false}
    >
      <GridCardSection className="col-span-3 row-span-3 flex flex-col gap-5 p-6">
        <div className="space-y-3">
          <p className="tone-muted text-xs uppercase tracking-[0.14em]">
            {eyebrow}
          </p>
          <h1 className="tone-heading font-bold text-3xl">{title}</h1>
          <p className="tone-muted max-w-2xl text-sm leading-relaxed">
            {description}
          </p>
        </div>

        <div className="surface-panel rounded-lg p-4">
          <p className="tone-heading font-medium text-sm">Placeholder page</p>
          <p className="tone-muted mt-2 text-sm leading-relaxed">{note}</p>
        </div>
      </GridCardSection>
    </GridCard>
  );
}
