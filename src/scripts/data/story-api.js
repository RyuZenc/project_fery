const BASE_URL = "https://story-api.dicoding.dev/v1";

export const StoryAPI = {
  // 🔹 REGISTER
  async register(name, email, password) {
    const response = await fetch(`${BASE_URL}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const result = await response.json();
    if (!result.error) return result;
    throw new Error(result.message);
  },

  // 🔹 LOGIN
  async login(email, password) {
    const response = await fetch(`${BASE_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const result = await response.json();
    if (!result.error) return result;
    throw new Error(result.message);
  },

  // 🔹 GET STORIES (dengan pagination, maksimal 200 data)
  async getAllStories(token) {
    const allStories = [];
    let page = 1;
    const size = 20;
    let hasMore = true;
    const maxStories = 100; // batas maksimal data yang diambil

    while (hasMore && allStories.length < maxStories) {
      const response = await fetch(
        `${BASE_URL}/stories?page=${page}&size=${size}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const result = await response.json();
      if (result.error) throw new Error(result.message);

      if (result.listStory && result.listStory.length > 0) {
        allStories.push(...result.listStory);
        page++;

        // Jika sudah mencapai 200 data, hentikan loop
        if (allStories.length >= maxStories) {
          allStories.length = maxStories; // pastikan tidak lebih dari 200
          hasMore = false;
        }
      } else {
        hasMore = false;
      }
    }

    return allStories;
  },

  // 🔹 ADD STORY
  async addStory({ token, description, photo, lat, lon }) {
    const formData = new FormData();
    formData.append("description", description);
    formData.append("photo", photo);

    // Tambahkan lokasi jika ada
    if (lat !== undefined && lon !== undefined) {
      formData.append("lat", lat);
      formData.append("lon", lon);
    }

    const response = await fetch(`${BASE_URL}/stories`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        // 'Content-Type' jangan diset, biarkan browser otomatis karena pakai FormData
      },
      body: formData,
    });

    const result = await response.json();
    if (!result.error) return result;
    throw new Error(result.message);
  },

  // 🔹 DETAIL STORY
  async getDetailStory(id) {
    const user = JSON.parse(localStorage.getItem("user"));
    const token = user?.token;
    if (!token) throw new Error("Token tidak ditemukan, silakan login ulang.");

    const response = await fetch(`${BASE_URL}/stories/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await response.json();
    if (!result.error) return result;
    throw new Error(result.message);
  },
};
