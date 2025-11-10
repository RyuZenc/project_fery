/*  SERVICE WORKER — Dicoding Story  */

const CACHE_NAME = "dicoding-story-cache-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/app.bundle.js",
  "/app.css",
  "/images/icon-192.png",
  "/images/icon-512.png",
  "/manifest.json",
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

// ===============================
// 💾 IndexedDB — Simpan story offline
// ===============================
importScripts("https://cdn.jsdelivr.net/npm/idb@7/build/iife/index-min.js");

const dbPromise = idb.openDB("story-db", 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains("pending-stories")) {
      db.createObjectStore("pending-stories", {
        keyPath: "id",
        autoIncrement: true,
      });
    }
  },
});

// ===============================
// 🔁 Background Sync
// ===============================
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-new-story") {
    console.log("🔁 Background Sync aktif — mengunggah story offline...");
    event.waitUntil(uploadPendingStories());
  }
});

// ===============================
// 🚀 Fungsi Upload Pending Stories
// ===============================
async function uploadPendingStories() {
  const db = await dbPromise;
  const allStories = await db.getAll("pending-stories");

  if (allStories.length === 0) {
    console.log("📭 Tidak ada story pending untuk diupload.");
    return;
  }

  for (const story of allStories) {
    try {
      const formData = new FormData();
      formData.append("description", story.description);
      if (story.photo) formData.append("photo", story.photo);
      if (story.lat) formData.append("lat", story.lat);
      if (story.lon) formData.append("lon", story.lon);

      const res = await fetch("https://story-api.dicoding.dev/v1/stories", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${story.token}`,
        },
        body: formData,
      });

      const result = await res.json();
      if (!result.error) {
        console.log(`✅ Story "${story.description}" berhasil diupload.`);
        await db.delete("pending-stories", story.id);
      } else {
        console.warn(`⚠️ Gagal upload: ${result.message}`);
      }
    } catch (err) {
      console.error("❌ Error upload story offline:", err);
      // stop upload sisanya biar nanti sync ulang
      break;
    }
  }
}
