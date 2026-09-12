import { useState } from "react";
import type { Note } from "./types";

type NoteItemProps = {
  note: Note;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
};

const NoteItem = ({
  note,
  isActive,
  onSelect,
  onDelete,
}: NoteItemProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div
      className={`group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
        isActive
          ? "bg-white/10 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      <button
        type="button"
        onClick={() => onSelect(note.id)}
        className="min-w-0 flex-1 truncate text-left"
      >
        {note.title}
      </button>

      <button
        type="button"
        onClick={() => setIsMenuOpen((open) => !open)}
        className="rounded-md px-2 py-1 text-slate-500 opacity-0 transition group-hover:opacity-100 hover:bg-white/10 hover:text-white"
      >
        ...
      </button>

      {isMenuOpen && (
        <div className="absolute right-2 top-10 z-10 w-32 rounded-lg border border-white/10 bg-slate-900 p-1 shadow-xl">
          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
            }}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Rename
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              onDelete(note.id);
            }}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-red-400 hover:bg-white/5"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
};

export default NoteItem;