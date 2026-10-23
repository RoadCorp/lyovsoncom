import { RichText } from "@payloadcms/richtext-lexical/react";
import { BlockPreview } from "@/components/admin/block-preview";
import type { QuoteBlock } from "@/payload-types";

export function QuotePreview({
  siblingData,
}: {
  siblingData?: Partial<QuoteBlock>;
}) {
  return (
    <BlockPreview>
      {siblingData?.quote ? (
        <blockquote className="block-preview__quote" dir="auto">
          <div className="block-preview__quote-body">
            <RichText data={siblingData.quote} disableContainer />
          </div>
          {siblingData.attribution && (
            <footer>— {siblingData.attribution}</footer>
          )}
        </blockquote>
      ) : (
        <p className="block-preview__empty">Write the quote.</p>
      )}
    </BlockPreview>
  );
}
