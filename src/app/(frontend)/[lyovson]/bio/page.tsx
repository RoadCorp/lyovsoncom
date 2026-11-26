import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import {
  GridCard,
  GridCardEmptyState,
  GridCardSection,
} from "@/components/grid";
import { JsonLd } from "@/components/json-ld";
import { FleuronRule } from "@/components/ornaments";
import { PublicPageBoundary } from "@/components/public-page-boundary";
import RichText from "@/components/RichText";
import {
  generatePersonSchema,
  generateProfilePageSchema,
} from "@/utilities/generate-json-ld";
import { getLyovsonProfile } from "@/utilities/get-lyovson-profile";
import {
  getLyovsonDisplayName,
  getLyovsonPersonInput,
} from "@/utilities/lyovson-person";
import { absoluteUrl } from "@/utilities/routes";
import {
  buildLyovsonMetadata,
  buildLyovsonNotFoundMetadata,
} from "../_utilities/metadata";

export const prefetch = "partial";

interface PageProps {
  params: Promise<{ lyovson: string }>;
}

async function PageContent({ params }: PageProps) {
  const { lyovson: username } = await params;
  const user = await getLyovsonProfile(username);

  if (!user) {
    return notFound();
  }

  const displayName = getLyovsonDisplayName(user, username);
  const personInput = getLyovsonPersonInput(user);
  const personSchema = personInput ? generatePersonSchema(personInput) : null;
  const profilePageSchema = personSchema
    ? generateProfilePageSchema({
        person: personSchema,
        description: user.quote || undefined,
        url: absoluteUrl(`/${user.username}/bio`),
      })
    : null;

  return (
    <>
      <h1 className="sr-only">{displayName} bio</h1>
      {personSchema && profilePageSchema ? (
        <JsonLd data={[personSchema, profilePageSchema]} />
      ) : null}

      {user.bio ? (
        <GridCard
          className="g2:col-start-1 g2:col-end-3 g2:row-auto g2:row-start-3 g2:w-[var(--grid-card-2x1)] g3:col-start-2 g3:col-end-4 g3:row-start-2 aspect-auto h-auto self-start"
          interactive={false}
        >
          <GridCardSection className="[container-type:inline-size] col-span-3 row-span-3 p-6">
            <RichText
              className="reveal-stagger-3 g3:text-[1.125rem] h-full"
              content={user.bio}
              enableGutter={false}
              enableProse={true}
            />
            <FleuronRule variant="finis" />
          </GridCardSection>
        </GridCard>
      ) : (
        <GridCardEmptyState
          description={`A full bio for ${displayName} has not been published yet.`}
          title="Bio Coming Soon"
        />
      )}
    </>
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { lyovson: username } = await params;
  const user = await getLyovsonProfile(username);

  if (!user) {
    return buildLyovsonNotFoundMetadata();
  }

  const name = getLyovsonDisplayName(user, username);
  const description = user.quote || `Read ${name}'s biography.`;
  const title = `${name} Bio`;

  return buildLyovsonMetadata({
    title,
    description,
    canonicalPath: `/${username}/bio`,
    openGraphType: "profile",
    profile: {
      firstName: name.split(" ")[0],
      lastName: name.split(" ").slice(1).join(" ") || undefined,
      username,
    },
  });
}

export default function Page(props: PageProps) {
  return (
    <PublicPageBoundary>
      <PageContent {...props} />
    </PublicPageBoundary>
  );
}
