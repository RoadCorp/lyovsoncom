import { Code2 } from "lucide-react";
import { TopicPill } from "@/components/topic-pill";
import { cn } from "@/lib/utils";
import { getTechInfo, type TechInfo } from "@/utilities/tech-stack";

function TechIcon({ size, tech }: { size: "lg" | "sm"; tech: TechInfo }) {
  const iconClassName =
    size === "lg" ? "h-4 w-4 shrink-0" : "h-3.5 w-3.5 shrink-0";
  if (!tech.icon) {
    return <Code2 aria-hidden="true" className={iconClassName} />;
  }
  return (
    <svg
      aria-hidden="true"
      className={iconClassName}
      fill="currentColor"
      role="img"
      viewBox="0 0 24 24"
    >
      <path d={tech.icon.path} />
    </svg>
  );
}

/**
 * A stack entry as a topic-style pill with the tool's mark, tinted with its
 * brand hue. `linked` makes it a link to the tool's site.
 */
export function TechPill({
  className,
  linked = false,
  name,
  size = "sm",
}: {
  className?: string;
  linked?: boolean;
  name: string;
  /** `lg` fills a stack card's grid; `sm` matches a card rail's topics. */
  size?: "lg" | "sm";
}) {
  const tech = getTechInfo(name);
  const pill = (
    <TopicPill
      className={cn(
        "w-auto gap-1.5 px-2.5",
        size === "lg" && "w-full justify-start gap-2 px-3 py-2 text-xs",
        className
      )}
      color={tech.color}
    >
      <TechIcon size={size} tech={tech} />
      <span>{size === "sm" ? (tech.shortName ?? tech.name) : tech.name}</span>
    </TopicPill>
  );

  if (!(linked && tech.url)) {
    return pill;
  }

  return (
    <a
      aria-label={`${tech.name} website (opens in a new tab)`}
      className={cn(
        "ui-focus-ring ui-interactive rounded-full",
        size === "lg" && "block"
      )}
      href={tech.url}
      rel="noopener"
      target="_blank"
    >
      {pill}
    </a>
  );
}
