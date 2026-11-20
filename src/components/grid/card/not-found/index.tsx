import { AppLink } from "@/components/app-link";
import { GridCard } from "@/components/grid/card";
import { GridCardSection } from "@/components/grid/card/section";
import { cn } from "@/lib/utils";
import { homeRoute } from "@/utilities/routes";

export function GridCardNotFound({ className }: { className?: string }) {
  return (
    <GridCard className={cn(className)}>
      <GridCardSection className="col-span-3 row-span-3 flex flex-col items-center justify-center gap-3 text-center">
        <h1 className="tone-heading text-5xl font-bold">404</h1>
        <p className="tone-muted">This page could not be found.</p>
        <AppLink
          className="ui-focus-ring rounded-sm text-sm text-[var(--accent-link)] underline underline-offset-4"
          href={homeRoute()}
        >
          Go to the homepage
        </AppLink>
      </GridCardSection>
    </GridCard>
  );
}
