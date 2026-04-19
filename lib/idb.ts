"use client";

import { openDB } from "idb";

export const dbPromise = async () => {
  if (typeof window === "undefined") {
    throw new Error("IndexedDB not available on server");
  }

  return openDB("crm-db", 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("clients")) {
        db.createObjectStore("clients", { keyPath: "id" });
      }

      if (!db.objectStoreNames.contains("pending")) {
        db.createObjectStore("pending", { autoIncrement: true });
      }
      if (!db.objectStoreNames.contains("properties")) {
        db.createObjectStore("properties", { autoIncrement: true });
      }
    },
  });
};
