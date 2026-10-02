// Runs inline in <head> on every page, before hydration. public/sw.js is the
// matching kill-switch for browsers that still have the old worker installed.
export const LEGACY_BROWSER_CLEANUP_SCRIPT = `(() => {
  const legacyCacheNames = ["user-cache-v1"];
  const legacyCachePrefixes = ["lyovson-cache-"];
  const legacyServiceWorkerSuffixes = ["/sw.js"];

  const isLegacyServiceWorker = (scriptURL) =>
    legacyServiceWorkerSuffixes.some((suffix) => scriptURL.endsWith(suffix));

  const isLegacyCache = (cacheName) =>
    legacyCacheNames.includes(cacheName) ||
    legacyCachePrefixes.some((prefix) => cacheName.startsWith(prefix));

  const cleanup = async () => {
    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      const legacyRegistrations = registrations.filter((registration) => {
        const activeScriptURL =
          registration.active?.scriptURL ??
          registration.waiting?.scriptURL ??
          registration.installing?.scriptURL;

        return activeScriptURL ? isLegacyServiceWorker(activeScriptURL) : false;
      });

      await Promise.allSettled(
        legacyRegistrations.map((registration) => registration.unregister())
      );
    }

    if ("caches" in window) {
      const cacheKeys = await caches.keys();
      const legacyCacheKeys = cacheKeys.filter(isLegacyCache);

      await Promise.allSettled(
        legacyCacheKeys.map((cacheKey) => caches.delete(cacheKey))
      );
    }
  };

  cleanup().catch(() => {
    // Cleanup is best-effort and should never block rendering.
  });
})();`;
