import type { ComponentType } from "react";
import { GridCard } from "@/components/grid/card";
import { GridCardNavItem } from "@/components/grid/card/nav/grid-card-nav-item";
import { LinkedInIcon } from "@/components/linked-in-icon";
import { cn } from "@/lib/utils";
import type { SocialIconProps } from "@/utilities/social-icons";
import {
  AppleMusicIcon,
  GitHubIcon,
  InstagramIcon,
  SoundCloudIcon,
  SpotifyIcon,
  TikTokIcon,
  XIcon,
  YouTubeIcon,
} from "@/utilities/social-icons";

const MAX_STAGGER_INDEX = 6;

const GRID_POSITIONS = [
  "row-start-1 row-end-2 col-start-1 col-end-2",
  "row-start-1 row-end-2 col-start-2 col-end-3",
  "row-start-1 row-end-2 col-start-3 col-end-4",
  "row-start-2 row-end-3 col-start-1 col-end-2",
  "row-start-2 row-end-3 col-start-2 col-end-3",
  "row-start-2 row-end-3 col-start-3 col-end-4",
  "row-start-3 row-end-4 col-start-1 col-end-2",
  "row-start-3 row-end-4 col-start-2 col-end-3",
  "row-start-3 row-end-4 col-start-3 col-end-4",
] as const;

interface SocialLink {
  icon: ComponentType<SocialIconProps>;
  name: string;
  url: string;
}

function getStaggerClass(index: number): string {
  return `reveal-stagger-${Math.min(index + 1, MAX_STAGGER_INDEX)}`;
}

const socialLinks: SocialLink[] = [
  {
    name: "X (Twitter)",
    url: "https://x.com/rafalyovson",
    icon: XIcon,
  },
  {
    name: "Instagram",
    url: "https://instagram.com/rafalyovson",
    icon: InstagramIcon,
  },
  {
    name: "GitHub",
    url: "https://github.com/rafalyovson",
    icon: GitHubIcon,
  },
  {
    name: "LinkedIn",
    url: "https://linkedin.com/in/lyovson",
    icon: LinkedInIcon,
  },
  {
    name: "YouTube",
    url: "https://youtube.com/@lyovson",
    icon: YouTubeIcon,
  },
  {
    name: "TikTok",
    url: "https://tiktok.com/@lyovson",
    icon: TikTokIcon,
  },
  {
    name: "Spotify",
    url: "https://open.spotify.com/user/lyovson",
    icon: SpotifyIcon,
  },
  {
    name: "Apple Music",
    url: "https://music.apple.com/profile/lyovson",
    icon: AppleMusicIcon,
  },
  {
    name: "SoundCloud",
    url: "https://soundcloud.com/lyovson",
    icon: SoundCloudIcon,
  },
];

export function GridCardUserSocial({ className }: { className?: string }) {
  return (
    <GridCard className={className}>
      {socialLinks.map((link, index) => {
        const IconComponent = link.icon;

        return (
          <GridCardNavItem
            className={cn(GRID_POSITIONS[index], getStaggerClass(index))}
            key={link.name}
            variant="static"
          >
            <a
              aria-label={`Visit ${link.name} profile`}
              className="ui-focus-ring ui-hover-dim ui-interactive tone-heading block"
              href={link.url}
              rel="noopener noreferrer"
              target="_blank"
            >
              <IconComponent className="block" size={32} />
            </a>
          </GridCardNavItem>
        );
      })}
    </GridCard>
  );
}
