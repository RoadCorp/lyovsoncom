import type { ReactNode } from "react";
import { AppLink } from "@/components/AppLink";
import { cn } from "@/lib/utils";
import { topicRoute } from "@/utilities/routes";

interface TopicPillProps {
  children: ReactNode;
  className?: string;
}

export function TopicPill({ children, className }: TopicPillProps) {
  return (
    <span
      className={cn(
        "surface-chip topic-pill tone-heading flex w-full items-center justify-center",
        className
      )}
    >
      {children}
    </span>
  );
}

interface TopicLinkData {
  id: number | string;
  name?: string | null;
  slug?: string | null;
}

interface TopicPillListProps {
  /** Where the "+N" pill leads (the item's page); plain text when omitted. */
  allTopicsHref?: string;
  /** Used in link labels: "View posts about …". */
  itemLabel: "notes" | "posts";
  /** A card's topic well fits three pills at the minimum touch-target size. */
  max?: number;
  topics: TopicLinkData[];
}

const DEFAULT_MAX_TOPICS = 3;

export function TopicPillList({
  allTopicsHref,
  itemLabel,
  max = DEFAULT_MAX_TOPICS,
  topics,
}: TopicPillListProps) {
  const linkable = topics.filter(
    (topic): topic is TopicLinkData & { slug: string } => Boolean(topic.slug)
  );
  // Leave room for the "+N" pill instead of clipping a fourth topic.
  const visible = linkable.length > max ? linkable.slice(0, max - 1) : linkable;
  const hiddenCount = linkable.length - visible.length;

  return (
    <>
      {visible.map((topic) => (
        <AppLink
          aria-label={`View ${itemLabel} about ${topic.name}`}
          className="w-full"
          href={topicRoute(topic.slug)}
          key={topic.id}
          prefetch={false}
        >
          <TopicPill>{topic.name}</TopicPill>
        </AppLink>
      ))}
      {hiddenCount > 0 && allTopicsHref ? (
        <AppLink
          aria-label={`${hiddenCount} more topics`}
          className="w-full"
          href={allTopicsHref}
          prefetch={false}
        >
          <TopicPill>+{hiddenCount}</TopicPill>
        </AppLink>
      ) : null}
      {hiddenCount > 0 && !allTopicsHref ? (
        <TopicPill>
          <span aria-hidden="true">+{hiddenCount}</span>
          <span className="sr-only">
            Also about{" "}
            {linkable
              .slice(visible.length)
              .map((topic) => topic.name)
              .join(", ")}
          </span>
        </TopicPill>
      ) : null}
    </>
  );
}
