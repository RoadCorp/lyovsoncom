import {
  type SimpleIcon,
  siEffect,
  siNeon,
  siNextdotjs,
  siPayloadcms,
  siPostgresql,
  siReact,
  siResend,
  siTailwindcss,
  siTypescript,
  siUpstash,
  siVercel,
} from "simple-icons";

export interface TechInfo {
  /** Brand colour; omitted for black or white marks, which have no hue. */
  color?: string;
  icon?: Pick<SimpleIcon, "path">;
  name: string;
  /** For narrow card rails. */
  shortName?: string;
  url?: string;
}

const KNOWN_TECH: Record<string, Omit<TechInfo, "name">> = {
  codex: { url: "https://openai.com/codex/" },
  effect: { icon: siEffect, url: "https://effect.website" },
  grok: { url: "https://x.ai/grok" },
  neon: { icon: siNeon, url: "https://neon.com" },
  "next-intl": { url: "https://next-intl.dev" },
  "next.js": { icon: siNextdotjs, url: "https://nextjs.org" },
  "payload cms": {
    icon: siPayloadcms,
    shortName: "Payload",
    url: "https://payloadcms.com",
  },
  pgvector: { icon: siPostgresql, url: "https://github.com/pgvector/pgvector" },
  playwright: { url: "https://playwright.dev" },
  postgres: { icon: siPostgresql, url: "https://www.postgresql.org" },
  postgresql: { icon: siPostgresql, url: "https://www.postgresql.org" },
  react: { icon: siReact, url: "https://react.dev" },
  resend: { icon: siResend, url: "https://resend.com" },
  "tailwind css": {
    icon: siTailwindcss,
    shortName: "Tailwind",
    url: "https://tailwindcss.com",
  },
  typescript: { icon: siTypescript, url: "https://www.typescriptlang.org" },
  "upstash redis": {
    icon: siUpstash,
    shortName: "Upstash",
    url: "https://upstash.com",
  },
  vercel: { icon: siVercel, url: "https://vercel.com" },
  "vercel ai gateway": {
    icon: siVercel,
    shortName: "AI Gateway",
    url: "https://vercel.com/ai-gateway",
  },
  "vercel blob": { icon: siVercel, url: "https://vercel.com/storage/blob" },
};

const HEX_CHANNELS = /^([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i;
// Channels closer than this read as grey, so the pill keeps the site accent.
const MIN_HUE_SPREAD = 24;

function getBrandColor(hex?: string) {
  const channels = hex?.match(HEX_CHANNELS)?.slice(1);
  if (!(hex && channels)) {
    return;
  }
  const values = channels.map((channel) => Number.parseInt(channel, 16));
  return Math.max(...values) - Math.min(...values) < MIN_HUE_SPREAD
    ? undefined
    : `#${hex}`;
}

/** Icon, link and colour for a stack entry typed in the admin. */
export function getTechInfo(name: string): TechInfo {
  const known = KNOWN_TECH[name.trim().toLowerCase()];
  if (!known) {
    return { name };
  }
  const icon = known.icon as SimpleIcon | undefined;
  return {
    name,
    shortName: known.shortName,
    url: known.url,
    icon,
    color: getBrandColor(icon?.hex),
  };
}
