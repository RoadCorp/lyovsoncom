import { ArchiveItems } from "@/components/archive-items";
import type { LyovsonMixedFeedItem } from "@/utilities/get-lyovson-feed";

interface LyovsonFeedItemsProps {
  items: LyovsonMixedFeedItem[];
}

export function LyovsonFeedItems({ items }: LyovsonFeedItemsProps) {
  return <ArchiveItems items={items} />;
}
