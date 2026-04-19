"use client";

import { dbPromise } from "@/lib/idb";

export async function getClientsOffline() {
  const db = await dbPromise();
  const data = await db.getAll("clients");
  return data;
}

export async function getPropertiesOffline() {
  const db = await dbPromise();
  const data = await db.getAll("properties");
  return data;
}

export async function saveClients(clients: any[]) {
  const db = await dbPromise();
  const tx = db.transaction("clients", "readwrite");
  await tx.store.clear(); // 🧹 wipe everything
  for (const client of clients) {
    await tx.store.add(client);
  }
  await tx.done;
}

export async function saveProperties(properties: any[]) {
  try {
    const db = await dbPromise();
    const tx = db.transaction("properties", "readwrite");

    for (const property of properties) {
      await tx.store.add(property);
    }

    await tx.done;
  } catch (error) {
    console.error(error);
  }
}

export async function addPendingAction(action: any) {
  const db = await dbPromise();
  await db.add("pending", action);
}

export async function syncPendingActions() {
  const db = await dbPromise();
  const all = await db.getAll("pending");

  for (const action of all) {
    try {
      //   await fetch("/api/clients", {
      //     method: action.method,
      //     body: JSON.stringify(action.data),
      //   });

      // remove after success
      const tx = db.transaction("pending", "readwrite");
      await tx.store.delete(action.id);
      await tx.done;
    } catch (err) {
      console.log("Still offline, retry later");
    }
  }
}
