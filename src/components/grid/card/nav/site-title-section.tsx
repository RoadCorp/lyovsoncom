import { AppLink } from "@/components/app-link";
import { Logo } from "@/components/Logo/logo";
import { CornerKnots } from "@/components/ornaments";
import { transitionTypes } from "@/utilities/routes";
import { GridCardSection } from "../section";

export const SiteTitleSection = ({ href }: { href: string }) => {
  return (
    <GridCardSection
      className={
        "surface-nav-stage col-start-1 col-end-4 row-start-1 row-end-3 flex flex-col"
      }
    >
      <AppLink
        className={
          "ui-focus-ring ui-crest-link relative flex h-full flex-col items-center justify-center"
        }
        href={href}
        pendingHintClassName="absolute top-3 left-1/2 -translate-x-1/2"
        prefetch={null}
        scroll={false}
        showPendingHint={true}
        transitionTypes={[transitionTypes.section]}
      >
        <CornerKnots inset="sm" variant="triquetra" />
        <Logo className="nav-crest max-h-28 max-w-28 shrink-0 sm:max-h-[150px] sm:max-w-[150px]" />
        <span className="tone-heading text-center text-2xl font-bold sm:text-3xl">
          Lyóvson.com
        </span>
      </AppLink>
    </GridCardSection>
  );
};
