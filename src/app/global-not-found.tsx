import type { Metadata } from "next";
import { Grid, GridCardNav, GridCardNotFound } from "@/components/grid";
import { Providers } from "@/providers";
import { buildNotFoundMetadata } from "@/utilities/seo-metadata";
import { fontVariables } from "./(frontend)/fonts";
import "./(frontend)/globals.css";

export const metadata: Metadata = {
  ...buildNotFoundMetadata({
    title: "404: This page could not be found.",
    description: "The requested page could not be found.",
  }),
};

// Unmatched URLs render outside the root layout, so this rebuilds the same
// shell: fonts, theme, the grid and the nav card.
export default function GlobalNotFound() {
  return (
    <html className={fontVariables} lang="en" suppressHydrationWarning>
      <body>
        <a className="skip-link ui-focus-ring" href="#main-content">
          Skip to content
        </a>
        <Providers>
          <Grid nav={<GridCardNav />}>
            <GridCardNotFound />
          </Grid>
        </Providers>
      </body>
    </html>
  );
}
