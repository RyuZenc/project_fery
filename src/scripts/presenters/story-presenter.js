// src/scripts/presenters/story-presenter.js
import { StoryAPI } from "../data/story-api.js";

export class StoryPresenter {
  constructor(view) {
    this.view = view;
  }

  async loadStories(token) {
    try {
      const stories = await StoryAPI.getAllStories(token);
      if (this.view.showStories) {
        this.view.showStories(stories);
      }
    } catch (error) {
      this.view.showError(error.message);
    }
  }

  async addStory({ token, description, photo, lat, lon }) {
    try {
      await StoryAPI.addStory({ token, description, photo, lat, lon });
      this.view.showSuccess("Cerita berhasil dikirim!");
      if (this.view.resetForm) this.view.resetForm();
      if (this.view.refreshStories) this.view.refreshStories(); // aman, stub di view
    } catch (error) {
      this.view.showError(error.message);
    }
  }
}
