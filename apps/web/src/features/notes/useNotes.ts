import { useEffect, useState } from "react";
import type { Note } from "./types";
import {
  deleteNoteFromDb,
  getNotes,
  saveNote,
} from "../../db/notesDb";

const createNote = (): Note => {
  const now = Date.now();

  return {
    id: crypto.randomUUID(),
    title: "Untitled Note",
    content: "",
    createdAt: now,
    updatedAt: now,
  };
};

const useNotes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadNotes = async () => {
      try {
        const storedNotes = await getNotes();

        if (storedNotes.length > 0) {
          setNotes(storedNotes);
          setActiveNoteId(storedNotes[0].id);
          return;
        }

        const note = createNote();

        await saveNote(note);

        setNotes([note]);
        setActiveNoteId(note.id);
      } catch (error) {
        console.error("Failed to load notes:", error);

        const note = createNote();

        setNotes([note]);
        setActiveNoteId(note.id);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotes();
  }, []);

  const activeNote = notes.find(
    (note) => note.id === activeNoteId,
  );

  const addNote = async () => {
    const note = createNote();

    try {
      await saveNote(note);

      setNotes((currentNotes) => [note, ...currentNotes]);
      setActiveNoteId(note.id);
    } catch (error) {
      console.error("Failed to create note:", error);
    }
  };

  const updateNote = (
    id: string,
    updates: Partial<Pick<Note, "title" | "content">>,
  ) => {
    setNotes((currentNotes) =>
      currentNotes.map((note) => {
        if (note.id !== id) {
          return note;
        }

        const updatedNote = {
          ...note,
          ...updates,
          updatedAt: Date.now(),
        };

        void saveNote(updatedNote).catch((error) => {
          console.error("Failed to save note:", error);
        });

        return updatedNote;
      }),
    );
  };

  const deleteNote = async (id: string) => {
    try {
      await deleteNoteFromDb(id);

      setNotes((currentNotes) => {
        const updatedNotes = currentNotes.filter(
          (note) => note.id !== id,
        );

        if (id === activeNoteId) {
          setActiveNoteId(updatedNotes[0]?.id ?? null);
        }

        return updatedNotes;
      });
    } catch (error) {
      console.error("Failed to delete note:", error);
    }
  };

  const duplicateNote = async (id: string) => {
    const targetNote = notes.find((note) => note.id === id);
    if (!targetNote) {
      return;
    }

    const now = Date.now();
    const duplicate: Note = {
      id: crypto.randomUUID(),
      title: `${targetNote.title} (Copy)`,
      content: targetNote.content,
      createdAt: now,
      updatedAt: now,
    };

    try {
      await saveNote(duplicate);
      setNotes((currentNotes) => [duplicate, ...currentNotes]);
      setActiveNoteId(duplicate.id);
    } catch (error) {
      console.error("Failed to duplicate note:", error);
    }
  };

  return {
    notes,
    activeNote,
    activeNoteId,
    setActiveNoteId,
    addNote,
    updateNote,
    deleteNote,
    duplicateNote,
    isLoading,
  };
};

export default useNotes;