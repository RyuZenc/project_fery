import { openDB } from "idb";

const DATABASE_NAME = "story-db";
const DATABASE_VERSION = 1;

const OBJECT_STORE_NAME = "stories";
const PENDING_STORE_NAME = "pending-stories";

const dbPromise = openDB(DATABASE_NAME, DATABASE_VERSION, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(OBJECT_STORE_NAME)) {
      db.createObjectStore(OBJECT_STORE_NAME, {
        keyPath: "id",
        autoIncrement: true,
      });
    }

    if (!db.objectStoreNames.contains(PENDING_STORE_NAME)) {
      db.createObjectStore(PENDING_STORE_NAME, {
        keyPath: "tempId",
        autoIncrement: true,
      });
    }
  },
});

export const IdbStories = {
  /** ==============================
   *  STORIES (Data utama)
   *  ============================== */
  async getAll() {
    return (await dbPromise).getAll(OBJECT_STORE_NAME);
  },

  async putStory(story) {
    return (await dbPromise).put(OBJECT_STORE_NAME, story);
  },

  async deleteStory(id) {
    return (await dbPromise).delete(OBJECT_STORE_NAME, id);
  },

  /** ==============================
   *  PENDING STORIES (Offline mode)
   *  ============================== */
  async getPending() {
    return (await dbPromise).getAll(PENDING_STORE_NAME);
  },

  async addPending(story) {
    return (await dbPromise).add(PENDING_STORE_NAME, story);
  },

  async deletePendingStory(tempId) {
    return (await dbPromise).delete(PENDING_STORE_NAME, tempId);
  },

  async clearPending() {
    const db = await dbPromise;
    const tx = db.transaction(PENDING_STORE_NAME, "readwrite");
    await tx.store.clear();
    return tx.done;
  },
};
