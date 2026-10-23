import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { RichText } from "@payloadcms/richtext-lexical/react";

export function BlockPreviewCaption({
  content,
}: {
  content?: SerializedEditorState | null;
}) {
  if (!content) {
    return null;
  }

  return (
    <div className="block-preview__caption" dir="auto">
      <RichText data={content} disableContainer />
    </div>
  );
}
