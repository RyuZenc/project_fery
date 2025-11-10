// src/scripts/pages/app.js
import routes from "../routes/routes";
import { getActiveRoute } from "../routes/url-parser";

class App {
  #content = null;
  #drawerButton = null;
  #navigationDrawer = null;

  constructor({ navigationDrawer, drawerButton, content }) {
    this.#content = content;
    this.#drawerButton = drawerButton;
    this.#navigationDrawer = navigationDrawer;

    this._setupDrawer();
  }

  _setupDrawer() {
    if (!this.#drawerButton || !this.#navigationDrawer) return;

    // 🔹 Tombol toggle drawer
    this.#drawerButton.addEventListener("click", () => {
      this.#navigationDrawer.classList.toggle("open");
    });

    // 🔹 Tutup drawer saat klik link navigasi
    this.#navigationDrawer.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        this.#navigationDrawer.classList.remove("open");
      });
    });

    // 🔹 Tutup drawer jika klik area luar
    document.addEventListener("click", (e) => {
      if (
        this.#navigationDrawer.classList.contains("open") &&
        !this.#navigationDrawer.contains(e.target) &&
        !this.#drawerButton.contains(e.target)
      ) {
        this.#navigationDrawer.classList.remove("open");
      }
    });
  }

  async renderPage() {
    const url = getActiveRoute();
    const page = routes[url] || routes["/404"];

    try {
      // 🔹 Render halaman utama
      const renderedPage = await page.render();
      this.#content.innerHTML = renderedPage;

      // 🔹 Jalankan afterRender jika ada
      if (page.afterRender) await page.afterRender();

      // 🔹 Aksesibilitas: fokus ke konten utama
      const mainContent = this.#content.querySelector(
        "main, section, article, h1, h2"
      );
      if (mainContent) mainContent.setAttribute("tabindex", "-1");
      mainContent?.focus();

      // 🔹 Scroll ke atas saat pindah halaman
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("❌ Gagal render halaman:", err);
      this.#content.innerHTML = `
        <section class="container error-page">
          <h1>Terjadi Kesalahan</h1>
          <p>${err.message || "Tidak dapat memuat halaman"}</p>
        </section>
      `;
    }
  }
}

export default App;
