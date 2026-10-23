"use client";

import {
  BlockEditButton,
  useBlockComponentContext,
} from "@payloadcms/richtext-lexical/client";
import type { ReactNode } from "react";
import "./block-preview.css";

/**
 * Shows a block in the editor the way it reads on the site, inside Payload's
 * own block collapsible. The edit button opens the fields in Payload's drawer.
 */
export function BlockPreview({ children }: { children: ReactNode }) {
  const { BlockCollapsible } = useBlockComponentContext();

  return (
    <BlockCollapsible>
      <div className="block-preview">
        <div className="block-preview__actions">
          <BlockEditButton />
        </div>
        {children}
      </div>
    </BlockCollapsible>
  );
}
