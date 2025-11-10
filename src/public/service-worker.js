/*  SERVICE WORKER — Dicoding Story  */

const CACHE_NAME = "dicoding-story-cache-v2";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/styles/styles.css",
  "/manifest.json",
  "/images/icon-192.png",
  "/images/icon-512.png",
];

// 📦 INSTALL — Caching awal
self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      for (const url of STATIC_ASSETS) {
        try {
          const response = await fetch(url);
          if (response.ok) await cache.put(url, response.clone());
          else console.warn(`⚠️ Gagal cache: ${url} (${response.status})`);
        } catch (err) {
          console.warn(`⚠️ Tidak bisa cache ${url}:`, err);
        }
      }
      console.log("✅ Semua asset berhasil dicache.");
    })()
  );
  self.skipWaiting();
});

// ===============================
// ♻️ ACTIVATE — Bersihkan cache lama
// ===============================
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
  );
  console.log("✅ Service Worker aktif!");
});

// ===============================
// 🌐 FETCH — Strategi cache-first
// ===============================
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then((networkResponse) => {
          if (
            !networkResponse ||
            networkResponse.status !== 200 ||
            networkResponse.type !== "basic"
          ) {
            return networkResponse;
          }

          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => caches.match("/offline.html"));
    })
  );
});

