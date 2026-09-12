import { useEffect, useRef } from "react";
import type { SearchDialogProps } from "./search.types";
import useSearch from "./useSearch";

const SearchDialog = ({
  isOpen,
  onClose,
  notes,
  onSelectNote,
}: SearchDialogProps) => {
  const { query, setQuery, filteredNotes } = useSearch(notes);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      const timer = setTimeout(() => {
        inputRef.current?.focus();
      }, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, setQuery]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const handleSelect = (id: string) => {
    onSelectNote(id);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-zinc-950/80 backdrop-blur-sm px-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl rounded-xl border border-white/10 bg-zinc-900 shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center border-b border-white/10 px-4 py-3">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search notes by title or content..."
            className="flex-1 bg-transparent text-zinc-100 placeholder-zinc-500 text-sm outline-none"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              className="text-xs text-zinc-400 hover:text-zinc-100 px-2 py-1 transition"
            >
              Clear
            </button>
          )}

          <button
            type="button"
            onClick={onClose}
            className="ml-2 text-xs text-zinc-400 hover:text-zinc-100 border border-white/10 rounded px-2 py-1 transition"
          >
            Esc
          </button>
        </div>

        <div className="overflow-y-auto p-2 space-y-1">
          {filteredNotes.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-500">
              No notes found matching "{query}"
            </div>
          ) : (
            filteredNotes.map((note) => {
              const snippet = note.content
                ? note.content.slice(0, 120).replace(/[\r\n]+/g, " ")
                : "No content";

              return (
                <button
                  key={note.id}
                  type="button"
                  onClick={() => handleSelect(note.id)}
                  className="w-full text-left p-3 rounded-lg hover:bg-white/5 transition flex flex-col gap-1 group border border-transparent hover:border-white/5"
                >
                  <span className="text-sm font-medium text-zinc-100 group-hover:text-blue-400 transition truncate">
                    {note.title || "Untitled Note"}
                  </span>
                  <span className="text-xs text-zinc-400 line-clamp-2 leading-relaxed">
                    {snippet}
                  </span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchDialog;
