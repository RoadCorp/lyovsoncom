import Image from "next/image";
import { GridCard, GridCardNavItem, GridCardSection } from "@/components/grid";
import { cn } from "@/lib/utils";
import type { Lyovson, Media } from "@/payload-types";
import { SOCIAL_ICON_MAP } from "@/utilities/social-icons";

const MAX_SOCIAL_LINKS = 3;

interface Props {
  className?: string;
  user?: Lyovson;
}

interface AvatarData {
  alt: string;
  url: string;
}

export const GridCardUser = ({ user, className }: Props) => {
  // Extract avatar data with type guard
  const avatarMedia: Media | null =
    user?.avatar && typeof user.avatar === "object"
      ? (user.avatar as Media)
      : null;

  const avatarData: AvatarData = {
    url: avatarMedia?.url || "/placeholder-avatar.png",
    alt: user?.name || "User avatar",
  };

  const userName = user?.name || "User";
  const userQuote = user?.quote || "";
  const socialLinks = user?.socialLinks?.slice(0, MAX_SOCIAL_LINKS) || [];

  const gridPositions = [
    "col-start-1 col-end-2 row-start-6 row-end-7 g3:col-start-4 g3:col-end-5 g3:row-start-3 g3:row-end-4",
    "col-start-2 col-end-3 row-start-6 row-end-7 g3:col-start-5 g3:col-end-6 g3:row-start-3 g3:row-end-4",
    "col-start-3 col-end-4 row-start-6 row-end-7 g3:col-start-6 g3:col-end-7 g3:row-start-3 g3:row-end-4",
  ];

  return (
    <GridCard
      className={cn(
        "col-start-1 col-end-2 row-start-2 row-end-4 h-[var(--grid-card-1x2)] w-[var(--grid-card-1x1)] [--grid-internal-rows:6]",
        "g2:col-start-2 g2:col-end-3 g2:row-start-1 g2:row-end-3",
        "g3:col-start-2 g3:col-end-4 g3:row-start-1 g3:row-end-2 g3:h-[var(--grid-card-1x1)] g3:w-[var(--grid-card-2x1)] g3:[--grid-internal-cols:6] g3:[--grid-internal-rows:3]",
        "g4:self-start",
        className
      )}
    >
      <GridCardSection
        className={cn(
          "col-start-1 col-end-4 row-start-1 row-end-4",
          "g3:col-start-1 g3:col-end-4 g3:row-start-1 g3:row-end-4"
        )}
      >
        <Image
          alt={avatarData.alt}
          className="h-full w-full rounded-md object-cover"
          height={400}
          priority={true}
          src={avatarData.url}
          width={400}
        />
      </GridCardSection>

      <GridCardSection
        className={cn(
          "col-start-1 col-end-4 row-start-4 row-end-6 flex h-full flex-col items-center justify-center px-4 md:px-8",
          "g3:col-start-4 g3:col-end-7 g3:row-start-1 g3:row-end-3"
        )}
      >
        <div className="mx-auto w-full max-w-3xl space-y-4">
          <h1
            className={
              "glass-text text-center font-bold text-2xl md:text-3xl lg:text-4xl"
            }
          >
            {userName}
          </h1>
          {userQuote && (
            <p
              className={
                "glass-text-secondary text-center text-base leading-relaxed"
              }
            >
              {userQuote}
            </p>
          )}
        </div>
      </GridCardSection>

      {socialLinks.map((link, index) => {
        const iconConfig = SOCIAL_ICON_MAP[link.platform];
        if (!iconConfig) {
          return null;
        }

        const IconComponent = iconConfig.icon;

        return (
          <GridCardNavItem
            className={cn(gridPositions[index])}
            key={link.url}
            variant="static"
          >
            <a
              aria-label={`${userName} on ${iconConfig.label}`}
              className="glass-focus-ring glass-hover-dim glass-text flex flex-col items-center justify-center gap-2"
              href={link.url}
              rel="noopener"
              target="_blank"
            >
              <IconComponent className="text-current" size={24} />
              <span className="text-sm">{iconConfig.label}</span>
            </a>
          </GridCardNavItem>
        );
      })}
    </GridCard>
  );
};
