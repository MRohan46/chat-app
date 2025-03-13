const CACHE_NAME = "app-cache-v2";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192x192.png",
  "/icon-512x512.png",
  "/static/css/main.css",
  "/static/js/bundle.js"
];

// Install Service Worker and Cache Assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToCache).catch((error) => {
          console.error("Failed to cache some files:", error);
        });
      })
  );
  self.skipWaiting(); // Force activation
});

// Activate Service Worker and Remove Old Cache
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Deleting old cache:", cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim(); // Take control of clients immediately
});

// Fetch Assets from Cache (Offline Support)
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request).catch(() => {
        return caches.match("/index.html"); // Serve fallback page if offline
      });
    })
  );
});
