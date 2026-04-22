import canUseDOM from "./canUseDOM";
import { getCanonicalSiteOrigin, getRuntimeSiteOrigin } from "./site-config";

export const getServerSideURL = () => {
  return getRuntimeSiteOrigin();
};

export const getCanonicalURL = (path?: string) => {
  if (!path) {
    return getCanonicalSiteOrigin();
  }

  return new URL(path, getCanonicalSiteOrigin()).toString();
};

export const getClientSideURL = () => {
  if (canUseDOM) {
    const protocol = window.location.protocol;
    const domain = window.location.hostname;
    const port = window.location.port;

    return `${protocol}//${domain}${port ? `:${port}` : ""}`;
  }

  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  }

  return process.env.NEXT_PUBLIC_SERVER_URL || "";
};
