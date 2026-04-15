import {
  GridCardActivityFull,
  GridCardNoteFull,
  GridCardPostFull,
} from "@/components/grid";
import type { Activity, Note, Post } from "@/payload-types";

export type ArchiveItem =
  | { type: "activity"; data: Activity }
  | { type: "note"; data: Note }
  | { type: "post"; data: Post };

interface ArchiveItemsProps {
  items: ArchiveItem[];
}

export function toArchiveItems(
  items: Activity[],
  type: "activity"
): ArchiveItem[];
export function toArchiveItems(items: Note[], type: "note"): ArchiveItem[];
export function toArchiveItems(items: Post[], type: "post"): ArchiveItem[];
export function toArchiveItems(
  items: Array<Activity | Note | Post>,
  type: ArchiveItem["type"]
) {
  return items.flatMap((item) =>
    typeof item === "object" && item !== null ? [{ type, data: item }] : []
  );
}

export function ArchiveItems({ items }: ArchiveItemsProps) {
  return items.map((item, index) => {
    if (item.type === "post") {
      return (
        <GridCardPostFull
          key={`post-${item.data.id}`}
          post={item.data}
          {...(index === 0 ? { priority: true } : {})}
        />
      );
    }

    if (item.type === "note") {
      return (
        <GridCardNoteFull
          key={`note-${item.data.id}`}
          note={item.data}
          {...(index === 0 ? { priority: true } : {})}
        />
      );
    }

    return (
      <GridCardActivityFull
        activity={item.data}
        key={`activity-${item.data.id}`}
        {...(index === 0 ? { priority: true } : {})}
      />
    );
  });
}
