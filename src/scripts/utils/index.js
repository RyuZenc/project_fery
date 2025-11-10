/**
 * Format tanggal ke bentuk yang lebih manusiawi.
 * Contoh output: 24 October 2025
 */
export function showFormattedDate(date, locale = "id-ID", options = {}) {
  return new Date(date).toLocaleDateString(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  });
}

/**
 * Fungsi delay untuk simulasi loading (ms).
 * Bisa dipakai saat menunggu fetch API atau transisi halaman.
 */
export function sleep(time = 1000) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

/**
 * Fungsi transisi halaman (fade-in / fade-out)
 * Digunakan untuk implementasi custom transition view (kriteria SPA)
 */
export async function pageTransition(contentElement, newContentHTML) {
  contentElement.classList.add("fade-out");
  await sleep(300); // waktu animasi keluar
  contentElement.innerHTML = newContentHTML;
  contentElement.classList.remove("fade-out");
  contentElement.classList.add("fade-in");
  await sleep(300); // waktu animasi masuk
  contentElement.classList.remove("fade-in");
}

/**
 * Membantu fokus langsung ke konten utama (aksesibilitas)
 * Akan dipakai untuk fitur "Skip to Content"
 */
export function skipToContent() {
  const main = document.querySelector("main");
  if (main) {
    main.setAttribute("tabindex", "-1");
    main.focus();
  }
}

/**
 * Fungsi sederhana untuk menampilkan pesan (berhasil / gagal)
 * Bisa dipakai saat tambah data atau fetch API error
 */
export function showToast(message, type = "info") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);

  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}
