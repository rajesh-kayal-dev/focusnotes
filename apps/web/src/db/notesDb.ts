import { openDB } from "idb";
import type { Note } from "../features/notes/types";

const DB_NAME = "focusnotes";
const STORE_NAME = "notes";

const dbPromise = openDB(DB_NAME, 1, {
  upgrade(db) {
    if (!db.objectStoreNames.contains(STORE_NAME)) {
      db.createObjectStore(STORE_NAME, {
        keyPath: "id",
      });
    }
  },
});

export const getNotes = async (): Promise<Note[]> => {
  const db = await dbPromise;
  return db.getAll(STORE_NAME);
};

export const saveNote = async (note: Note): Promise<void> => {
  const db = await dbPromise;
  await db.put(STORE_NAME, note);
};

export const deleteNoteFromDb = async (
  id: string,
): Promise<void> => {
  const db = await dbPromise;
  await db.delete(STORE_NAME, id);
};