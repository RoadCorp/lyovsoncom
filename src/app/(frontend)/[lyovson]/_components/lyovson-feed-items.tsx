import { ArchiveItems } from "@/components/ArchiveItems";
import type { LyovsonMixedFeedItem } from "@/utilities/get-lyovson-feed";

interface LyovsonFeedItemsProps {
  items: LyovsonMixedFeedItem[];
}

export function LyovsonFeedItems({ items }: LyovsonFeedItemsProps) {
  return <ArchiveItems items={items} />;
}
