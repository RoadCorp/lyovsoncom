import {
  BookOpen,
  BriefcaseBusiness,
  Compass,
  FileText,
  Mail,
  Radio,
  Rss,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import { AppLink } from "@/components/app-link";
import { GridCard, GridCardSection } from "@/components/grid";
import { IntentLink } from "@/components/intent-link";
import { JsonLd } from "@/components/json-ld";
import { Logo } from "@/components/Logo/logo";
import {
  ApexLozenge,
  BraidedFrieze,
  CornerKnots,
  FleuronRule,
  WingedEyebrow,
} from "@/components/ornaments";
import { PublicPageBoundary } from "@/components/public-page-boundary";
import { cn } from "@/lib/utils";
import type { Media } from "@/payload-types";
import { generateBreadcrumbSchema } from "@/utilities/generate-json-ld";
import type { PublicProfile } from "@/utilities/get-lyovson-profile";
import { getLyovsonProfile } from "@/utilities/get-lyovson-profile";
import { buildDynamicOgImageUrl } from "@/utilities/og-image";
import {
  aboutRoute,
  absoluteUrl,
  activitiesRoute,
  contactRoute,
  homeRoute,
  lyovsonActivitiesRoute,
  lyovsonBioRoute,
  lyovsonPostsRoute,
  lyovsonRoute,
  nowRoute,
  postsRoute,
  privacyPolicyRoute,
  projectsRoute,
  transitionTypes,
} from "@/utilities/routes";
import {
  buildSeoMetadata,
  DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
  DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
} from "@/utilities/seo-metadata";

export const prefetch = "partial";

function PersonAboutCard({ profile }: { profile: PublicProfile }) {
  const avatarMedia =
    profile.avatar && typeof profile.avatar === "object"
      ? (profile.avatar as Media)
      : null;

  return (
    <GridCard frameLabel={profile.name}>
      <GridCardSection
        className="surface-title-stage relative col-start-1 col-end-4 row-start-1 row-end-3 flex flex-col items-center justify-center gap-3 px-6 py-5 text-center"
        flush={true}
      >
        <BraidedFrieze />
        <CornerKnots
          className="ornament-corner--rest"
          edges="bottom"
          variant="ticks"
        />
        <div className="relative z-1 flex flex-col items-center gap-3">
          {avatarMedia?.url ? (
            <div className="media-frame h-16 w-16 overflow-hidden rounded-full">
              <Image
                alt={profile.name}
                className="h-full w-full object-cover"
                height={64}
                src={avatarMedia.url}
                width={64}
              />
            </div>
          ) : null}
          <IntentLink
            className="ui-focus-ring tone-heading card-title text-xl hover:underline"
            href={lyovsonRoute(profile.username)}
            transitionTypes={[transitionTypes.section]}
          >
            {profile.name}
          </IntentLink>
          {profile.quote ? (
            <p className="tone-muted line-clamp-2 max-w-[26ch] text-xs leading-relaxed">
              {profile.quote}
            </p>
          ) : null}
        </div>
      </GridCardSection>

      <GridCardSection
        className="surface-rail-panel col-start-1 col-end-4 row-start-3 row-end-4 grid grid-cols-3 gap-2 p-2.5"
        flush={true}
      >
        <AppLink
          className="surface-row ui-interactive ui-focus-ring type-eyebrow flex flex-col items-center justify-center gap-1 p-2 text-center"
          href={lyovsonBioRoute(profile.username)}
          prefetch={false}
        >
          <BookOpen aria-hidden="true" className="h-4 w-4" />
          <span>Bio</span>
        </AppLink>
        <AppLink
          className="surface-row ui-interactive ui-focus-ring type-eyebrow flex flex-col items-center justify-center gap-1 p-2 text-center"
          href={lyovsonPostsRoute(profile.username)}
          prefetch={false}
        >
          <FileText aria-hidden="true" className="h-4 w-4" />
          <span>Posts</span>
        </AppLink>
        <AppLink
          className="surface-row ui-interactive ui-focus-ring type-eyebrow flex flex-col items-center justify-center gap-1 p-2 text-center"
          href={lyovsonActivitiesRoute(profile.username)}
          prefetch={false}
        >
          <Radio aria-hidden="true" className="h-4 w-4" />
          <span>Logs</span>
        </AppLink>
      </GridCardSection>
    </GridCard>
  );
}

async function AboutPageContent() {
  const [rafa, jess] = await Promise.all([
    getLyovsonProfile("rafa"),
    getLyovsonProfile("jess"),
  ]);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: absoluteUrl(homeRoute()) },
    { name: "About" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      <GridCard
        className={cn(
          "col-start-1 col-end-2 row-start-2 row-end-4 h-[var(--grid-card-1x2)] w-[var(--grid-card-1x1)] [--grid-internal-rows:6]",
          "g2:col-start-2 g2:col-end-3 g2:row-start-1 g2:row-end-3",
          "g3:col-start-2 g3:col-end-4 g3:row-start-1 g3:row-end-2 g3:h-[var(--grid-card-1x1)] g3:w-[var(--grid-card-2x1)] g3:[--grid-internal-cols:6] g3:[--grid-internal-rows:3]",
          "g4:self-start"
        )}
      >
        <GridCardSection className="surface-nav-stage g3:col-start-1 g3:col-end-4 g3:row-start-1 g3:row-end-4 relative col-start-1 col-end-4 row-start-1 row-end-4 flex flex-col items-center justify-center gap-3 px-6 py-6 text-center">
          <div className="ornament-lattice" />
          <CornerKnots inset="md" variant="triquetra" />
          <div className="relative z-1 flex flex-col items-center gap-3">
            <Logo className="h-28 w-28" />
            <WingedEyebrow>Family Archive</WingedEyebrow>
            <p className="tone-muted max-w-[26ch] text-xs leading-relaxed">
              Est. as a permanent shared notebook for Rafa &amp; Jess Lyóvson.
            </p>
          </div>
        </GridCardSection>

        <GridCardSection className="surface-title-stage g3:col-start-4 g3:col-end-7 g3:row-start-1 g3:row-end-4 col-start-1 col-end-4 row-start-4 row-end-7">
          <BraidedFrieze />
          <CornerKnots
            className="ornament-corner--rest"
            edges="bottom"
            variant="ticks"
          />
          <div className="relative z-1 flex h-full flex-col justify-between gap-4 px-6 pt-6 pb-5 md:px-7 md:pt-7 md:pb-6">
            <p className="type-eyebrow flex items-center gap-2">
              <span className="card-eyebrow">About</span>
              <ApexLozenge className="ornament-accent" size={9} />
              <span className="tone-muted">Colophon</span>
            </p>

            <div className="space-y-3">
              <h1 className="tone-heading text-2xl leading-tight font-semibold md:text-3xl">
                Lyóvson.com
              </h1>
              <p className="tone-body text-sm leading-relaxed">
                A shared home for our essays, notes, reviews, studio projects,
                and the books, films, music, and games we keep coming back to.
              </p>
            </div>

            <div className="hero-footer flex flex-wrap items-center gap-x-4 gap-y-2 pt-3">
              <AppLink
                className="ui-meta-link ui-focus-ring type-eyebrow"
                href={postsRoute()}
                prefetch={false}
              >
                <FileText aria-hidden="true" className="h-3.5 w-3.5" />
                <span>Posts</span>
              </AppLink>
              <AppLink
                className="ui-meta-link ui-focus-ring type-eyebrow"
                href={activitiesRoute()}
                prefetch={false}
              >
                <Radio aria-hidden="true" className="h-3.5 w-3.5" />
                <span>Activities</span>
              </AppLink>
              <AppLink
                className="ui-meta-link ui-focus-ring type-eyebrow"
                href={projectsRoute()}
                prefetch={false}
              >
                <BriefcaseBusiness aria-hidden="true" className="h-3.5 w-3.5" />
                <span>Projects</span>
              </AppLink>
              <AppLink
                className="ui-meta-link ui-focus-ring type-eyebrow"
                href={nowRoute()}
                prefetch={false}
              >
                <Compass aria-hidden="true" className="h-3.5 w-3.5" />
                <span>Now</span>
              </AppLink>
            </div>
          </div>
        </GridCardSection>
      </GridCard>

      {rafa ? <PersonAboutCard profile={rafa} /> : null}
      {jess ? <PersonAboutCard profile={jess} /> : null}

      <GridCard frameLabel="Syndication & Keys">
        <GridCardSection className="surface-rail-panel relative col-span-3 row-span-3 flex flex-col justify-between gap-4 p-6">
          <CornerKnots className="ornament-corner--rest" variant="ticks" />

          <div className="relative z-1 space-y-2.5">
            <h2 className="type-eyebrow card-eyebrow">Feeds &amp; Formats</h2>
            <div className="grid grid-cols-2 gap-2">
              <a
                className="surface-row ui-interactive ui-focus-ring type-eyebrow flex items-center gap-2 px-3 py-2"
                href="/feed.xml"
              >
                <Rss aria-hidden="true" className="h-3.5 w-3.5" />
                <span>RSS</span>
              </a>
              <a
                className="surface-row ui-interactive ui-focus-ring type-eyebrow flex items-center gap-2 px-3 py-2"
                href="/atom.xml"
              >
                <Rss aria-hidden="true" className="h-3.5 w-3.5" />
                <span>Atom</span>
              </a>
              <a
                className="surface-row ui-interactive ui-focus-ring type-eyebrow flex items-center gap-2 px-3 py-2"
                href="/feed.json"
              >
                <FileText aria-hidden="true" className="h-3.5 w-3.5" />
                <span>JSON Feed</span>
              </a>
              <a
                className="surface-row ui-interactive ui-focus-ring type-eyebrow flex items-center gap-2 px-3 py-2"
                href="/llms.txt"
              >
                <BookOpen aria-hidden="true" className="h-3.5 w-3.5" />
                <span>llms.txt</span>
              </a>
            </div>
          </div>

          <FleuronRule variant="lozenge" />

          <div className="relative z-1 space-y-2">
            <h2 className="type-eyebrow card-eyebrow">Keyboard Shortcuts</h2>
            <dl className="tone-muted grid grid-cols-3 gap-2 text-xs">
              <div className="surface-row flex flex-col items-center gap-1 py-2">
                <dt>
                  <kbd className="text-foreground font-mono font-semibold">
                    /
                  </kbd>
                </dt>
                <dd>Search</dd>
              </div>
              <div className="surface-row flex flex-col items-center gap-1 py-2">
                <dt>
                  <kbd className="text-foreground font-mono font-semibold">
                    M
                  </kbd>
                </dt>
                <dd>Menu</dd>
              </div>
              <div className="surface-row flex flex-col items-center gap-1 py-2">
                <dt>
                  <kbd className="text-foreground font-mono font-semibold">
                    T
                  </kbd>
                </dt>
                <dd>Theme</dd>
              </div>
            </dl>
          </div>

          <div className="border-border/60 relative z-1 flex flex-wrap items-center justify-between gap-3 border-t pt-3">
            <AppLink
              className="ui-meta-link ui-focus-ring type-eyebrow"
              href={contactRoute()}
              prefetch={false}
            >
              <Mail aria-hidden="true" className="h-3.5 w-3.5" />
              <span>Contact</span>
            </AppLink>
            <AppLink
              className="ui-meta-link ui-focus-ring type-eyebrow"
              href={privacyPolicyRoute()}
              prefetch={false}
            >
              <ShieldCheck aria-hidden="true" className="h-3.5 w-3.5" />
              <span>Privacy Policy</span>
            </AppLink>
          </div>
        </GridCardSection>
      </GridCard>

      <GridCard frameLabel="Credits">
        <GridCardSection className="surface-rail-panel relative col-span-3 row-span-3 flex flex-col justify-between gap-4 p-6">
          <CornerKnots className="ornament-corner--rest" variant="ticks" />
          {/* TMDB's terms require attribution with its notice and logo. */}
          <div className="relative z-1 space-y-3">
            <h2 className="type-eyebrow card-eyebrow">Media Metadata</h2>
            <Image
              alt="TMDB"
              height={18}
              src="/credits/tmdb.svg"
              unoptimized
              width={139}
            />
            <p className="tone-muted text-sm leading-relaxed">
              Film and TV details and posters come from TMDB. This website uses
              TMDB and the TMDB APIs but is not endorsed, certified, or
              otherwise approved by TMDB.
            </p>
          </div>

          <FleuronRule variant="lozenge" />

          <div className="relative z-1 space-y-1.5">
            <h2 className="type-eyebrow card-eyebrow">Craft &amp; Stack</h2>
            <p className="tone-muted text-xs leading-relaxed">
              Typeset in IBM Plex Serif, Sans &amp; Mono. Built with Next.js,
              Payload CMS, and our 400px card grid.
            </p>
          </div>
        </GridCardSection>
      </GridCard>
    </>
  );
}

export default function AboutPage() {
  return (
    <PublicPageBoundary>
      <AboutPageContent />
    </PublicPageBoundary>
  );
}

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "About",
    description:
      "About Lyóvson.com — the shared family notebook, reading ledger, and studio archive of Rafa and Jess Lyóvson.",
    canonicalPath: aboutRoute(),
    image: {
      url: buildDynamicOgImageUrl({
        eyebrow: "Colophon",
        title: "About Lyóvson.com",
        meta: "Family Notebook & Studio Archive",
      }),
      width: DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
      height: DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
      alt: "About Lyóvson.com",
    },
  }),
};
