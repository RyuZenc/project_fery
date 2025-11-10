// src/scripts/pages/detail/detail-page.js
import { showFormattedDate } from "../../utils/index";
import { parseActivePathname } from "../../routes/url-parser";
import { StoryAPI as StoryApi } from "../../data/story-api.js";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const DetailPage = {
  async render() {
    return `
      <section class="container main-content view-transition-page">
        <h1 class="page-title">📖 Detail Cerita</h1>
        <div id="storyDetail" class="story-detail-container">
          <p class="loading-text">Memuat detail story...</p>
        </div>
      </section>
    `;
  },

  async afterRender() {
    const { id } = parseActivePathname();
    const detailContainer = document.querySelector("#storyDetail");

    try {
      const response = await StoryApi.getDetailStory(id);
      const story = response.story;

      if (!story) {
        detailContainer.innerHTML = `<p>Data story tidak ditemukan.</p>`;
        return;
      }

      // Struktur HTML lebih rapi dan stylish
      detailContainer.innerHTML = `
        <article class="story-detail-card">
          <div class="story-image-wrapper">
            <img src="${story.photoUrl}" alt="Foto ${
        story.name
      }" class="story-image" />
          </div>

          <div class="story-info">
            <div class="story-user">
              <img 
                src="https://ui-avatars.com/api/?name=${encodeURIComponent(
                  story.name
                )}" 
                alt="${story.name}" 
                class="user-avatar" 
              />
              <div>
                <h3 class="user-name">${story.name}</h3>
                <p class="story-date">${showFormattedDate(story.createdAt)}</p>
              </div>
            </div>

            <p class="story-description">${story.description}</p>

            <div id="storyMap" class="story-map"></div>
          </div>
        </article>
      `;

      // Render map jika ada lat/lon
      if (story.lat && story.lon) {
        const map = L.map("storyMap").setView([story.lat, story.lon], 13);
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
          attribution: "© OpenStreetMap",
        }).addTo(map);
        L.marker([story.lat, story.lon])
          .addTo(map)
          .bindPopup(`Lokasi cerita: ${story.name}`)
          .openPopup();
      } else {
        document.getElementById(
          "storyMap"
        ).innerHTML = `<p>Lokasi tidak tersedia.</p>`;
      }
    } catch (error) {
      console.error("Gagal memuat detail story:", error);
      detailContainer.innerHTML = `<p>Terjadi kesalahan saat mengambil data dari server.</p>`;
    }
  },
};

export default DetailPage;
