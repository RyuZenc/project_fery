// src/scripts/utils/db.js
import { openDB } from "idb";

const DB_NAME = "story-app-db";
const STORE_NAME = "stories";
const PENDING_STORE = "pending";

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, { keyPath: "id" });
    }
    if (!db.objectStoreNames.contains(PENDING_STORE)) {
      db.createObjectStore(PENDING_STORE, {
        keyPath: "tempId",
        autoIncrement: true,
      });
    }
  },
});

// ===== CRUD dari API ke IndexedDB =====

// Create (simpan story dari API)
export const saveStories = async (stories) => {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, "readwrite");
  stories.forEach((story) => tx.store.put(story));
  await tx.done;
};

// Read (tampilkan story offline)
export const getStories = async () => {
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
};

// Delete semua (optional)
export const clearStories = async () => {
  const db = await dbPromise;
  const tx = db.transaction(STORE_NAME, "readwrite");
  await tx.store.clear();
  await tx.done;
};

// ===== Pending untuk Offline Sync =====
export const addPending = async (data) => {
  const db = await dbPromise;
  const tx = db.transaction(PENDING_STORE, "readwrite");
  await tx.store.add(data);
  await tx.done;
};

export const getPending = async () => {
  const db = await dbPromise;
  return db.getAll(PENDING_STORE);
};

export const clearPending = async () => {
  const db = await dbPromise;
  const tx = db.transaction(PENDING_STORE, "readwrite");
  await tx.store.clear();
  await tx.done;
};
