"use client";

import Link from "next/link";
import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { useState } from "react";
import { transitionTypes } from "@/utilities/routes";

type LinkHref = ComponentPropsWithoutRef<typeof Link>["href"];
type LinkProps = Omit<
  ComponentPropsWithoutRef<typeof Link>,
  "href" | "prefetch" | "transitionTypes"
>;

interface PostDrillInLinkProps extends LinkProps {
  children: ReactNode;
  href: LinkHref | string;
}

export function PostDrillInLink({
  children,
  href,
  onFocus,
  onMouseEnter,
  onTouchStart,
  ...props
}: PostDrillInLinkProps) {
  const [shouldPrefetch, setShouldPrefetch] = useState(false);

  const enablePrefetch = () => {
    if (!shouldPrefetch) {
      setShouldPrefetch(true);
    }
  };

  return (
    <Link
      {...props}
      href={href as LinkHref}
      onFocus={(event) => {
        enablePrefetch();
        onFocus?.(event);
      }}
      onMouseEnter={(event) => {
        enablePrefetch();
        onMouseEnter?.(event);
      }}
      onTouchStart={(event) => {
        enablePrefetch();
        onTouchStart?.(event);
      }}
      prefetch={shouldPrefetch ? null : false}
      transitionTypes={[transitionTypes.postDrillIn]}
    >
      {children}
    </Link>
  );
}
