import { AppLink } from "@/components/AppLink";
import { Logo } from "@/components/Logo/Logo";
import { transitionTypes } from "@/utilities/routes";
import { GridCardSection } from "../section";

export const SiteTitleSection = ({ href }: { href: string }) => {
  return (
    <GridCardSection
      className={
        "surface-nav-stage col-start-1 col-end-4 row-start-1 row-end-3"
      }
    >
      <AppLink
        className={
          "ui-focus-ring relative flex h-full flex-col items-center justify-center transition-transform duration-300 hover:scale-[1.02]"
        }
        href={href}
        pendingHintClassName="absolute top-4 right-4"
        prefetch={null}
        scroll={false}
        showPendingHint={true}
        transitionTypes={[transitionTypes.drillIn]}
      >
        <Logo />
        <span className={"tone-heading text-center font-bold text-3xl"}>
          Lyóvson.com
        </span>
      </AppLink>
    </GridCardSection>
  );
};
