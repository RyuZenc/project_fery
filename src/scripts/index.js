// src/scripts/index.js (FULL FIX)

import "../styles/styles.css";
import App from "./pages/app";
import {
  subscribeUser,
  unsubscribeUser,
  checkSubscribed,
} from "./utils/pushManager";
import { IdbStories } from "./data/idb";

function getUser() {
  const data = localStorage.getItem("user");
  return data ? JSON.parse(data) : null;
}

document.addEventListener("DOMContentLoaded", async () => {
  const app = new App({ content: document.querySelector("#main-content") });

  // 🔹 Elemen DOM
  const loginBtn = document.querySelector("#loginBtn");
  const logoutBtn = document.querySelector("#logoutBtn");
  const subscribeBtn = document.getElementById("subscribeBtn");
  const unsubscribeBtn = document.getElementById("unsubscribeBtn");

  // 🔹 Update tampilan tombol login/logout
  function updateAuthButtons() {
    const user = getUser();
    if (loginBtn) loginBtn.style.display = user ? "none" : "inline-block";
    if (logoutBtn) logoutBtn.style.display = user ? "inline-block" : "none";
  }

  if (loginBtn)
    loginBtn.addEventListener("click", () => (window.location.hash = "/login"));
  if (logoutBtn)
    logoutBtn.addEventListener("click", () => {
      localStorage.removeItem("user");
      alert("Berhasil logout!");
      updateAuthButtons();
      window.location.hash = "/";
    });

  // 🔹 Service Worker + Push Notifications
  if ("serviceWorker" in navigator) {
    await navigator.serviceWorker.register("/service-worker.js");
    const subscribed = await checkSubscribed();

    if (subscribeBtn)
      subscribeBtn.style.display = subscribed ? "none" : "inline-block";
    if (unsubscribeBtn)
      unsubscribeBtn.style.display = subscribed ? "inline-block" : "none";

    if (subscribeBtn) {
      subscribeBtn.addEventListener("click", async () => {
        if ((await Notification.requestPermission()) !== "granted") {
          return alert("Izinkan notifikasi terlebih dahulu di browser!");
        }

        const user = getUser();
        if (!user?.token) {
          alert("Kamu harus login dulu untuk subscribe notifikasi!");
          return;
        }

        await subscribeUser(user.token);
        subscribeBtn.style.display = "none";
        if (unsubscribeBtn) unsubscribeBtn.style.display = "inline-block";
      });
    }

    if (unsubscribeBtn) {
      unsubscribeBtn.addEventListener("click", async () => {
        const user = getUser();
        if (!user?.token) {
          alert("Kamu harus login dulu untuk unsubscribe notifikasi!");
          return;
        }

        await unsubscribeUser(user.token);
        unsubscribeBtn.style.display = "none";
        if (subscribeBtn) subscribeBtn.style.display = "inline-block";
      });
    }
  }

  // 🔹 Offline Sync
  let isSyncing = false;

  /**
   * Fungsi untuk menyinkronkan cerita yang tertunda dari IndexedDB ke server.
   */
  async function syncOfflineStories() {
    if (isSyncing) return; // ⛔ Mencegah sync ganda jika event terpicu berdekatan
    isSyncing = true;

    const pending = await IdbStories.getPending();
    const user = getUser();

    if (pending.length > 0 && user?.token) {
      console.log(`Syncing ${pending.length} pending stories...`);
      let successCount = 0;

      for (const item of pending) {
        try {
          // Ubah base64 jadi Blob
          const blob = await (await fetch(item.photo)).blob();

          // Buat FormData untuk upload ke API Dicoding
          const formData = new FormData();
          formData.append("description", item.description);
          formData.append("photo", blob, "offline-upload.jpg");
          if (item.lat) formData.append("lat", item.lat);
          if (item.lon) formData.append("lon", item.lon);

          // Kirim ke server
          const res = await fetch("https://story-api.dicoding.dev/v1/stories", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${user.token}`,
            },
            body: formData,
          });

          if (res.ok) {
            // ✅ BERHASIL: Hapus item spesifik ini dari antrean IndexedDB
            await IdbStories.deletePendingStory(item.tempId);
            successCount++;
          } else {
            // ⚠️ GAGAL (Server Error): Jangan hapus, biarkan di antrean
            console.warn(`⚠️ Gagal upload cerita (ID: ${item.tempId}):`, await res.text());
          }
        } catch (err) {
          // ❌ GAGAL (Network Error): Jangan hapus, biarkan di antrean
          console.error(`❌ Error sync cerita offline (ID: ${item.tempId}):`, err);
        }
      } // Loop berakhir

      if (successCount > 0) {
        alert(`📤 ${successCount} cerita offline berhasil disinkronkan!`);
        await app.renderPage(); // "Refresh sendiri" setelah ada yang sukses
      }
    }

    isSyncing = false;
  }

  // 1. Pasang listener untuk saat KEMBALI online
  window.addEventListener("online", syncOfflineStories);

  // 2. Coba sync saat HALAMAN DIMUAT (jika sudah online)
  // Ini penting untuk menangani kasus interupsi/refresh.
  if (navigator.onLine) {
    await syncOfflineStories();
  }

  // 🔹 Render halaman awal & update tombol
  updateAuthButtons();
  await app.renderPage();
  window.addEventListener("hashchange", async () => {
    await app.renderPage();
    updateAuthButtons();
  });

  // 🔹 PWA Install Prompt (opsional)
  let deferredPrompt;
  window.addEventListener("beforeinstallprompt", (e) => {
    e.preventDefault();
    deferredPrompt = e;

    const installBtn = document.getElementById("installBtn");
    if (installBtn) {
      installBtn.style.display = "inline-block";
      installBtn.addEventListener("click", async () => {
        if (!deferredPrompt) return;
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        console.log("User response:", outcome);
        deferredPrompt = null;
        installBtn.style.display = "none";
      });
    }
  });
});