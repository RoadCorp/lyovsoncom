"use client";
import { Copy } from "lucide-react";
import { useLayoutEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

const COPY_STATUS_DURATION = 1500;
export function CopyButton({ code }: { code: string }) {
  const [text, setText] = useState("Copy code");
  const timeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = useRef(false);
  const requestVersion = useRef(0);
  useLayoutEffect(() => {
    active.current = true;
    return () => {
      active.current = false;
      requestVersion.current += 1;
      if (timeout.current) {
        clearTimeout(timeout.current);
      }
      setText("Copy code");
    };
  }, []);
  async function copy() {
    requestVersion.current += 1;
    const version = requestVersion.current;
    try {
      await navigator.clipboard.writeText(code);
      if (!active.current || version !== requestVersion.current) {
        return;
      }
      setText("Copied!");
    } catch {
      if (!active.current || version !== requestVersion.current) {
        return;
      }
      setText("Copy failed. Select the code to copy.");
    }
    if (timeout.current) {
      clearTimeout(timeout.current);
    }
    timeout.current = setTimeout(
      () => setText("Copy code"),
      COPY_STATUS_DURATION
    );
  }
  return (
    <div className="absolute top-3 right-3">
      <Button
        aria-label={text}
        className="surface-chip surface-code-chip ui-copy-button ui-focus-ring ui-hover-dim ui-interactive flex gap-2 px-2 py-1 font-medium text-xs"
        onClick={copy}
        size="sm"
        type="button"
        variant="ghost"
      >
        <Copy aria-hidden="true" className="h-4 w-4" />
      </Button>
      <span className="sr-only" role="status">
        {text === "Copy code" ? "" : text}
      </span>
    </div>
  );
}
