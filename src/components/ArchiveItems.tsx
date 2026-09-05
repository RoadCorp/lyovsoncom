import { ViewTransition } from "react";
import {
  GridCardActivityFull,
  GridCardNoteFull,
  GridCardPostFull,
} from "@/components/grid";
import type { Activity, Note } from "@/payload-types";
import type { PostSummary } from "@/utilities/post-summary";
import {
  frontendViewTransitionClasses,
  getArchiveCardTransitionName,
} from "@/utilities/view-transitions";

export type ArchiveItem =
  | { type: "activity"; data: Activity }
  | { type: "note"; data: Note }
  | { type: "post"; data: PostSummary };

interface ArchiveItemsProps {
  items: ArchiveItem[];
}

export function toArchiveItems(
  items: Activity[],
  type: "activity"
): ArchiveItem[];
export function toArchiveItems(items: Note[], type: "note"): ArchiveItem[];
export function toArchiveItems(
  items: PostSummary[],
  type: "post"
): ArchiveItem[];
export function toArchiveItems(
  items: Array<Activity | Note | PostSummary>,
  type: ArchiveItem["type"]
) {
  return items.flatMap((item) =>
    typeof item === "object" && item !== null ? [{ type, data: item }] : []
  );
}

function ArchiveCard({
  item,
  priority,
}: {
  item: ArchiveItem;
  priority: boolean;
}) {
  switch (item.type) {
    case "post":
      return <GridCardPostFull post={item.data} priority={priority} />;
    case "note":
      return <GridCardNoteFull note={item.data} priority={priority} />;
    case "activity":
      return <GridCardActivityFull activity={item.data} priority={priority} />;
    default:
      return null;
  }
}

export function ArchiveItems({ items }: ArchiveItemsProps) {
  return items.map((item, index) => (
    <ViewTransition
      key={`${item.type}-${item.data.id}`}
      name={getArchiveCardTransitionName(item.type, item.data.id)}
      {...frontendViewTransitionClasses.archiveCard}
    >
      <ArchiveCard item={item} priority={index === 0} />
    </ViewTransition>
  ));
}
