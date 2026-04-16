import { Mail } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next/types";
import { GridCard, GridCardSection } from "@/components/grid";
import { getLyovsonProfile } from "@/utilities/get-lyovson-profile";
import { SOCIAL_ICON_MAP } from "@/utilities/social-icons";
import {
  buildLyovsonMetadata,
  buildLyovsonNotFoundMetadata,
} from "../_utilities/metadata";

interface PageProps {
  params: Promise<{ lyovson: string }>;
}

const PUBLIC_EMAIL = "hello@lyovson.com";
const MAX_CONTACT_LINKS = 3;

export default async function Page({ params }: PageProps) {
  const { lyovson: username } = await params;
  const user = await getLyovsonProfile(username);

  if (!user) {
    return notFound();
  }

  const contactLinks = (user.socialLinks || []).slice(0, MAX_CONTACT_LINKS);

  return (
    <>
      <h1 className="sr-only">{user.name} contact</h1>

      <GridCard
        className="g2:col-start-2 g3:col-start-2 g2:col-end-3 g3:col-end-3 g2:row-start-3 g3:row-start-2 g2:row-end-4 g3:row-end-3"
        interactive={false}
      >
        <GridCardSection className="col-span-3 row-span-1 flex items-center justify-center p-5">
          <div className="text-center">
            <h2 className="tone-heading font-bold text-xl">
              Contact {user.name}
            </h2>
            <p className="tone-muted mt-2 text-sm">
              Reach out via public channels below.
            </p>
          </div>
        </GridCardSection>

        <GridCardSection className="col-span-3 row-span-2 p-4">
          <ul className="flex h-full flex-col justify-center gap-2">
            <li>
              <Link
                className="ui-inline-action ui-focus-ring ui-interactive text-sm"
                href={`mailto:${PUBLIC_EMAIL}`}
              >
                <Mail aria-hidden="true" className="h-5 w-5" />
                <span>{PUBLIC_EMAIL}</span>
              </Link>
            </li>

            {contactLinks.map((link) => {
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
                    <Icon aria-hidden="true" className="h-5 w-5" />
                    <span>{iconConfig.label}</span>
                  </a>
                </li>
              );
            })}
          </ul>
        </GridCardSection>
      </GridCard>
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

  const name = user.name || username;
  const title = `${name} Contact`;
  const description = `Public contact links for ${name}.`;

  return buildLyovsonMetadata({
    title,
    description,
    canonicalPath: `/${username}/contact`,
  });
}
