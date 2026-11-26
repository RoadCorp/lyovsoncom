"use client";

import { useEffect, useState } from "react";
import { ApexLozenge } from "@/components/ornaments";
import { cn } from "@/lib/utils";
import type { LexicalHeading } from "@/utilities/extract-lexical-headings";

export function TableOfContentsList({
  headings,
}: {
  headings: LexicalHeading[];
}) {
  const [activeId, setActiveId] = useState<string>(headings[0]?.id ?? "");

  useEffect(() => {
    const elements = headings
      .map((heading) =>
        document.querySelector<HTMLElement>(`#${CSS.escape(heading.id)}`)
      )
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    const visibleIds = new Set<string>();
    const headingOrder = new Map(
      headings.map((heading, index) => [heading.id, index])
    );

    const pickActive = () => {
      if (visibleIds.size > 0) {
        const firstVisible = [...visibleIds].sort(
          (a, b) => (headingOrder.get(a) ?? 0) - (headingOrder.get(b) ?? 0)
        )[0];
        if (firstVisible) {
          setActiveId(firstVisible);
        }
        return;
      }

      // When scrolling between headings, highlight the last heading scrolled past.
      let passedId = elements[0]?.id ?? "";
      for (const element of elements) {
        if (element.getBoundingClientRect().top <= 140) {
          passedId = element.id;
        }
      }
      if (passedId) {
        setActiveId(passedId);
      }
    };

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id);
          } else {
            visibleIds.delete(entry.target.id);
          }
        }
        pickActive();
      },
      {
        rootMargin: "-12% 0px -70% 0px",
        threshold: 0,
      }
    );

    for (const element of elements) {
      observer.observe(element);
    }

    return () => {
      observer.disconnect();
    };
  }, [headings]);

  return (
    <ol className="relative z-1 flex flex-col gap-2">
      {headings.map((heading) => {
        const isActive = activeId === heading.id;

        return (
          <li className={cn(heading.level === 3 && "pl-4")} key={heading.id}>
            <a
              aria-current={isActive ? "location" : undefined}
              className={cn(
                "ui-focus-ring ui-meta-link items-start gap-2.5 leading-snug",
                heading.level === 2
                  ? "tone-heading text-sm font-medium"
                  : "tone-muted text-xs",
                isActive && "toc-link--active"
              )}
              href={`#${heading.id}`}
            >
              {heading.level === 2 ? (
                <ApexLozenge
                  className={cn(
                    "ornament-accent mt-1.5 shrink-0 transition-opacity",
                    isActive ? "opacity-100" : "opacity-55"
                  )}
                  size={8}
                />
              ) : (
                <span
                  aria-hidden="true"
                  className={cn(
                    "mt-1.5 inline-block h-px w-2 shrink-0 bg-current transition-opacity",
                    isActive
                      ? "ornament-accent opacity-100"
                      : "ornament-muted opacity-70"
                  )}
                />
              )}
              <span className="min-w-0 break-words">{heading.text}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}
