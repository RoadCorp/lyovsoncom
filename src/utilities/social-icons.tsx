import { Globe } from "lucide-react";
import type { ComponentType } from "react";
import type { SimpleIcon } from "simple-icons";
import {
  siApplemusic,
  siFacebook,
  siGithub,
  siInstagram,
  siSoundcloud,
  siSpotify,
  siTiktok,
  siX,
  siYoutube,
} from "simple-icons";
import { LinkedInIcon } from "@/components/linked-in-icon";

export interface SocialIconProps {
  className?: string;
  color?: string;
  size?: number;
}

function SimpleIconSvg({
  className,
  color = "currentColor",
  icon,
  size = 24,
}: SocialIconProps & { icon: Pick<SimpleIcon, "path"> }) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill={color}
      height={size}
      viewBox="0 0 24 24"
      width={size}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={icon.path} />
    </svg>
  );
}

export function AppleMusicIcon(props: SocialIconProps) {
  return <SimpleIconSvg icon={siApplemusic} {...props} />;
}

export function FacebookIcon(props: SocialIconProps) {
  return <SimpleIconSvg icon={siFacebook} {...props} />;
}

export function GitHubIcon(props: SocialIconProps) {
  return <SimpleIconSvg icon={siGithub} {...props} />;
}

export function InstagramIcon(props: SocialIconProps) {
  return <SimpleIconSvg icon={siInstagram} {...props} />;
}

export function SoundCloudIcon(props: SocialIconProps) {
  return <SimpleIconSvg icon={siSoundcloud} {...props} />;
}

export function SpotifyIcon(props: SocialIconProps) {
  return <SimpleIconSvg icon={siSpotify} {...props} />;
}

export function TikTokIcon(props: SocialIconProps) {
  return <SimpleIconSvg icon={siTiktok} {...props} />;
}

export function XIcon(props: SocialIconProps) {
  return <SimpleIconSvg icon={siX} {...props} />;
}

export function YouTubeIcon(props: SocialIconProps) {
  return <SimpleIconSvg icon={siYoutube} {...props} />;
}

interface SocialIconConfig {
  icon: ComponentType<SocialIconProps>;
  label: string;
}

export const SOCIAL_ICON_MAP: Record<string, SocialIconConfig> = {
  x: {
    icon: XIcon,
    label: "X",
  },
  linkedin: {
    icon: LinkedInIcon,
    label: "LinkedIn",
  },
  github: {
    icon: GitHubIcon,
    label: "GitHub",
  },
  instagram: {
    icon: InstagramIcon,
    label: "Instagram",
  },
  facebook: {
    icon: FacebookIcon,
    label: "Facebook",
  },
  youtube: {
    icon: YouTubeIcon,
    label: "YouTube",
  },
  website: {
    icon: Globe,
    label: "Website",
  },
};

export type { SocialIconConfig };
