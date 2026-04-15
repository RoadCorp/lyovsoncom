"use client";

import { Home, RefreshCcw, WifiOff } from "lucide-react";
import Link from "next/link";
import { GridCard, GridCardSection } from "@/components/grid";

export default function OfflinePage() {
  return (
    <GridCard
      className={
        "g2:col-start-2 g2:col-end-3 g2:row-start-2 g2:row-end-3 g3:self-start"
      }
      interactive={false}
    >
      <GridCardSection className="col-start-1 col-end-4 row-start-1 row-end-3 flex flex-col items-center justify-center gap-4 px-6 text-center">
        <span className="glass-badge flex h-16 w-16 items-center justify-center rounded-full">
          <WifiOff aria-hidden="true" className="h-8 w-8" />
        </span>
        <h1 className="glass-text font-bold text-2xl">You are offline</h1>
        <p className="glass-text-secondary text-sm">
          Cached pages still work. Reconnect and refresh when you are ready.
        </p>
      </GridCardSection>

      <GridCardSection className="col-start-1 col-end-2 row-start-3 row-end-4">
        <Link
          className="glass-text glass-focus-ring glass-hover-dim flex h-full w-full flex-col items-center justify-center gap-2"
          href="/"
        >
          <Home aria-hidden="true" className="h-6 w-6" />
          <span className="text-sm">Home</span>
        </Link>
      </GridCardSection>

      <GridCardSection
        className="glass-text col-start-2 col-end-3 row-start-3 row-end-4 flex flex-col items-center justify-center gap-2"
        mode="button"
        onClick={() => window.location.reload()}
      >
        <RefreshCcw aria-hidden="true" className="h-6 w-6" />
        <span className="text-sm">Refresh</span>
      </GridCardSection>

      <GridCardSection className="col-start-3 col-end-4 row-start-3 row-end-4 flex items-center justify-center px-3 text-center">
        <p className="glass-text-secondary text-xs">PWA cache active</p>
      </GridCardSection>
    </GridCard>
  );
}
