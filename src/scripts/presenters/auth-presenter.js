// src/scripts/presenters/auth-presenter.js
import { StoryAPI } from "../data/story-api.js";

export class AuthPresenter {
  constructor(view) {
    this.view = view;
  }

  // 🔒 Login User
  async login(email, password) {
    // Validasi dasar
    if (!email || !password) {
      this.view.showError("Email dan password wajib diisi!");
      return;
    }

    // Validasi format email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.view.showError("Format email tidak valid!");
      return;
    }

    try {
      this.view.showLoading("Sedang memproses login...");

      const result = await StoryAPI.login(email, password);
      const user = {
        name: result.loginResult.name,
        email,
        token: result.loginResult.token,
      };

      // Simpan user dengan aman
      localStorage.setItem("user", JSON.stringify(user));

      this.view.hideLoading();
      this.view.showSuccess("Login berhasil! Selamat datang, " + user.name);
      this.view.navigateToHome();
    } catch (error) {
      this.view.hideLoading();
      this.view.showError(
        "Login gagal: " + (error.message || "Terjadi kesalahan")
      );
    }
  }

  // 🧾 Register User
  async register(name, email, password) {
    // Validasi dasar
    if (!name || !email || !password) {
      this.view.showError("Semua kolom wajib diisi!");
      return;
    }

    // Validasi format email
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      this.view.showError("Format email tidak valid!");
      return;
    }

    // Validasi panjang password
    if (password.length < 6) {
      this.view.showError("Password minimal 6 karakter!");
      return;
    }

    try {
      this.view.showLoading("Membuat akun, harap tunggu...");

      await StoryAPI.register(name, email, password);

      this.view.hideLoading();
      this.view.showSuccess("Akun berhasil dibuat! Silakan login.");
      this.view.navigateToLogin();
    } catch (error) {
      this.view.hideLoading();
      this.view.showError(
        "Gagal daftar: " + (error.message || "Terjadi kesalahan")
      );
    }
  }

  // 🚪 Logout User
  logout() {
    localStorage.removeItem("user");
    this.view.showSuccess("Anda telah logout.");
    this.view.navigateToLogin();
  }

  // 👤 Ambil User Aktif
  getCurrentUser() {
    const user = localStorage.getItem("user");
    return user ? JSON.parse(user) : null;
  }
}
