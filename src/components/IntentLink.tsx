"use client";

import { useState } from "react";
import { AppLink, type AppLinkProps } from "@/components/AppLink";

export function IntentLink({
  onFocus,
  onMouseEnter,
  onTouchStart,
  ...props
}: Omit<AppLinkProps, "prefetch">) {
  const [shouldPrefetch, setShouldPrefetch] = useState(false);
  return (
    <AppLink
      {...props}
      onFocus={(event) => {
        setShouldPrefetch(true);
        onFocus?.(event);
      }}
      onMouseEnter={(event) => {
        setShouldPrefetch(true);
        onMouseEnter?.(event);
      }}
      onTouchStart={(event) => {
        setShouldPrefetch(true);
        onTouchStart?.(event);
      }}
      prefetch={shouldPrefetch}
    />
  );
}
