import "leaflet/dist/leaflet.css";
import { StoryPresenter } from "../../presenters/story-presenter.js";
import { IdbStories } from "../../data/idb.js";
import { applyPageTransition } from "../../utils/transition.js";
import L from "../../utils/leaflet-icons";

const AddStoryPage = {
  async render() {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      window.location.hash = "#/login";
      return "";
    }

    return `
      <section class="container">
        <div class="add-story-container view-transition-page">
          <h1>Tambah Cerita Baru</h1>
          <a href="/#" class="back-link">← Kembali ke Beranda</a>
          
          <form id="addStoryForm">
            <div class="form-group">
              <label for="description">Deskripsi</label>
              <textarea 
                id="description" 
                name="description" 
                rows="5" 
                required
                placeholder="Ceritakan pengalaman Anda..."
              ></textarea>
            </div>

            <div class="form-group">
              <label for="photo">Foto</label>
              <div class="photo-input-container">
                <input type="file" id="photo" name="photo" accept="image/*" />
                <button type="button" id="openCameraBtn" class="btn-secondary">📷 Buka Kamera</button>
                <button type="button" id="closeCameraBtn" class="btn-secondary" style="display: none;">❌ Tutup Kamera</button>
              </div>
              <div id="cameraContainer" style="display: none; margin-top: 15px;">
                <video id="cameraStream" autoplay playsinline style="width: 100%; max-width: 500px; border-radius: 8px; border: 2px solid #ddd;"></video>
                <div style="margin-top: 10px;">
                  <button type="button" id="capturePhotoBtn" class="btn-primary">📸 Ambil Foto</button>
                </div>
              </div>
              <div id="photoPreview" class="photo-preview"></div>
            </div>

            <div class="form-group">
              <label style="display: flex; align-items: center; gap: 8px;">
                <input type="checkbox" id="useLocation" style="width: auto;" />
                <span>Tambahkan lokasi</span>
              </label>
              <div id="locationMapContainer" style="display: none; margin-top: 15px;">
                <p>📍 Klik pada peta untuk memilih lokasi</p>
                <div id="locationMap" style="height: 400px; border-radius: 8px; border: 2px solid #ddd;"></div>
                <p id="locationInfo" class="location-info" style="margin-top: 10px;"></p>
              </div>
            </div>

            <button type="submit" class="btn-primary">Posting Cerita</button>
          </form>
        </div>
      </section>
    `;
  },

  async afterRender() {
    applyPageTransition();
    const user = JSON.parse(localStorage.getItem("user"));
    this.presenter = new StoryPresenter(this);

    // === Ambil Elemen ===
    const openCameraBtn = document.getElementById("openCameraBtn");
    const closeCameraBtn = document.getElementById("closeCameraBtn");
    const video = document.getElementById("cameraStream");
    const capturePhotoBtn = document.getElementById("capturePhotoBtn");
    const cameraContainer = document.getElementById("cameraContainer");
    const photoPreview = document.getElementById("photoPreview");
    const useLocation = document.getElementById("useLocation");
    const locationMapContainer = document.getElementById(
      "locationMapContainer"
    );
    const locationInfo = document.getElementById("locationInfo");
    const form = document.getElementById("addStoryForm");

    if (form.dataset.listenerAttached) {
      return;
    }

    form.dataset.listenerAttached = "true";

    // === Logika Kamera ===
    let stream = null;
    this.capturedBlob = null;

    openCameraBtn.addEventListener("click", async () => {
      try {
        const streamData = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        stream = streamData;
        video.srcObject = stream;
        cameraContainer.style.display = "block";
        openCameraBtn.style.display = "none";
        closeCameraBtn.style.display = "inline-block";
      } catch {
        alert("Tidak dapat mengakses kamera.");
      }
    });

    closeCameraBtn.addEventListener("click", () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
      cameraContainer.style.display = "none";
      openCameraBtn.style.display = "inline-block";
      closeCameraBtn.style.display = "none";
    });

    capturePhotoBtn.addEventListener("click", () => {
      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        this.capturedBlob = blob;
        photoPreview.innerHTML = `<img src="${URL.createObjectURL(
          blob
        )}" alt="Preview Foto" style="max-width: 100%; border-radius: 8px;">`;
      }, "image/jpeg");
    });

    // === Logika Lokasi ===
    let map, marker;
    this.selectedLocation = null;

    useLocation.addEventListener("change", async () => {
      if (useLocation.checked) {
        locationMapContainer.style.display = "block";
        if (!map) {
          map = L.map("locationMap").setView([-2.5489, 118.0149], 5);
          L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
            attribution: "© OpenStreetMap",
          }).addTo(map);

          map.on("click", async (e) => {
            const { lat, lng } = e.latlng;
            if (marker) marker.remove();
            marker = L.marker([lat, lng]).addTo(map);
            this.selectedLocation = { lat, lng };
            locationInfo.textContent = `✅ Lokasi dipilih: ${lat.toFixed(
              6
            )}, ${lng.toFixed(6)}`;
          });
        }
      } else {
        locationMapContainer.style.display = "none";
        locationInfo.textContent = "";
        if (marker) marker.remove();
        this.selectedLocation = null;
      }
    });

    // === Logika Submit Cerita ===
    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const description = document.getElementById("description").value.trim();
      const photoInput = document.getElementById("photo");
      const photo = photoInput.files[0] || this.capturedBlob;
      const lat = this.selectedLocation?.lat;
      const lon = this.selectedLocation?.lng;

      if (!photo) return alert("Harap unggah atau ambil foto terlebih dahulu.");
      if (!description) return alert("Deskripsi tidak boleh kosong.");

      try {
        // 🔹 Jika online, langsung kirim ke server
        if (navigator.onLine) {
          await this.presenter.addStory({
            token: user.token,
            description,
            photo,
            lat,
            lon,
          });
          await sendPushToLatestStory(user.token);
          alert("✅ Cerita berhasil dikirim!");
        }
        // 🔹 Jika offline, simpan dulu di IndexedDB
        else {
          await IdbStories.addPending({
            description,
            lat,
            lon,
            photo: await blobToBase64(photo),
          });
          alert(
            "📦 Cerita disimpan offline. Akan dikirim otomatis saat online!"
          );
        }

        location.hash = "/";
      } catch (err) {
        alert("Terjadi kesalahan: " + err.message);
      }
    });
  },

  showSuccess(msg) {
    alert(msg);
    location.hash = "/";
  },

  showError(msg) {
    alert(`Terjadi kesalahan: ${msg}`);
  },
};

// === Utility: Convert blob ke base64 untuk disimpan offline ===
async function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// === Push Notifikasi ke Cerita Terbaru ===
async function sendPushToLatestStory(token) {
  try {
    const res = await fetch(
      "https://story-api.dicoding.dev/v1/stories?page=1&size=1",
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    const result = await res.json();
    const latest = result.listStory?.[0];
    if (!latest) return;

    const registration = await navigator.serviceWorker.ready;
    registration.showNotification("Cerita Baru!", {
      body: `Dari ${latest.name}: ${latest.description}`,
      icon: "/images/icon-192.png",
      badge: "/images/icon-192.png",
      data: { url: `/#/detail/${latest.id}` },
    });
  } catch (err) {
    console.warn("Gagal kirim notifikasi:", err);
  }
}

export default AddStoryPage;