import RichText from "@/components/RichText";
import { cn } from "@/lib/utils";
import type { QuoteBlock as QuoteBlockType } from "@/payload-types";

type Props = {
  className?: string;
} & QuoteBlockType;

export function QuoteBlock({ className, quote, attribution }: Props) {
  return (
    <div className={cn("content-block", className)}>
      <div
        className="surface-panel surface-quote mt-0 mb-0 rounded-lg px-4 py-3 sm:px-5 sm:py-4"
        dir="auto"
      >
        <blockquote className="m-0">
          <span
            aria-hidden="true"
            className="quote-block-mark mb-2 block text-2xl leading-none opacity-70"
          >
            &ldquo;
          </span>
          <RichText
            className="quote-block-body text-base italic leading-relaxed [overflow-wrap:anywhere] [&_p+_p]:mt-3 [&_p]:m-0"
            content={quote}
            enableGutter={false}
            enableProse={false}
          />
        </blockquote>
        {attribution && (
          <footer
            className="quote-block-attribution mt-3 text-start font-medium text-sm opacity-90"
            dir="auto"
          >
            — {attribution}
          </footer>
        )}
      </div>
    </div>
  );
}
