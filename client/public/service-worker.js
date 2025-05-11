const CACHE_NAME = "app-cache-v5";
const STATIC_FILES = [
  "/",
  "/index.html",
  "/manifest.json",
  "/logo192.png",
  "/logo512.png"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_FILES);
    }).catch((error) => console.error("Failed to cache static files:", error))
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 🔥 Cache dynamic assets like /static/js/main.xxxxx.js
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).then((liveResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          if (event.request.url.includes("/static/")) {
            cache.put(event.request, liveResponse.clone()); // Cache dynamic assets
          }
          return liveResponse;
        });
      });
    }).catch(() => caches.match("/index.html")) // Fallback to index.html if offline
  );
});
