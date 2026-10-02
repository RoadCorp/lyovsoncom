import { getRuntimeSiteOrigin } from "./site-config";

// Runtime (deployment) origin for Payload admin, CORS and previews. Canonical
// public URLs come from getCanonicalSiteOrigin() and absoluteUrl() in routes.ts.
export const getServerSideURL = () => {
  return getRuntimeSiteOrigin();
};
