const LEGACY_CACHE_NAMES = ["user-cache-v1"];
const LEGACY_CACHE_PREFIXES = ["lyovson-cache-"];

function isLegacyCacheName(cacheName) {
  if (LEGACY_CACHE_NAMES.includes(cacheName)) {
    return true;
  }

  return LEGACY_CACHE_PREFIXES.some((prefix) => cacheName.startsWith(prefix));
}

self.addEventListener("install", (event) => {
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const cacheKeys = await caches.keys();
      const legacyCacheKeys = cacheKeys.filter(isLegacyCacheName);

      await Promise.allSettled(
        legacyCacheKeys.map((cacheKey) => caches.delete(cacheKey))
      );

      await self.clients.claim();

      const clients = await self.clients.matchAll({
        type: "window",
        includeUncontrolled: true,
      });

      await Promise.allSettled(
        clients.map((client) =>
          "navigate" in client ? client.navigate(client.url) : Promise.resolve()
        )
      );

      await self.registration.unregister();
    })()
  );
});
