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
