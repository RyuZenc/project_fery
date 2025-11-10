import { AuthPresenter } from "../../presenters/auth-presenter.js";

const LoginPage = {
  async render() {
    return `
      <section class="auth-section">
        <h1>Login Akun</h1>
        <form id="loginForm" class="form">
          <label for="email">Email:</label>
          <input id="email" name="email" type="email" placeholder="Masukkan email" required />

          <label for="password">Password:</label>
          <input id="password" name="password" type="password" placeholder="Masukkan password" required />

          <button type="submit" class="btn">Masuk</button>
        </form>

        <div id="loading" style="display:none;">Sedang memproses...</div>
        <p id="loginMsg"></p>

        <p>Belum punya akun?
          <a href="#/register">Daftar Sekarang</a>
        </p>
      </section>
    `;
  },

  async afterRender() {
    const form = document.querySelector("#loginForm");
    const msg = document.querySelector("#loginMsg");
    const loading = document.querySelector("#loading");

    if (!form) return console.error("❌ Elemen form login tidak ditemukan!");

    const presenter = new AuthPresenter(this);

    form.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = form.email.value.trim();
      const password = form.password.value.trim();

      loading.style.display = "block";
      msg.textContent = "";

      await presenter.login(email, password);
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
    const msg = document.querySelector("#loginMsg");
    msg.className = "success";
    msg.textContent = message;
  },

  showError(message) {
    this.hideLoading();
    const msg = document.querySelector("#loginMsg");
    msg.className = "error";
    msg.textContent = message;
  },

  navigateToHome() {
    setTimeout(() => {
      window.location.hash = "/";
    }, 1500);
  },
};

export default LoginPage;
