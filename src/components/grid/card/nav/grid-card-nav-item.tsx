import type { ReactNode } from "react";
import { AppLink } from "@/components/AppLink";
import { cn } from "@/lib/utils";
import { transitionTypes } from "@/utilities/routes";

import { GridCardSection } from "../section";

interface GridCardNavItemBaseProps {
  children: ReactNode;
  className?: string;
}

type GridCardNavItemLinkProps = GridCardNavItemBaseProps & {
  variant: "link";
  href: string;
};

type GridCardNavItemButtonProps = GridCardNavItemBaseProps & {
  variant: "button";
  onClick: () => void;
  disabled?: boolean;
};

type GridCardNavItemStaticProps = GridCardNavItemBaseProps & {
  variant?: "static";
};

type GridCardNavItemProps =
  | GridCardNavItemLinkProps
  | GridCardNavItemButtonProps
  | GridCardNavItemStaticProps;

export const GridCardNavItem = ({
  children,
  className,
  ...props
}: GridCardNavItemProps) => {
  if (props.variant === "link") {
    return (
      <GridCardSection className={cn("group", className)}>
        <AppLink
          className="glass-text glass-focus-ring glass-group-hover-dim flex h-full w-full flex-col items-center justify-center gap-2"
          href={props.href}
          pendingHintClassName="absolute top-2 right-2"
          prefetch={null}
          showPendingHint={true}
          transitionTypes={[transitionTypes.drillIn]}
        >
          {children}
        </AppLink>
      </GridCardSection>
    );
  }

  if (props.variant === "button") {
    return (
      <GridCardSection
        className={cn(
          "glass-text flex h-full flex-col items-center justify-center gap-2",
          className
        )}
        disabled={props.disabled}
        mode="button"
        onClick={props.onClick}
      >
        {children}
      </GridCardSection>
    );
  }

  return (
    <GridCardSection
      className={cn(
        "glass-text flex h-full flex-col items-center justify-center gap-2",
        className
      )}
    >
      {children}
    </GridCardSection>
  );
};
