import type React from "react";
import { ArchiveItems, toArchiveItems } from "@/components/archive-items";
import type { Activity } from "@/payload-types";

export interface Props {
  activities: Activity[];
}

export const ActivitiesArchive: React.FC<Props> = (props) => {
  const { activities } = props;

  return <ArchiveItems items={toArchiveItems(activities, "activity")} />;
};
