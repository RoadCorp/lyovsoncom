import type React from "react";
import { ArchiveItems } from "@/components/ArchiveItems";
import type { Activity } from "@/payload-types";

export interface Props {
  activities: Activity[];
}

export const ActivitiesArchive: React.FC<Props> = (props) => {
  const { activities } = props;

  return (
    <ArchiveItems
      items={activities.flatMap((activity) =>
        typeof activity === "object" && activity !== null
          ? [{ type: "activity" as const, data: activity }]
          : []
      )}
    />
  );
};
