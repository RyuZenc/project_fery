import { applyPageTransition } from "../utils/transition.js";

const Navbar = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  return `
    <header class="navbar view-transition-page">
      <div class="container navbar-container">
        <a href="#/" class="brand view-transition-name:brand">📖 Dicoding Stories</a>

        <nav class="nav-links">
          <a href="#/" class="nav-link" data-link>Beranda</a>
          ${
            user
              ? `<a href="#/add" class="nav-link" data-link>Tambah Story</a>`
              : ""
          }
          <a href="#/about" class="nav-link" data-link>Tentang</a>
          <a href="#/map" class="nav-link" data-link>Map</a>
          <button id="subscribeBtn" class="nav-button">
            Aktifkan Notifikasi
          </button>
          <button id="unsubscribeBtn" class="nav-button" style="display: none">
            Nonaktifkan Notifikasi
          </button>
          
        </nav>

        <div class="auth-buttons">
          ${
            user
              ? `<button id="logoutBtn" class="btn btn-logout">Logout (${user.name})</button>`
              : `<a href="#/login" class="btn btn-login" data-link>Login</a>`
          }
        </div>
      </div>
    </header>
  `;
};

export const initNavbarEvents = () => {
  // Navigasi halus antar halaman
  document.querySelectorAll("[data-link]").forEach((link) => {
    link.addEventListener("click", (event) => {
      event.preventDefault();
      const href = link.getAttribute("href");
      applyPageTransition(() => {
        window.location.hash = href;
      });
    });
  });

  // Logout dengan transisi halus
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      applyPageTransition(() => {
        localStorage.removeItem("user");
        window.location.hash = "/login";
      });
    });
  }

  // Ubah tampilan tombol notifikasi saat toggle
  const notifBtn = document.getElementById("notifToggleBtn");
  if (notifBtn) {
    notifBtn.addEventListener("click", () => {
      const enabled = notifBtn.classList.contains("enabled");

      if (enabled) {
        notifBtn.classList.remove("enabled");
        notifBtn.classList.add("disabled");
        notifBtn.innerHTML = "🔔 Enable Notification";
      } else {
        notifBtn.classList.remove("disabled");
        notifBtn.classList.add("enabled");
        notifBtn.innerHTML = "🔕 Disable Notification";
      }
    });
  }
};

export default Navbar;
