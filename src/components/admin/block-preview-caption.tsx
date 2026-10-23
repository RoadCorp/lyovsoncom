import type { SerializedEditorState } from "@payloadcms/richtext-lexical/lexical";
import { RichText } from "@payloadcms/richtext-lexical/react";
import { captionWithText } from "@/utilities/extract-lexical-text";

export function BlockPreviewCaption({
  content,
}: {
  content?: SerializedEditorState | null;
}) {
  const caption = captionWithText(content);
  if (!caption) {
    return null;
  }

  return (
    <div className="block-preview__caption" dir="auto">
      <RichText data={caption} disableContainer />
    </div>
  );
}
