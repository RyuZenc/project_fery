import { StoryAPI } from "../../data/story-api.js";
import { IdbStories } from "../../data/idb.js";

const HomePage = {
  allStories: [],
  visibleCount: 10,
  batchSize: 10,
  isLoading: false,

  async render() {
    const pageContent = `
      <section class="container view-transition-page">
        <h1 class="page-title" style="view-transition-name: pageTitle">Cerita Terbaru</h1>
        <p id="connectionStatus" class="connection-status"></p>
        <a href="#/add" class="btn-primary">➕ Tambah Cerita Baru</a>

        <div id="storyList" class="story-list" style="view-transition-name: storyList">
          <p class="loading-text">Memuat cerita...</p>
        </div>

        <div class="load-more-container">
          <button id="loadMoreBtn" class="btn-load-more">Tampilkan Lebih Banyak</button>
        </div>
      </section>
    `;

    const app = document.querySelector("#app");
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        if (app) app.innerHTML = pageContent;
      });
    } else {
      if (app) app.innerHTML = pageContent;
    }

    return pageContent;
  },

  async afterRender() {
    const storyList = document.getElementById("storyList");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const connectionStatus = document.getElementById("connectionStatus");
    const user = JSON.parse(localStorage.getItem("user"));

    // 🔹 Cek login
    if (!user?.token) {
      storyList.innerHTML = `<p>Silakan login terlebih dahulu untuk melihat cerita.</p>`;
      loadMoreBtn.style.display = "none";
      return;
    }

    function updateStatus() {
      const connectionStatus = document.getElementById("connectionStatus");
      if (!connectionStatus) return;

      if (navigator.onLine) {
        connectionStatus.textContent = "🟢 Online";
        connectionStatus.classList.remove("offline");
        connectionStatus.classList.add("online");
      } else {
        connectionStatus.textContent = "🔴 Offline (menampilkan data cache)";
        connectionStatus.classList.remove("online");
        connectionStatus.classList.add("offline");
      }
    }
    updateStatus();
    window.addEventListener("online", updateStatus);
    window.addEventListener("offline", updateStatus);

    // 🔹 Ambil data dari API atau IndexedDB
    try {
      storyList.innerHTML = `<p class="loading-text">Mengambil data cerita...</p>`;
      const stories = await StoryAPI.getAllStories(user.token);

      // ✅ Simpan hasil API ke IndexedDB untuk offline
      for (const story of stories) {
        await IdbStories.putStory(story);
      }

      this.allStories = stories;
      this.renderStories();
      loadMoreBtn.addEventListener("click", () => this.loadMore());
    } catch (err) {
      console.warn("Gagal mengambil data online:", err);

      // 🔹 Ambil data dari IndexedDB (offline mode)
      const cachedStories = await IdbStories.getAll();
      if (cachedStories.length > 0) {
        storyList.innerHTML = `<p>⚠️ Tidak dapat memuat dari server, menampilkan data offline.</p>`;
        this.allStories = cachedStories;
        this.renderStories();
      } else {
        const errorMsg = err.message.includes("<")
          ? "Respons server tidak valid (HTML diterima, bukan JSON)"
          : err.message;
        storyList.innerHTML = `<p style="color:red;">Gagal memuat cerita: ${errorMsg}</p>`;
      }

      loadMoreBtn.style.display = "none";
    }
  },

  renderStories() {
    const storyList = document.getElementById("storyList");
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    const visibleStories = this.allStories.slice(0, this.visibleCount);

    storyList.innerHTML = visibleStories
      .map(
        (story) => `
        <div class="story-card" tabindex="0" style="view-transition-name: story-${
          story.id
        }">
          <img src="${story.photoUrl}" alt="Foto ${
          story.name
        }" class="story-card-img" />
          <div class="story-card-content">
            <h2 class="story-card-title">${story.name}</h2>
            <p class="story-card-desc">${story.description}</p>
            <div class="story-meta">
              <small>📅 ${new Date(
                story.createdAt
              ).toLocaleDateString()}</small>
              ${
                story.lat && story.lon
                  ? `<small>📍 <a href="#/detail/${story.id}" class="map-link">Lihat Lokasi</a></small>`
                  : `<small>📍 Lokasi tidak tersedia</small>`
              }
            </div>
            <a href="#/detail/${story.id}" class="btn-detail">Lihat Detail</a>
          </div>
        </div>
      `
      )
      .join("");

    // 🔹 Tombol load-more
    if (this.allStories.length === 0) {
      loadMoreBtn.style.display = "none";
    } else {
      loadMoreBtn.style.display = "block";
      loadMoreBtn.textContent =
        this.visibleCount >= this.allStories.length
          ? "Muat Ulang Cerita"
          : "Tampilkan Lebih Banyak";
    }
  },

  async loadMore() {
    const loadMoreBtn = document.getElementById("loadMoreBtn");
    if (this.isLoading) return;

    this.isLoading = true;
    loadMoreBtn.textContent = "Memuat...";
    loadMoreBtn.disabled = true;

    setTimeout(async () => {
      if (this.visibleCount >= this.allStories.length) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (user?.token && navigator.onLine) {
          try {
            const updatedStories = await StoryAPI.getAllStories(user.token);

            // ✅ Perbarui IndexedDB juga
            for (const story of updatedStories) {
              await IdbStories.putStory(story);
            }

            this.allStories = updatedStories;
            this.visibleCount = updatedStories.length;
          } catch (err) {
            console.error("Gagal memuat ulang cerita:", err);
          }
        }
      } else {
        this.visibleCount += this.batchSize;
      }

      this.renderStories();
      this.isLoading = false;
      loadMoreBtn.textContent = "Tampilkan Lebih Banyak";
      loadMoreBtn.disabled = false;
    }, 400);
  },
};

export default HomePage;
