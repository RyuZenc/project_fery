// src/scripts/pages/about/about-page.js
const AboutPage = {
  async render() {
    const pageContent = `
      <section class="container profile-page view-transition-page">
        <h1>Profil Pengguna</h1>
        <div id="profileContent" class="profile-card"></div>
      </section>
    `;

    // ✅ Gunakan View Transition API dengan aman
    if (document.startViewTransition) {
      document.startViewTransition(() => {
        const app = document.querySelector("#app");
        if (app) app.innerHTML = pageContent;
      });
    } else {
      const app = document.querySelector("#app");
      if (app) app.innerHTML = pageContent;
    }

    // return untuk kompatibilitas dengan router SPA
    return pageContent;
  },

  async afterRender() {
    // Tunggu sedikit agar DOM benar-benar siap
    await new Promise((resolve) => setTimeout(resolve, 50));

    const user = JSON.parse(localStorage.getItem("user"));
    const profileContainer = document.querySelector("#profileContent");

    // ✅ Cegah error kalau elemen belum siap
    if (!profileContainer) {
      console.error("Elemen #profileContent belum siap di DOM!");
      return;
    }

    if (!user) {
      profileContainer.innerHTML = `
        <p>Anda belum login. Silakan <a href="#/login">login terlebih dahulu</a>.</p>
      `;
      return;
    }

    const savedPhoto = localStorage.getItem("profilePhoto");
    const avatarImage = savedPhoto
      ? savedPhoto
      : `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user.name
        )}&background=random&color=fff`;

    profileContainer.innerHTML = `
      <div class="profile-info" style="view-transition-name: profileCard">
        <img src="${avatarImage}" alt="Avatar" class="profile-avatar">
        <h2>${user.name}</h2>
        <p><strong>Email:</strong> ${user.email || "Tidak tersedia"}</p>
        <p><strong>Token:</strong> <span class="token-text">${user.token.slice(
          0,
          25
        )}...</span></p>

        <button id="editProfileBtn" class="btn-add-story" style="margin-top:16px;">Edit Profil</button>

        <form id="editProfileForm" class="form" style="display:none; margin-top:20px; flex-direction:column; gap:10px;">
          <label>Nama:</label>
          <input id="editName" type="text" value="${user.name}" required>
          
          <label>Email:</label>
          <input id="editEmail" type="email" value="${
            user.email || ""
          }" required>
          
          <label>Password Baru (opsional):</label>
          <input id="editPassword" type="password" placeholder="Isi jika ingin ubah password">

          <label>Foto Profil:</label>
          <input id="editPhoto" type="file" accept="image/*">
          <img id="previewPhoto" src="${avatarImage}" alt="Preview" class="profile-avatar" style="width:100px;height:100px;border-radius:50%;object-fit:cover;margin-top:10px;">

          <button type="submit" class="btn">Simpan Perubahan</button>
        </form>

        <p id="editMsg" style="margin-top:10px;"></p>
      </div>
    `;

    const editBtn = document.querySelector("#editProfileBtn");
    const editForm = document.querySelector("#editProfileForm");
    const msg = document.querySelector("#editMsg");
    const photoInput = document.querySelector("#editPhoto");
    const preview = document.querySelector("#previewPhoto");

    editBtn.addEventListener("click", () => {
      const toggle = () => {
        editForm.style.display =
          editForm.style.display === "none" ? "flex" : "none";
      };
      if (document.startViewTransition) {
        document.startViewTransition(toggle);
      } else {
        toggle();
      }
    });

    photoInput.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => (preview.src = reader.result);
        reader.readAsDataURL(file);
      }
    });

    editForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const newName = document.querySelector("#editName").value.trim();
      const newEmail = document.querySelector("#editEmail").value.trim();
      const newPassword = document.querySelector("#editPassword").value.trim();

      const updatedUser = { ...user, name: newName, email: newEmail };
      if (newPassword) updatedUser.password = newPassword;

      const updateProfile = () => {
        msg.style.color = "green";
        msg.textContent = "Profil berhasil diperbarui!";
        setTimeout(() => window.location.reload(), 1000);
      };

      if (photoInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = () => {
          localStorage.setItem("profilePhoto", reader.result);
          localStorage.setItem("user", JSON.stringify(updatedUser));
          if (document.startViewTransition) {
            document.startViewTransition(updateProfile);
          } else updateProfile();
        };
        reader.readAsDataURL(photoInput.files[0]);
      } else {
        localStorage.setItem("user", JSON.stringify(updatedUser));
        if (document.startViewTransition) {
          document.startViewTransition(updateProfile);
        } else updateProfile();
      }
    });
  },
};

export default AboutPage;
