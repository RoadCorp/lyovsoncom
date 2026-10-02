import { AppLink } from "@/components/app-link";
import { GridCard, GridCardSection } from "@/components/grid";
import { cn } from "@/lib/utils";
import { homeRoute } from "@/utilities/routes";

export function GridCardNotFound({ className }: { className?: string }) {
  return (
    <GridCard className={cn(className)}>
      <GridCardSection className="col-span-3 row-span-3 flex flex-col items-center justify-center gap-3 text-center">
        <h1 className="tone-heading font-bold text-5xl">404</h1>
        <p className="tone-muted">This page could not be found.</p>
        <AppLink
          className="ui-focus-ring rounded-sm text-[var(--accent-link)] text-sm underline underline-offset-4"
          href={homeRoute()}
        >
          Go to the homepage
        </AppLink>
      </GridCardSection>
    </GridCard>
  );
}
