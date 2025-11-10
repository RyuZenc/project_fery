import { AuthPresenter } from "../../presenters/auth-presenter.js";

const RegisterPage = {
  async render() {
    return `
      <section class="auth-section">
        <h1>Daftar Akun Baru</h1>
        <form id="registerForm" class="form">
          <label for="name">Nama Lengkap:</label>
          <input id="name" name="name" type="text" placeholder="Masukkan nama" required />

          <label for="email">Email:</label>
          <input id="email" name="email" type="email" placeholder="Masukkan email" required />

          <label for="password">Password:</label>
          <input id="password" name="password" type="password" placeholder="Masukkan password" required />

          <button type="submit" class="btn">Daftar</button>
        </form>

        <div id="loading" style="display:none;">Sedang memproses...</div>
        <p id="registerMsg"></p>

        <p>Sudah punya akun?
          <a href="#/login">Masuk di sini</a>
        </p>
      </section>
    `;
  },

  async afterRender() {
    const form = document.querySelector("#registerForm");
    const msg = document.querySelector("#registerMsg");
    const loading = document.querySelector("#loading");

    if (!form) return console.error("❌ Elemen form register tidak ditemukan!");

    const presenter = new AuthPresenter(this);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const password = form.password.value.trim();

      loading.style.display = "block";
      msg.textContent = "";

      await presenter.register(name, email, password);
    });
  },

  showLoading() {
    document.querySelector("#loading").style.display = "block";
  },

  hideLoading() {
    document.querySelector("#loading").style.display = "none";
  },

  showSuccess(message) {
    this.hideLoading();
    const msg = document.querySelector("#registerMsg");
    msg.className = "success";
    msg.textContent = message;
  },

  showError(message) {
    this.hideLoading();
    const msg = document.querySelector("#registerMsg");
    msg.className = "error";
    msg.textContent = message;
  },

  navigateToLogin() {
    setTimeout(() => {
      window.location.hash = "/login";
    }, 1500);
  },
};

export default RegisterPage;
