import { GridCard } from "@/components/grid/card";
import { getActivityTypeIcon } from "@/components/grid/card/activity/shared";
import { GridCardSection } from "@/components/grid/card/section";
import { IntentLink } from "@/components/intent-link";
import { ActivitySeal, CornerKnots } from "@/components/ornaments";
import { cn } from "@/lib/utils";
import type { ActivityFilterType } from "@/utilities/activity-type";
import {
  ACTIVITY_FILTER_SHORT_LABELS,
  ACTIVITY_FILTER_TYPES,
} from "@/utilities/activity-type";
import type { ActivityTypeCounts } from "@/utilities/get-activity";
import {
  activitiesRoute,
  activitiesTypeRoute,
  transitionTypes,
} from "@/utilities/routes";

export interface GridCardActivityLedgerProps {
  activeType?: ActivityFilterType | null;
  baseHref?: string;
  className?: string;
  counts: ActivityTypeCounts;
  getTypeHref?: (type: ActivityFilterType) => string;
}

export const GridCardActivityLedger = ({
  activeType = null,
  baseHref = activitiesRoute(),
  className,
  counts,
  getTypeHref = activitiesTypeRoute,
}: GridCardActivityLedgerProps) => {
  return (
    <GridCard
      aria-label="Filter activities by type"
      as="nav"
      className={cn(
        "[--grid-internal-cols:2] [--grid-internal-rows:2]",
        className
      )}
      frameLabel={activeType ? "Ledger · Filtered" : "Ledger"}
    >
      {ACTIVITY_FILTER_TYPES.map((type) => {
        const Icon = getActivityTypeIcon(type);
        const label = ACTIVITY_FILTER_SHORT_LABELS[type];
        const count = counts[type] ?? 0;
        const isActive = activeType === type;
        const isEmpty = count === 0 && !isActive;
        const href = isActive ? baseHref : getTypeHref(type);

        return (
          <GridCardSection
            className={cn(
              "activity-seal-panel group ui-interactive relative flex items-center justify-center",
              isActive && "activity-seal-panel--active",
              isEmpty && "activity-seal-panel--empty"
            )}
            data-activity-type={type}
            flush={true}
            key={type}
          >
            <div className="ornament-lattice" />
            <CornerKnots
              className={isActive ? "ornament-corner" : "ornament-corner--rest"}
              variant="ticks"
            />
            <IntentLink
              aria-current={isActive ? "page" : undefined}
              aria-label={
                isActive
                  ? `Showing ${label} (${count}). Click to show all activities`
                  : `Filter by ${label} (${count})`
              }
              className="ui-focus-ring relative z-1 flex h-full w-full items-center justify-center p-3"
              href={href}
              transitionTypes={[transitionTypes.section]}
            >
              <ActivitySeal
                activityType={type}
                icon={<Icon aria-hidden="true" className="h-5 w-5" />}
                label={label}
                sublabel={isActive ? `${count} · All` : String(count)}
              />
            </IntentLink>
          </GridCardSection>
        );
      })}
    </GridCard>
  );
};
