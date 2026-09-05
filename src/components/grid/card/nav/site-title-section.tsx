import { AppLink } from "@/components/AppLink";
import { Logo } from "@/components/Logo/Logo";
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
        pendingHintClassName="absolute top-4 right-4"
        prefetch={null}
        scroll={false}
        showPendingHint={true}
        transitionTypes={[transitionTypes.section]}
      >
        <Logo className="nav-crest max-h-28 max-w-28 shrink-0 sm:max-h-[150px] sm:max-w-[150px]" />
        <span className="tone-heading text-center font-bold text-2xl sm:text-3xl">
          Lyóvson.com
        </span>
      </AppLink>
    </GridCardSection>
  );
};
