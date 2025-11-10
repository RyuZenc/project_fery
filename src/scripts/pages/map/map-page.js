import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { StoryAPI } from "../../data/story-api.js";

export const MapPage = {
  async render() {
    return `
      <section class="container map-page">
        <h1 class="page-title">🗺️ Peta Cerita Pengguna</h1>
        <div id="loadingMap" class="loading">Memuat peta...</div>
        <div id="map" style="height: 500px; border-radius: 10px; display:none;"></div>
      </section>
    `;
  },

  async afterRender() {
    const loadingEl = document.getElementById("loadingMap");
    const mapEl = document.getElementById("map");

    if (!mapEl) {
      console.error("❌ Elemen #map tidak ditemukan.");
      loadingEl.textContent = "Gagal memuat peta: elemen tidak ditemukan.";
      return;
    }

    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user?.token)
        throw new Error("Token tidak ditemukan, silakan login ulang.");

      // 🔹 FIX TERPENTING: Hapus map lama & ganti elemen div-nya
      if (window._storyMap) {
        window._storyMap.remove();
        delete window._storyMap;
      }

      // Hapus elemen lama dan buat ulang agar Leaflet tidak konflik
      const newMapEl = mapEl.cloneNode(false);
      mapEl.parentNode.replaceChild(newMapEl, mapEl);

      // 🔹 Ambil data cerita dari API
      const stories = await StoryAPI.getAllStories(user.token);
      if (!Array.isArray(stories)) throw new Error("Data cerita tidak valid.");

      // 🔹 Tampilkan peta
      loadingEl.style.display = "none";
      newMapEl.style.display = "block";

      const map = L.map(newMapEl).setView([-2.5489, 118.0149], 5);

      const lightLayer = L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        { attribution: "© OpenStreetMap contributors" }
      ).addTo(map);

      const darkLayer = L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png",
        { attribution: "© CartoDB" }
      );

      L.control
        .layers({ "🌞 Terang": lightLayer, "🌙 Gelap": darkLayer })
        .addTo(map);

      function createMarkerIcon(imageUrl) {
        return L.icon({
          iconUrl: imageUrl || "assets/images/default-marker.png",
          iconSize: [50, 50],
          iconAnchor: [25, 50],
          popupAnchor: [0, -45],
          className: "story-marker-icon",
        });
      }

      function addStoryMarker(story) {
        const lat = parseFloat(story.lat);
        const lon = parseFloat(story.lon);
        if (!lat || !lon || isNaN(lat) || isNaN(lon)) return;

        const popupContent = `
          <div style="text-align:center;">
            <img src="${story.photoUrl}" alt="Foto"
                 style="width:100px; height:100px; border-radius:8px; object-fit:cover;">
            <h3 style="margin:5px 0;">${story.name || "Tanpa Nama"}</h3>
            <p style="font-size:12px; color:#555;">${
              story.description || "Tanpa deskripsi"
            }</p>
            <a href="#/detail/${story.id}"
               style="color:#ff5c8a; text-decoration:none; font-weight:600;">Lihat Detail</a>
          </div>
        `;

        const icon = createMarkerIcon(story.photoUrl);
        L.marker([lat, lon], { icon }).addTo(map).bindPopup(popupContent);
      }

      if (stories.length > 0) {
        stories.forEach(addStoryMarker);
      } else {
        L.popup()
          .setLatLng([-2.5489, 118.0149])
          .setContent("Belum ada cerita dengan lokasi.")
          .openOn(map);
      }

      window._storyMap = map;

      window.addEventListener("story:added", (e) => {
        const story = e.detail;
        if (story) addStoryMarker(story);
      });

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          ({ coords }) => {
            const { latitude, longitude } = coords;
            L.marker([latitude, longitude], { title: "Lokasi Anda" })
              .addTo(map)
              .bindPopup("<b>Lokasi Anda</b>")
              .openPopup();
            map.setView([latitude, longitude], 10);
          },
          () => console.warn("Gagal mendapatkan lokasi pengguna")
        );
      }
    } catch (error) {
      loadingEl.textContent = `Terjadi kesalahan: ${error.message}`;
      console.error("❌ Error di MapPage:", error);
    }
  },
};
