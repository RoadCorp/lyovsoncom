import {
  Mail,
  MessageSquareText,
  Radio,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import type { Metadata } from "next";
import { AppLink } from "@/components/app-link";
import { CopyEmailButton } from "@/components/copy-email-button";
import { FeedLinksGrid } from "@/components/feed-links-grid";
import {
  GRID_HERO_PANELS,
  GridCard,
  GridCardSection,
  HeroStage,
} from "@/components/grid";
import { IntentLink } from "@/components/intent-link";
import { JsonLd } from "@/components/json-ld";
import { Logo } from "@/components/Logo/logo";
import {
  ApexLozenge,
  CornerKnots,
  FleuronRule,
  WingedEyebrow,
} from "@/components/ornaments";
import { PublicPageBoundary } from "@/components/public-page-boundary";
import { cn } from "@/lib/utils";
import { generateBreadcrumbSchema } from "@/utilities/generate-json-ld";
import type { PublicProfile } from "@/utilities/get-lyovson-profile";
import { getLyovsonProfile } from "@/utilities/get-lyovson-profile";
import { buildDynamicOgImageUrl } from "@/utilities/og-image";
import {
  aboutRoute,
  absoluteUrl,
  contactRoute,
  homeRoute,
  lyovsonContactRoute,
  lyovsonRoute,
  nowRoute,
  privacyPolicyRoute,
  transitionTypes,
} from "@/utilities/routes";
import {
  buildSeoMetadata,
  DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
  DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
} from "@/utilities/seo-metadata";
import { PUBLIC_CONTACT_EMAIL } from "@/utilities/site-config";
import { SOCIAL_ICON_MAP } from "@/utilities/social-icons";

export const prefetch = "partial";

const MAX_SOCIAL_LINKS = 3;

function PersonContactCard({ profile }: { profile: PublicProfile }) {
  const socialLinks = (profile.socialLinks || []).slice(0, MAX_SOCIAL_LINKS);

  return (
    <GridCard frameLabel={profile.name}>
      <GridCardSection className="surface-rail-panel relative col-span-3 row-span-3 flex flex-col justify-between gap-4 p-6">
        <CornerKnots className="ornament-corner--rest" variant="ticks" />

        <div className="relative z-1 space-y-2 text-center">
          <IntentLink
            className="ui-focus-ring tone-heading card-title text-xl hover:underline"
            href={lyovsonRoute(profile.username)}
            transitionTypes={[transitionTypes.section]}
          >
            {profile.name}
          </IntentLink>
          <FleuronRule variant="lozenge" />
        </div>

        <ul className="relative z-1 flex flex-col gap-2">
          {socialLinks.map((link) => {
            const iconConfig = SOCIAL_ICON_MAP[link.platform];
            if (!iconConfig) {
              return null;
            }
            const Icon = iconConfig.icon;
            return (
              <li key={link.url}>
                <a
                  className="ui-inline-action ui-focus-ring ui-interactive text-sm"
                  href={link.url}
                  rel="noopener"
                  target="_blank"
                >
                  <Icon aria-hidden="true" className="h-4 w-4" />
                  <span>{iconConfig.label}</span>
                </a>
              </li>
            );
          })}
        </ul>

        <div className="border-border/60 relative z-1 flex items-center justify-center border-t pt-3">
          <AppLink
            className="ui-meta-link ui-focus-ring type-eyebrow"
            href={lyovsonContactRoute(profile.username)}
            prefetch={false}
          >
            <UserRound aria-hidden="true" className="h-3.5 w-3.5" />
            <span>Direct card</span>
          </AppLink>
        </div>
      </GridCardSection>
    </GridCard>
  );
}

async function ContactPageContent() {
  const [rafa, jess] = await Promise.all([
    getLyovsonProfile("rafa"),
    getLyovsonProfile("jess"),
  ]);

  const breadcrumbSchema = generateBreadcrumbSchema([
    { name: "Home", url: absoluteUrl(homeRoute()) },
    { name: "Contact" },
  ]);

  return (
    <>
      <JsonLd data={breadcrumbSchema} />

      <GridCard slot="hero">
        <GridCardSection
          className={cn(
            "surface-nav-stage relative flex flex-col items-center justify-center gap-3 px-6 py-6 text-center",
            GRID_HERO_PANELS.media
          )}
        >
          <div className="ornament-lattice" />
          <CornerKnots inset="md" variant="triquetra" />
          <div className="relative z-1 flex flex-col items-center gap-3">
            <Logo className="h-24 w-24" />
            <WingedEyebrow>Correspondence</WingedEyebrow>
            <p className="tone-muted max-w-[26ch] text-xs leading-relaxed">
              Notes, collaborations, reading recommendations, and thoughtful
              replies are always welcome.
            </p>
          </div>
        </GridCardSection>

        <HeroStage>
          <div className="relative z-1 flex h-full flex-col justify-between gap-4 px-6 pt-6 pb-5 md:px-7 md:pt-7 md:pb-6">
            <p className="type-eyebrow flex items-center gap-2">
              <MessageSquareText
                aria-hidden="true"
                className="ornament-accent h-3.5 w-3.5"
              />
              <span className="card-eyebrow">Contact</span>
              <ApexLozenge className="ornament-accent" size={9} />
              <span className="tone-muted">Family Desk</span>
            </p>

            <div className="space-y-3">
              <h1 className="tone-heading text-2xl leading-tight font-semibold md:text-3xl">
                Write to Us
              </h1>
              <div className="flex flex-wrap items-center gap-2.5 pt-1">
                <a
                  className="ui-inline-action ui-focus-ring ui-interactive text-sm font-medium"
                  href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
                >
                  <Mail aria-hidden="true" className="h-4 w-4" />
                  <span>{PUBLIC_CONTACT_EMAIL}</span>
                </a>
                <CopyEmailButton email={PUBLIC_CONTACT_EMAIL} />
              </div>
            </div>

            <div className="hero-footer flex flex-wrap items-center gap-x-4 gap-y-2 pt-3">
              <AppLink
                className="ui-meta-link ui-focus-ring type-eyebrow"
                href={aboutRoute()}
                prefetch={false}
              >
                <span>About</span>
              </AppLink>
              <AppLink
                className="ui-meta-link ui-focus-ring type-eyebrow"
                href={nowRoute()}
                prefetch={false}
              >
                <Radio aria-hidden="true" className="h-3.5 w-3.5" />
                <span>Now</span>
              </AppLink>
            </div>
          </div>
        </HeroStage>
      </GridCard>

      {rafa ? <PersonContactCard profile={rafa} /> : null}
      {jess ? <PersonContactCard profile={jess} /> : null}

      <GridCard frameLabel="Follow & Feeds">
        <GridCardSection className="surface-rail-panel relative col-span-3 row-span-3 flex flex-col justify-between gap-4 p-6">
          <CornerKnots className="ornament-corner--rest" variant="ticks" />

          <div className="relative z-1 space-y-2 text-center">
            <h2 className="tone-heading card-title text-xl">Stay in Loop</h2>
            <FleuronRule variant="lozenge" />
            <p className="tone-muted text-xs leading-relaxed">
              Subscribe in any feed reader — no algorithms or newsletters
              required.
            </p>
          </div>

          <FeedLinksGrid className="relative z-1" jsonLabel="JSON" />

          <div className="border-border/60 relative z-1 flex items-center justify-center border-t pt-3">
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
    </>
  );
}

export default function ContactPage() {
  return (
    <PublicPageBoundary>
      <ContactPageContent />
    </PublicPageBoundary>
  );
}

export const metadata: Metadata = {
  ...buildSeoMetadata({
    title: "Contact",
    description:
      "Reach Rafa and Jess Lyóvson by email or through their public channels.",
    canonicalPath: contactRoute(),
    image: {
      url: buildDynamicOgImageUrl({
        eyebrow: "Correspondence",
        title: "Contact Lyóvson.com",
        meta: PUBLIC_CONTACT_EMAIL,
      }),
      width: DEFAULT_OPEN_GRAPH_IMAGE_WIDTH,
      height: DEFAULT_OPEN_GRAPH_IMAGE_HEIGHT,
      alt: "Contact Lyóvson.com",
    },
  }),
};
