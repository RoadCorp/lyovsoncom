"use client";
import { CopyIcon } from "@payloadcms/ui/icons/Copy";
import { useState } from "react";

import { Button } from "@/components/ui/button";

export function CopyButton({ code }: { code: string }) {
  const [text, setText] = useState("Copy");
  const updateTimeout = 1000;

  function updateCopyStatus() {
    if (text === "Copy") {
      setText(() => "Copied!");
      setTimeout(() => {
        setText(() => "Copy");
      }, updateTimeout);
    }
  }

  return (
    <div className="absolute top-3 right-3">
      <Button
        className="glass-badge glass-copy-button glass-focus-ring glass-hover-dim glass-interactive flex gap-2 px-2 py-1 font-medium text-xs"
        onClick={async () => {
          await navigator.clipboard.writeText(code);
          updateCopyStatus();
        }}
        size="sm"
        variant="ghost"
      >
        <span className="glass-text sr-only">{text}</span>
        <div className="flex h-4 w-4 items-center justify-center">
          <CopyIcon />
        </div>
      </Button>
    </div>
  );
}
