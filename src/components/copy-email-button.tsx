"use client";

import { Check, Copy } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

const COPIED_RESET_MS = 2000;

export function CopyEmailButton({
  className,
  email,
}: {
  className?: string;
  email: string;
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
      await navigator.clipboard.writeText(email);
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
    <>
      <button
        className={cn(
          "ui-action-button ui-focus-ring cursor-pointer",
          className
        )}
        onClick={handleCopy}
        type="button"
      >
        {copied ? (
          <Check aria-hidden="true" className="h-4 w-4" />
        ) : (
          <Copy aria-hidden="true" className="h-4 w-4" />
        )}
        <span>{copied ? "Copied" : "Copy address"}</span>
      </button>
      <span aria-live="polite" className="sr-only">
        {copied ? `${email} copied to clipboard.` : ""}
      </span>
    </>
  );
}
