"use client";

import { Check, Link2, Rss } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ApexLozenge } from "@/components/ornaments";
import { cn } from "@/lib/utils";

const COPIED_RESET_MS = 2000;

export function PostColophonActions({
  className,
  url,
}: {
  className?: string;
  url: string;
}) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setCopied(false);
      }, COPIED_RESET_MS);
    } catch {
      // Clipboard API may be unavailable in restricted contexts.
    }
  };

  return (
    <div
      className={cn(
        "type-eyebrow mt-3 flex flex-wrap items-center justify-center gap-x-2.5 gap-y-2 print:hidden",
        className
      )}
    >
      <button
        className="ui-meta-link ui-focus-ring inline-flex cursor-pointer items-center gap-1.5 px-1.5 py-0.5"
        onClick={handleCopy}
        type="button"
      >
        {copied ? (
          <Check aria-hidden="true" className="h-3.5 w-3.5" />
        ) : (
          <Link2 aria-hidden="true" className="h-3.5 w-3.5" />
        )}
        <span>{copied ? "Link copied" : "Copy link"}</span>
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? "Post link copied to clipboard." : ""}
      </span>

      <ApexLozenge className="ornament-muted opacity-65" size={7} />

      <a
        className="ui-meta-link ui-focus-ring inline-flex items-center gap-1.5 px-1 py-0.5"
        href="/feed.xml"
      >
        <Rss aria-hidden="true" className="h-3 w-3" />
        <span>RSS</span>
      </a>

      <ApexLozenge className="ornament-muted opacity-65" size={7} />

      <a
        className="ui-meta-link ui-focus-ring inline-flex items-center gap-1 px-1 py-0.5"
        href="/atom.xml"
      >
        <span>Atom</span>
      </a>

      <ApexLozenge className="ornament-muted opacity-65" size={7} />

      <a
        className="ui-meta-link ui-focus-ring inline-flex items-center gap-1 px-1 py-0.5"
        href="/feed.json"
      >
        <span>JSON</span>
      </a>
    </div>
  );
}
