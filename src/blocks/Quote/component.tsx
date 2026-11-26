import { ApexLozenge } from "@/components/ornaments";
import RichText from "@/components/RichText";
import { cn } from "@/lib/utils";
import type { QuoteBlock as QuoteBlockType } from "@/payload-types";

type Props = {
  className?: string;
} & QuoteBlockType;

export function QuoteBlock({ className, quote, attribution }: Props) {
  return (
    <div className={cn("content-block", className)}>
      <figure
        className="surface-panel surface-quote ornament-braid-rail mt-0 mb-0 rounded-lg py-3 ps-7 pe-4 sm:py-4 sm:ps-8 sm:pe-5"
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
            className="quote-block-body text-base leading-relaxed [overflow-wrap:anywhere] italic [&_p]:m-0 [&_p+_p]:mt-3"
            content={quote}
            enableGutter={false}
            enableProse={false}
          />
        </blockquote>
        {attribution && (
          <figcaption
            className="quote-block-attribution mt-3 flex items-center gap-2 text-start text-sm font-medium opacity-90"
            dir="auto"
          >
            <ApexLozenge className="ornament-accent" size={9} />
            <span>{attribution}</span>
          </figcaption>
        )}
      </figure>
    </div>
  );
}
