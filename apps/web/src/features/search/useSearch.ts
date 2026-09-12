import { useMemo, useState } from "react";
import type { Note } from "../notes/types";

const useSearch = (notes: Note[]) => {
  const [query, setQuery] = useState("");

  const filteredNotes = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    if (!trimmed) {
      return notes;
    }

    return notes.filter((note) => {
      const titleMatch = note.title.toLowerCase().includes(trimmed);
      const contentMatch = note.content.toLowerCase().includes(trimmed);
      return titleMatch || contentMatch;
    });
  }, [notes, query]);

  return {
    query,
    setQuery,
    filteredNotes,
  };
};

export default useSearch;
