import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import type { AppTransitionType } from "@/utilities/routes";
import { AppLinkPendingIndicator } from "./AppLinkPendingIndicator";

type LinkHref = ComponentPropsWithoutRef<typeof Link>["href"];

export interface AppLinkProps
  extends Omit<
    ComponentPropsWithoutRef<typeof Link>,
    "href" | "transitionTypes"
  > {
  children: ReactNode;
  href: LinkHref | string;
  pendingHintClassName?: string;
  showPendingHint?: boolean;
  transitionTypes?: AppTransitionType[];
}

export function AppLink({
  children,
  href,
  pendingHintClassName,
  prefetch = null,
  showPendingHint = false,
  transitionTypes,
  ...props
}: AppLinkProps) {
  return (
    <Link
      {...props}
      href={href as LinkHref}
      prefetch={prefetch}
      transitionTypes={transitionTypes}
    >
      {children}
      {showPendingHint ? (
        <AppLinkPendingIndicator className={pendingHintClassName} />
      ) : null}
    </Link>
  );
}
