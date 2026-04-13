const LEGACY_CACHE_NAMES = ["user-cache-v1"] as const;
const LEGACY_CACHE_PREFIXES = ["lyovson-cache-"] as const;
const LEGACY_SERVICE_WORKER_SUFFIXES = ["/sw.js"] as const;

function isLegacyServiceWorker(scriptURL: string) {
  return LEGACY_SERVICE_WORKER_SUFFIXES.some((suffix) =>
    scriptURL.endsWith(suffix)
  );
}

function isLegacyCache(cacheName: string) {
  if (
    LEGACY_CACHE_NAMES.includes(
      cacheName as (typeof LEGACY_CACHE_NAMES)[number]
    )
  ) {
    return true;
  }

  return LEGACY_CACHE_PREFIXES.some((prefix) => cacheName.startsWith(prefix));
}

export async function cleanupLegacyBrowserState() {
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
}

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
