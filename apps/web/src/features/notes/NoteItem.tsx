import { useEffect, useRef, useState } from "react";
import type { Note } from "./types";

type NoteItemProps = {
  note: Note;
  isActive: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onRename?: (id: string, newTitle: string) => void;
  onDuplicate?: (id: string) => void;
};

const NoteItem = ({
  note,
  isActive,
  onSelect,
  onDelete,
  onRename,
  onDuplicate,
}: NoteItemProps) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [prevTitle, setPrevTitle] = useState(note.title);
  const [titleInput, setTitleInput] = useState(note.title);
  const inputRef = useRef<HTMLInputElement>(null);

  if (note.title !== prevTitle) {
    setPrevTitle(note.title);
    setTitleInput(note.title);
  }

  useEffect(() => {
    if (isEditing) {
      inputRef.current?.focus();
      inputRef.current?.select();
    }
  }, [isEditing]);

  const handleSave = () => {
    setIsEditing(false);
    const trimmed = titleInput.trim();
    const finalTitle = trimmed || note.title;
    setTitleInput(finalTitle);

    if (finalTitle !== note.title && onRename) {
      onRename(note.id, finalTitle);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      handleSave();
    } else if (event.key === "Escape") {
      setTitleInput(note.title);
      setIsEditing(false);
    }
  };

  return (
    <div
      className={`group relative flex items-center justify-between rounded-lg px-3 py-2 text-sm transition ${
        isActive
          ? "bg-white/10 text-white"
          : "text-slate-400 hover:bg-white/5 hover:text-white"
      }`}
    >
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={titleInput}
          onChange={(event) => setTitleInput(event.target.value)}
          onBlur={handleSave}
          onKeyDown={handleKeyDown}
          className="min-w-0 flex-1 rounded bg-slate-800 px-2 py-0.5 text-sm text-white outline-none ring-1 ring-white/20"
        />
      ) : (
        <button
          type="button"
          onClick={() => onSelect(note.id)}
          className="min-w-0 flex-1 truncate text-left"
        >
          {note.title}
        </button>
      )}

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
              setIsEditing(true);
            }}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Rename
          </button>

          <button
            type="button"
            onClick={() => {
              setIsMenuOpen(false);
              if (onDuplicate) {
                onDuplicate(note.id);
              }
            }}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Duplicate
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