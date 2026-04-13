import {
  SiFacebook,
  SiGithub,
  SiInstagram,
  SiX,
  SiYoutube,
} from "@icons-pack/react-simple-icons";
import { Globe } from "lucide-react";
import type { ComponentType } from "react";
import { LinkedInIcon } from "@/components/LinkedInIcon";

interface IconProps {
  className?: string;
  color?: string;
  size?: number;
}

interface SocialIconConfig {
  icon: ComponentType<IconProps>;
  iconType: "simple" | "lucide";
  label: string;
}

export const SOCIAL_ICON_MAP: Record<string, SocialIconConfig> = {
  x: {
    icon: SiX,
    label: "X",
    iconType: "simple",
  },
  linkedin: {
    icon: LinkedInIcon,
    label: "LinkedIn",
    iconType: "lucide",
  },
  github: {
    icon: SiGithub,
    label: "GitHub",
    iconType: "simple",
  },
  instagram: {
    icon: SiInstagram,
    label: "Instagram",
    iconType: "simple",
  },
  facebook: {
    icon: SiFacebook,
    label: "Facebook",
    iconType: "simple",
  },
  youtube: {
    icon: SiYoutube,
    label: "YouTube",
    iconType: "simple",
  },
  website: {
    icon: Globe,
    label: "Website",
    iconType: "lucide",
  },
};

export type { SocialIconConfig };
