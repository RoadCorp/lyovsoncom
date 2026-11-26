import { BookOpen, FileText, Rss } from "lucide-react";
import { cn } from "@/lib/utils";

export function FeedLinksGrid({
  className,
  jsonLabel = "JSON Feed",
}: {
  className?: string;
  jsonLabel?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-2", className)}>
      <a
        className="surface-row ui-interactive ui-focus-ring type-eyebrow flex items-center gap-2 px-3 py-2"
        href="/feed.xml"
      >
        <Rss aria-hidden="true" className="h-3.5 w-3.5" />
        <span>RSS</span>
      </a>
      <a
        className="surface-row ui-interactive ui-focus-ring type-eyebrow flex items-center gap-2 px-3 py-2"
        href="/atom.xml"
      >
        <Rss aria-hidden="true" className="h-3.5 w-3.5" />
        <span>Atom</span>
      </a>
      <a
        className="surface-row ui-interactive ui-focus-ring type-eyebrow flex items-center gap-2 px-3 py-2"
        href="/feed.json"
      >
        <FileText aria-hidden="true" className="h-3.5 w-3.5" />
        <span>{jsonLabel}</span>
      </a>
      <a
        className="surface-row ui-interactive ui-focus-ring type-eyebrow flex items-center gap-2 px-3 py-2"
        href="/llms.txt"
      >
        <BookOpen aria-hidden="true" className="h-3.5 w-3.5" />
        <span>llms.txt</span>
      </a>
    </div>
  );
}
